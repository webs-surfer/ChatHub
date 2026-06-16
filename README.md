# ChatHub

ChatHub is a real-time chat application built using the MERN stack. It enables users to communicate instantly through a secure and responsive platform featuring real-time messaging, user authentication, and live online status tracking.

## Features

### Authentication
- User Registration & Login
- JWT-Based Authentication
- Protected Routes
- Secure Password Hashing with bcrypt

### Real-Time Communication
- Instant Messaging with Socket.io
- Real-Time Message Delivery
- Typing Indicators
- Online/Offline User Status
- Live User Presence Updates

### User Experience
- Responsive User Interface
- Modern Chat Layout
- User-Friendly Navigation
- Mobile and Desktop Compatibility

### Data Management
- MongoDB Database Integration
- Message Persistence
- User Profile Storage
- Efficient Data Retrieval with Mongoose

## Tech Stack

### Frontend
- React.js
- Chakra UI
- React Router DOM
- Axios

### Backend
- Node.js
- Express.js

### Database
- MongoDB Atlas
- Mongoose

### Authentication & Security
- JSON Web Tokens (JWT)
- bcrypt

### Real-Time Communication
- Socket.io

## Architecture


Client (React)
│
├── Authentication
├── Chat Interface
└── Socket.io Client
│
▼

REST API (Node.js + Express)
│
├── User Management
├── Authentication
└── Message Handling
│
▼

MongoDB Database
│
├── Users
└── Messages
│
▼

Socket.io Server
│
└── Real-Time Communication


## Key Functionalities

### User Authentication
- Register a new account
- Secure login system
- Protected chat access

### Chat Features
- Send and receive messages instantly
- View online users
- See typing indicators
- Real-time updates without page refresh

### Data Persistence
- Store user information
- Save chat messages
- Retrieve conversation history

## Installation

### Clone Repository

```bash
git clone https://github.com/your-username/chathub.git
cd chathub
Install Dependencies
Frontend
cd client
npm install
Backend
cd server
npm install
Environment Variables

Create a .env file inside the server directory:

PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
Run Application
Backend
npm run dev
Frontend
npm start
Future Enhancements
Group Chats
Media & File Sharing
Message Reactions
Read Receipts
Voice & Video Calling
Push Notifications
End-to-End Encryption
Chat Search Functionality
Learning Outcomes

This project helped in gaining practical experience with:

MERN Stack Development
REST API Design
JWT Authentication
MongoDB Data Modeling
Real-Time Communication using Socket.io
Responsive UI Development
Full-Stack Application Architecture
Project Highlights
Full-Stack MERN Application
Secure Authentication System
Real-Time Messaging
Scalable Backend Architecture
Responsive User Interface
Database-Driven Design
Author

Rohan
