const { google } = require('googleapis');
const User = require('../Models/User');
const CryptoJS = require('crypto-js');

// Encryption key from environment variable
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'your-secret-encryption-key-change-in-production';

// Encrypt sensitive data before storing
const encrypt = (text) => {
  return CryptoJS.AES.encrypt(text, ENCRYPTION_KEY).toString();
};

// Decrypt sensitive data when retrieving
const decrypt = (encryptedText) => {
  const bytes = CryptoJS.AES.decrypt(encryptedText, ENCRYPTION_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
};

// OAuth2 client configuration
const getOAuth2Client = () => {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
};

// Generate Google OAuth URL
const getAuthUrl = async (req, res) => {
  try {
    // Validate Google credentials are configured
    if (!process.env.GOOGLE_CLIENT_ID || 
        !process.env.GOOGLE_CLIENT_SECRET || 
        process.env.GOOGLE_CLIENT_ID === 'your_google_client_id_here' ||
        process.env.GOOGLE_CLIENT_SECRET === 'your_google_client_secret_here') {
      return res.status(503).json({ 
        message: 'Google Calendar integration is not configured. Please set up Google OAuth credentials in the .env file.',
        configured: false
      });
    }

    const oauth2Client = getOAuth2Client();
    
    // State parameter includes user ID for security
    const state = JSON.stringify({ userId: req.user.userId });
    
    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline', // Request offline access for refresh token
      scope: [
        'openid',
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/calendar.readonly',
        'https://www.googleapis.com/auth/calendar.events'
      ],
      state: state,
      prompt: 'consent' // Force consent screen to ensure refresh token is provided
    });

    res.json({ authUrl });
  } catch (error) {
    console.error('Error generating auth URL:', error);
    res.status(500).json({ message: 'Failed to generate authorization URL' });
  }
};

// Handle OAuth callback and exchange code for tokens
const handleCallback = async (req, res) => {
  try {
    const { code, state } = req.query;

    if (!code) {
      return res.send(`
        <html>
          <body>
            <h2>Authorization failed - no code provided</h2>
            <p>You can close this window.</p>
            <script>window.close();</script>
          </body>
        </html>
      `);
    }

    // Verify state parameter and extract userId
    let userId;
    try {
      const stateData = JSON.parse(state);
      userId = stateData.userId;
    } catch (err) {
      return res.send(`
        <html>
          <body>
            <h2>Invalid state parameter</h2>
            <p>You can close this window.</p>
            <script>window.close();</script>
          </body>
        </html>
      `);
    }

    const oauth2Client = getOAuth2Client();
    
    // Exchange authorization code for tokens
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Verify and decode the ID token to get user email
    const ticket = await oauth2Client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    const payload = ticket.getPayload();
    const userEmail = payload.email;

    // Encrypt tokens before storing (security best practice)
    const encryptedAccessToken = encrypt(tokens.access_token);
    const encryptedRefreshToken = tokens.refresh_token ? encrypt(tokens.refresh_token) : null;

    // Validate that we received a refresh token
    if (!tokens.refresh_token) {
      console.warn('No refresh token received. User may have already authorized the app.');
      // Still proceed with access token, but log warning
    }

    // Update user record with encrypted tokens
    await User.findByIdAndUpdate(userId, {
      googleCalendar: {
        connected: true,
        accessToken: encryptedAccessToken,
        refreshToken: encryptedRefreshToken,
        tokenExpiry: new Date(tokens.expiry_date),
        email: userEmail
      }
    });

    console.log(`✅ Google Calendar connected for user ${userId} (${userEmail})`);
    console.log(`   Refresh token ${tokens.refresh_token ? 'received' : 'NOT received'}`);

    // Return success page that closes the popup
    res.send(`
      <html>
        <head>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
              display: flex;
              align-items: center;
              justify-content: center;
              height: 100vh;
              margin: 0;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
            }
            .container {
              text-align: center;
              background: white;
              color: #333;
              padding: 40px;
              border-radius: 10px;
              box-shadow: 0 10px 40px rgba(0,0,0,0.2);
            }
            .success-icon {
              font-size: 60px;
              margin-bottom: 20px;
            }
            h2 { margin: 0 0 10px 0; }
            p { color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="success-icon">✅</div>
            <h2>Google Calendar Connected!</h2>
            <p>Connected as: ${userEmail}</p>
            <p style="margin-top: 20px; font-size: 14px;">This window will close automatically...</p>
          </div>
          <script>
            setTimeout(() => {
              window.close();
            }, 2000);
          </script>
        </body>
      </html>
    `);
  } catch (error) {
    console.error('OAuth callback error:', error);
    res.send(`
      <html>
        <body>
          <h2>Connection failed</h2>
          <p>Error: ${error.message}</p>
          <p>You can close this window.</p>
          <script>
            setTimeout(() => {
              window.close();
            }, 3000);
          </script>
        </body>
      </html>
    `);
  }
};

// Disconnect Google Calendar
const disconnect = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.userId, {
      googleCalendar: {
        connected: false,
        accessToken: null,
        refreshToken: null,
        tokenExpiry: null,
        email: null
      }
    });

    res.json({ success: true, message: 'Google Calendar disconnected' });
  } catch (error) {
    console.error('Disconnect error:', error);
    res.status(500).json({ message: 'Failed to disconnect Google Calendar' });
  }
};

// Get connection status
const getStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    
    res.json({
      connected: user.googleCalendar?.connected || false,
      googleEmail: user.googleCalendar?.email || null
    });
  } catch (error) {
    console.error('Status check error:', error);
    res.status(500).json({ message: 'Failed to check connection status' });
  }
};

// Helper function to refresh access token if expired or about to expire
const refreshAccessToken = async (user) => {
  try {
    console.log(`🔄 Refreshing access token for user ${user._id}...`);
    
    if (!user.googleCalendar?.refreshToken) {
      throw new Error('No refresh token available. User needs to re-authenticate.');
    }

    const oauth2Client = getOAuth2Client();
    
    // Decrypt refresh token before using
    const decryptedRefreshToken = decrypt(user.googleCalendar.refreshToken);
    
    oauth2Client.setCredentials({
      refresh_token: decryptedRefreshToken
    });

    // Request new access token
    const { credentials } = await oauth2Client.refreshAccessToken();
    
    // Encrypt new access token
    const encryptedAccessToken = encrypt(credentials.access_token);
    
    // Update user with new access token and expiry
    await User.findByIdAndUpdate(user._id, {
      'googleCalendar.accessToken': encryptedAccessToken,
      'googleCalendar.tokenExpiry': new Date(credentials.expiry_date)
    });

    console.log(`✅ Access token refreshed successfully for user ${user._id}`);
    
    return credentials.access_token; // Return decrypted token for immediate use
  } catch (error) {
    console.error('❌ Error refreshing access token:', error.message);
    
    // If refresh token is invalid/expired, mark as disconnected
    if (error.message.includes('invalid_grant')) {
      await User.findByIdAndUpdate(user._id, {
        'googleCalendar.connected': false
      });
      throw new Error('Refresh token expired. Please reconnect your Google Calendar.');
    }
    
    throw error;
  }
};

// Get authenticated Calendar API client with automatic token refresh
const getCalendarClient = async (userId) => {
  const user = await User.findById(userId);
  
  if (!user.googleCalendar?.connected) {
    throw new Error('Google Calendar not connected');
  }

  const oauth2Client = getOAuth2Client();
  
  // Check if token is expired or about to expire (within 5 minutes)
  const now = new Date();
  const expiry = new Date(user.googleCalendar.tokenExpiry);
  const bufferTime = 5 * 60 * 1000; // 5 minutes in milliseconds
  
  let accessToken;
  
  if (now.getTime() >= (expiry.getTime() - bufferTime)) {
    // Token expired or about to expire, refresh it automatically
    console.log('⏰ Access token expired or expiring soon, refreshing...');
    accessToken = await refreshAccessToken(user);
  } else {
    // Token still valid, decrypt and use
    accessToken = decrypt(user.googleCalendar.accessToken);
  }
  
  // Decrypt refresh token for OAuth client
  const refreshToken = user.googleCalendar.refreshToken ? 
    decrypt(user.googleCalendar.refreshToken) : null;
  
  oauth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken
  });

  return google.calendar({ version: 'v3', auth: oauth2Client });
};

// Fetch upcoming events
const getEvents = async (req, res) => {
  try {
    const calendar = await getCalendarClient(req.user.userId);
    
    const { timeMin, timeMax, maxResults = 50 } = req.query;
    
    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: timeMin || new Date().toISOString(),
      timeMax: timeMax,
      maxResults: parseInt(maxResults),
      singleEvents: true,
      orderBy: 'startTime'
    });

    const events = response.data.items.map(event => ({
      id: event.id,
      title: event.summary,
      description: event.description,
      start: event.start.dateTime || event.start.date,
      end: event.end.dateTime || event.end.date,
      location: event.location,
      attendees: event.attendees,
      htmlLink: event.htmlLink,
      reminders: event.reminders,
      isAllDay: !event.start.dateTime
    }));

    res.json({ events });
  } catch (error) {
    console.error('Error fetching events:', error);
    
    // Handle specific error cases
    if (error.message.includes('not connected')) {
      return res.status(401).json({ 
        message: 'Google Calendar not connected',
        reconnectRequired: true 
      });
    }
    
    if (error.message.includes('Refresh token expired')) {
      return res.status(401).json({ 
        message: 'Google Calendar session expired. Please reconnect.',
        reconnectRequired: true 
      });
    }
    
    res.status(500).json({ message: 'Failed to fetch calendar events' });
  }
};

// Get today's events
const getTodayEvents = async (req, res) => {
  try {
    const calendar = await getCalendarClient(req.user.userId);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: today.toISOString(),
      timeMax: tomorrow.toISOString(),
      singleEvents: true,
      orderBy: 'startTime'
    });

    const events = response.data.items.map(event => ({
      id: event.id,
      title: event.summary,
      description: event.description,
      start: event.start.dateTime || event.start.date,
      end: event.end.dateTime || event.end.date,
      location: event.location,
      isAllDay: !event.start.dateTime
    }));

    res.json({ events, count: events.length });
  } catch (error) {
    console.error('Error fetching today events:', error);
    
    // Handle specific error cases
    if (error.message.includes('not connected') || error.message.includes('Refresh token expired')) {
      return res.status(401).json({ 
        message: 'Please reconnect your Google Calendar',
        reconnectRequired: true 
      });
    }
    
    res.status(500).json({ message: 'Failed to fetch today\'s events' });
  }
};

// Create new event in Google Calendar
const createEvent = async (req, res) => {
  try {
    const calendar = await getCalendarClient(req.user.userId);
    
    const { title, description, start, end, location, reminders } = req.body;

    if (!title || !start || !end) {
      return res.status(400).json({ 
        message: 'Title, start time, and end time are required' 
      });
    }

    // Ensure datetime is in proper RFC3339 format
    const formatDateTime = (dateTimeStr) => {
      const date = new Date(dateTimeStr);
      return date.toISOString();
    };

    const event = {
      summary: title,
      description: description,
      location: location,
      start: {
        dateTime: formatDateTime(start),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      end: {
        dateTime: formatDateTime(end),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
      reminders: reminders || {
        useDefault: true
      }
    };

    const response = await calendar.events.insert({
      calendarId: 'primary',
      resource: event
    });

    res.json({ 
      success: true, 
      event: {
        id: response.data.id,
        title: response.data.summary,
        start: response.data.start.dateTime,
        end: response.data.end.dateTime,
        htmlLink: response.data.htmlLink
      }
    });
  } catch (error) {
    console.error('Error creating event:', error);
    
    // Handle specific error cases
    if (error.message.includes('not connected') || error.message.includes('Refresh token expired')) {
      return res.status(401).json({ 
        message: 'Please reconnect your Google Calendar',
        reconnectRequired: true 
      });
    }
    
    res.status(500).json({ message: 'Failed to create calendar event' });
  }
};

// Clean up undefined or invalid events
const cleanupUndefinedEvents = async (req, res) => {
  try {
    const calendar = await getCalendarClient(req.user.userId);
    
    console.log('🧹 Starting cleanup of undefined events...');
    
    // Fetch all events from the past 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const sixMonthsLater = new Date();
    sixMonthsLater.setMonth(sixMonthsLater.getMonth() + 6);
    
    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: sixMonthsAgo.toISOString(),
      timeMax: sixMonthsLater.toISOString(),
      maxResults: 2500,
      singleEvents: true
    });

    const events = response.data.items || [];
    const eventsToDelete = [];
    
    // Find events with undefined, empty, or "undefined" as title
    for (const event of events) {
      const summary = event.summary || '';
      
      if (!summary || 
          summary.trim() === '' || 
          summary.toLowerCase() === 'undefined' ||
          summary === 'null' ||
          summary === 'Class' && !event.description) {
        eventsToDelete.push({
          id: event.id,
          title: summary || '(empty)',
          start: event.start.dateTime || event.start.date
        });
      }
    }
    
    console.log(`Found ${eventsToDelete.length} undefined events to delete`);
    
    // Delete each undefined event
    let deletedCount = 0;
    let failedCount = 0;
    
    for (const event of eventsToDelete) {
      try {
        await calendar.events.delete({
          calendarId: 'primary',
          eventId: event.id
        });
        console.log(`✅ Deleted: ${event.title} (${event.start})`);
        deletedCount++;
      } catch (deleteError) {
        console.error(`❌ Failed to delete event ${event.id}:`, deleteError.message);
        failedCount++;
      }
    }
    
    console.log(`🎉 Cleanup complete: ${deletedCount} deleted, ${failedCount} failed`);
    
    res.json({ 
      success: true, 
      deleted: deletedCount,
      failed: failedCount,
      total: eventsToDelete.length,
      message: `Successfully deleted ${deletedCount} undefined events`
    });
  } catch (error) {
    console.error('Error cleaning up events:', error);
    
    if (error.message.includes('not connected') || error.message.includes('Refresh token expired')) {
      return res.status(401).json({ 
        message: 'Please reconnect your Google Calendar',
        reconnectRequired: true 
      });
    }
    
    res.status(500).json({ message: 'Failed to cleanup events' });
  }
};

module.exports = {
  getAuthUrl,
  handleCallback,
  disconnect,
  getStatus,
  getEvents,
  getTodayEvents,
  createEvent,
  cleanupUndefinedEvents
};
