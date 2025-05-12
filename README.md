# Real-Time Chat Application

A feature-rich chat application built with React and Firebase Realtime Database with WebSocket support for real-time messaging.

## Features

- **Real-time messaging**: Messages appear instantly thanks to WebSocket integration
- **User identification**: Each user is assigned a random name and unique avatar initials
- **Message persistence**: Messages are stored in both Firebase and PostgreSQL databases
- **Offline resilience**: Local message display when network connectivity is lost
- **Responsive design**: Works on mobile, tablet, and desktop devices
- **Multiple fallback mechanisms**: Ensures functionality even when certain services are unavailable

## Technologies Used

### Frontend
- React for the UI components and state management
- Tailwind CSS and shadcn/ui for styling and UI components
- WebSockets for real-time communication
- Firebase Realtime Database for message storage and synchronization

### Backend
- Express.js server
- PostgreSQL database with Drizzle ORM
- WebSocket server for real-time communication
- RESTful API endpoints for data retrieval

## Architecture

The application follows a hybrid architecture:

1. **WebSocket Layer**: Handles real-time chat functionality with direct communication between clients
2. **Firebase Layer**: Provides persistent storage and synchronization across devices
3. **REST API Layer**: Offers endpoints for retrieving historical messages and user data
4. **PostgreSQL Database**: Stores messages and user data for long-term persistence

## Setup and Installation

### Prerequisites
- Node.js (v18 or later)
- PostgreSQL database
- Firebase account with Realtime Database enabled

### Environment Variables
The following environment variables need to be set:

```
DATABASE_URL=postgresql://user:password@host:port/database
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_PROJECT_ID=your-firebase-project-id
VITE_FIREBASE_APP_ID=your-firebase-app-id
```

### Installation Steps

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Setup the database schema:
   ```
   npm run db:push
   ```
4. Start the development server:
   ```
   npm run dev
   ```

## Usage

1. Open the application in your web browser
2. You'll be assigned a random username and avatar
3. Type messages in the input field and press Enter or click the send button
4. Messages will appear in real-time for all connected users
5. If you lose connection, messages will still appear locally and sync when connection is restored

## Debugging

The application includes built-in debugging tools accessible through test buttons in the UI:
- **Test WebSocket**: Verifies the WebSocket connection by sending a test message
- **Test REST API**: Checks the REST API functionality by fetching messages

## Future Enhancements

- User authentication
- Message encryption
- File sharing capabilities
- Message reactions and emoji support
- Custom themes
- Group chat rooms
- Message search functionality

## License

MIT License

## Credits

Built by [Your Name] with ❤️