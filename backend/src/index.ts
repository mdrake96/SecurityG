import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { createServer } from 'http';
import { Server } from 'socket.io';
import jobRoutes from './routes/jobs';
import userRoutes from './routes/userRoutes';
import messageRoutes from './routes/messageRoutes';
import reviewRoutes from './routes/reviewRoutes';
import { setSocketIO } from './controllers/messageController';

// Load environment variables
dotenv.config();

const app = express();
const corsOrigin = process.env.FRONTEND_URL || '*';
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: corsOrigin,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
  }
});

// Middleware
app.use(cors({ origin: corsOrigin }));
app.use(express.json());

// Routes
app.use('/api/users', userRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/reviews', reviewRoutes);

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/security-guard-hiring')
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('MongoDB connection error:', error));

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Security Guard Hiring Platform API' });
});

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('join', (userId: string) => {
    if (userId) {
      socket.join(userId.toString());
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// Provide io to message controller for emits
setSocketIO(io);

// Start server
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 