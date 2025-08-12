# WhatsApp Clone with Typing Indicators

A real-time chat application built with React, Node.js, and Socket.IO that includes typing indicators functionality.

## Features

- **Real-time Messaging**: Instant message delivery using Socket.IO
- **Typing Indicators**: Shows when users are typing in real-time
- **User Authentication**: JWT-based authentication system
- **Profile Management**: Update profile pictures using Cloudinary
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Online Status**: Real-time online/offline indicators

## Typing Functionality

The typing indicators feature includes:

### Backend Implementation
- **Socket Events**: Handles `typing` events with receiver ID and typing state
- **Typing State Management**: Tracks typing state per user with timestamps
- **Auto-cleanup**: Automatically removes stale typing states after 3 seconds
- **Real-time Broadcasting**: Emits typing events to all connected clients

### Frontend Implementation
- **Debounced Typing**: Emits typing events with 1-second debounce
- **Visual Indicators**: Animated dots showing typing status
- **Real-time Updates**: Instant typing status updates across all clients
- **Cleanup**: Proper cleanup of typing states and event listeners

### How It Works

1. **User Types**: When a user types in the message input, a `typing` event is emitted
2. **Backend Processing**: Server receives the event and updates typing state
3. **Real-time Broadcasting**: Server broadcasts typing status to all connected clients
4. **Visual Feedback**: Receiving clients see animated typing indicators
5. **Auto-cleanup**: Typing state automatically clears after 3 seconds of inactivity

## Project Structure

```
├── backend/
│   ├── src/
│   │   ├── lib/
│   │   │   ├── socket.js          # Socket.IO server with typing events
│   │   │   ├── db.js              # MongoDB connection
│   │   │   └── cloudinary.js      # Image upload service
│   │   ├── controllers/           # API controllers
│   │   ├── models/                # MongoDB models
│   │   ├── routes/                # API routes
│   │   └── middleware/            # Authentication middleware
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/            # React components
│   │   ├── store/                 # Zustand state management
│   │   ├── pages/                 # Page components
│   │   └── lib/                   # Utility functions
│   └── package.json
└── package.json
```

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB
- Cloudinary account (for image uploads)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd whats-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   npm run build
   ```

3. **Environment Variables**
   Create `.env` files in both `backend/` and `frontend/` directories:
   
   **Backend (.env)**
   ```
   MONGODB_URL=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   CLIENT_URL=http://localhost:5173
   ```
   
   **Frontend (.env)**
   ```
   VITE_API_URL=http://localhost:5001
   ```

4. **Start the application**
   ```bash
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `PUT /api/auth/update-profile` - Update profile picture
- `GET /api/auth/check` - Check authentication status

### Messaging
- `GET /api/message/users` - Get all users for sidebar
- `GET /api/message/:id` - Get messages with a specific user
- `POST /api/message/send/:id` - Send a message to a user

## Socket Events

### Client to Server
- `typing` - Emit typing status
  ```javascript
  socket.emit('typing', {
    receiverId: 'user_id',
    isTyping: true/false
  });
  ```

### Server to Client
- `userTyping` - Individual user typing status
- `typingUsers` - List of all currently typing users
- `getOnlineUsers` - List of online users
- `newMessage` - New message received

## Typing Indicator Styling

The typing indicators use CSS animations with three animated dots:

```css
.typing-indicator .dot {
  animation: typing-bounce 1.4s infinite ease-in-out;
}

@keyframes typing-bounce {
  0%, 80%, 100% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the ISC License.
