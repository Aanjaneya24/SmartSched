# 🎯 Smart Sched

A **MERN stack task management and scheduling application** with authentication, progress tracking, and productivity analytics.

## 🚀 Features

- ✅ **Task Management** - Create, edit, delete, and complete tasks with priority and categories
- 📊 **Progress Tracking** - Daily/monthly progress wheels, streak tracking, and category analytics  
- 📈 **Visual Charts** - Weekly completion charts and productivity insights
- 🔐 **User Authentication** - JWT-based secure login/signup
- 📱 **Responsive Design** - Works on desktop and mobile devices
- 🎨 **Modern UI** - Built with Tailwind CSS and Heroicons

## 🛠️ Tech Stack

**Frontend:**
- React.js
- Tailwind CSS
- Axios
- Recharts (for charts)
- React Router DOM
- Heroicons

**Backend:**
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- bcrypt for password hashing
- express-validator

## 📦 Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- Git

### Setup

1. **Clone the repository**
```bash
git clone https://github.com/Aanjaneya24/SmartSched.git
cd SmartSched
```

2. **Backend Setup**
```bash
cd server
npm install
```

Create `.env` file in server directory:
```
PORT=8000
MONGO_CONN=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
```

3. **Frontend Setup**
```bash
cd ../client
npm install
```

Create `.env` file in client directory:
```
VITE_API_URL=http://localhost:8000
```

4. **Run the Application**

Start backend server:
```bash
cd server
npm start
```

Start frontend development server:
```bash
cd client
npm run dev
```

Visit `http://localhost:5173` in your browser.

## ✨ Key Features

### Authentication
- Secure user registration and login
- JWT token-based authentication
- Protected routes

### Task Management
- Create tasks with title, description, category, and priority
- Mark tasks as complete/incomplete
- Edit and delete tasks
- Filter tasks by category and priority

### Progress Tracking
- Daily and monthly progress wheels
- Streak tracking (consecutive days with completed tasks)
- Category-wise progress breakdown
- Weekly completion charts

## 📱 API Endpoints

### Authentication
- `POST /auth/signup` - Register new user
- `POST /auth/login` - User login
- `GET /auth/verify` - Verify JWT token

### Tasks
- `GET /tasks` - Get user's tasks
- `POST /tasks` - Create new task
- `PUT /tasks/:id` - Update task
- `DELETE /tasks/:id` - Delete task
- `GET /tasks/progress` - Get progress stats
- `GET /tasks/streak` - Get streak count
- `GET /tasks/category-progress` - Get category-wise progress
- `GET /tasks/weekly-stats` - Get weekly completion stats

## 🤝 Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 👤 Author

**Aanjaneya Pandey**
- GitHub: [@Aanjaneya24](https://github.com/Aanjaneya24)

