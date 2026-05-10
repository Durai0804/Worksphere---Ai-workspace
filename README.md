# Smart Workplace OS 🏢

> AI-Powered Smart Workplace Management Platform

![Smart Workplace OS](https://img.shields.io/badge/Status-MVP-brightgreen) ![License](https://img.shields.io/badge/License-MIT-blue) ![Node](https://img.shields.io/badge/Node.js-18%2B-green) ![React](https://img.shields.io/badge/React-19-blue)

## 🚀 Overview

Smart Workplace OS is a modern, AI-powered workplace management platform that combines employee management, attendance tracking, leave management, analytics dashboards, real-time notifications, and an AI assistant into one sleek platform.

### Key Features

- 🔐 **JWT Authentication** with role-based access (Admin, HR, Employee)
- 👥 **Employee Management** — Full CRUD with search, filters, and pagination
- 📅 **Attendance Tracking** — Check-in/Check-out with real-time clock
- 🏖️ **Leave Management** — Apply, approve/reject with balance tracking
- 📊 **Analytics Dashboard** — Charts, stats, and activity feed
- 🤖 **AI Assistant** — HR chatbot with workplace knowledge base
- 🔔 **Real-time Notifications** — Socket.IO powered
- ⚙️ **Settings** — Profile, security, and notification preferences
- 🌙 **Dark Theme** — Premium glassmorphism UI design

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite, Tailwind CSS v4, Framer Motion |
| Backend | Node.js, Express |
| Database | MongoDB with Mongoose |
| Auth | JWT, bcrypt |
| Real-time | Socket.IO |
| Charts | Recharts |
| Icons | Lucide React |

## 📁 Project Structure

```
smart-workplace-os/
├── client/          # React frontend (Vite)
├── server/          # Express backend
├── ai-engine/       # AI assistant modules
├── docs/            # Documentation
└── README.md
```

## ⚡ Quick Start

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- npm or yarn

### 1. Clone & Install

```bash
git clone <repo-url>
cd smart-workplace-os

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. Configure Environment

Create `server/.env`:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/smart-workplace-os
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d
CORS_ORIGIN=http://localhost:5173
```

### 3. Seed Database

```bash
cd server
npm run seed
```

This creates demo users:
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@workplace.com | admin123 |
| HR | hr@workplace.com | hr123456 |
| Employee | john@workplace.com | emp12345 |

### 4. Start Development Servers

```bash
# Terminal 1: Start backend
cd server
npm run dev

# Terminal 2: Start frontend
cd client
npm run dev
```

Visit **http://localhost:5173**

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get profile |
| PUT | `/api/auth/password` | Update password |
| PUT | `/api/auth/profile` | Update profile |

### Employees
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/employees` | List employees |
| GET | `/api/employees/:id` | Get employee |
| POST | `/api/employees` | Create employee |
| PUT | `/api/employees/:id` | Update employee |
| DELETE | `/api/employees/:id` | Delete employee |

### Attendance
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/attendance/checkin` | Check in |
| POST | `/api/attendance/checkout` | Check out |
| GET | `/api/attendance/today` | Today's status |
| GET | `/api/attendance/history` | History |
| GET | `/api/attendance/monthly-summary` | Monthly stats |

### Leaves
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/leaves` | Apply leave |
| GET | `/api/leaves` | List leaves |
| GET | `/api/leaves/balance` | Leave balance |
| PUT | `/api/leaves/:id/status` | Approve/reject |

### AI Assistant
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/ai/chat` | Chat with AI |

## 🏗️ Architecture

```
Client (React/Vite) ──→ API Gateway (Express) ──→ MongoDB
         │                      │
         └─ Socket.IO ←──── Socket Server
                                │
                          AI Engine (KB)
```

## 📝 License

MIT License

---

Built with ❤️ by Smart Workplace OS Team
