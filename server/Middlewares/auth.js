const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const authHeader = req.header('Authorization');
  console.log('Auth header:', authHeader);
  
  const token = authHeader?.replace('Bearer ', '');
  console.log('Extracted token:', token ? 'Token present' : 'No token');

  if (!token) {
    console.log('No token found in request');
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token decoded successfully, user:', decoded);
    req.user = decoded;
    next();
  } catch (err) {
    console.log('Token verification failed:', err.message);
    res.status(401).json({ message: 'Token is not valid' });
  }
};