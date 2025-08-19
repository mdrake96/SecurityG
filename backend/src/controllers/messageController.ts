import { Request, Response } from 'express';
import { Message } from '../models/Message';
import { User } from '../models/User';
import { Server } from 'socket.io';

let io: Server;

export const setSocketIO = (socketIO: Server) => {
  io = socketIO;
};

// Send a message
export const sendMessage = async (req: Request, res: Response) => {
  try {
    const { receiverId, content, jobId } = req.body;
    const senderId = (req as any).user._id;

    // Create message
    const message = new Message({
      sender: senderId,
      receiver: receiverId,
      content,
      job: jobId
    });

    await message.save();

    // Populate sender and receiver details
    await message.populate('sender', 'firstName lastName');
    await message.populate('receiver', 'firstName lastName');
    if (jobId) {
      await message.populate('job', 'title');
    }

    // Emit real-time message
    io.to(receiverId.toString()).emit('newMessage', message);

    res.status(201).json(message);
  } catch (error) {
    res.status(400).json({ error: 'Failed to send message' });
  }
};

// Get conversation between two users
export const getConversation = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const currentUserId = (req as any).user._id;

    const messages = await Message.find({
      $or: [
        { sender: currentUserId, receiver: userId },
        { sender: userId, receiver: currentUserId }
      ]
    })
      .populate('sender', 'firstName lastName')
      .populate('receiver', 'firstName lastName')
      .populate('job', 'title')
      .sort({ createdAt: 1 });

    // Mark unread messages as read
    await Message.updateMany(
      {
        sender: userId,
        receiver: currentUserId,
        read: false
      },
      { read: true }
    );

    res.json(messages);
  } catch (error) {
    res.status(400).json({ error: 'Failed to fetch conversation' });
  }
};

// Get all conversations for current user
export const getConversations = async (req: Request, res: Response) => {
  try {
    const currentUserId = (req as any).user._id;

    // Get the latest message from each conversation
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [
            { sender: currentUserId },
            { receiver: currentUserId }
          ]
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ['$sender', currentUserId] },
              '$receiver',
              '$sender'
            ]
          },
          lastMessage: { $first: '$$ROOT' },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$receiver', currentUserId] },
                    { $eq: ['$read', false] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      {
        $unwind: '$user'
      },
      {
        $project: {
          _id: 1,
          lastMessage: 1,
          unreadCount: 1,
          'user.firstName': 1,
          'user.lastName': 1,
          'user.email': 1
        }
      }
    ]);

    res.json(conversations);
  } catch (error) {
    res.status(400).json({ error: 'Failed to fetch conversations' });
  }
};

// Mark messages as read
export const markAsRead = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const currentUserId = (req as any).user._id;

    await Message.updateMany(
      {
        sender: userId,
        receiver: currentUserId,
        read: false
      },
      { read: true }
    );

    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    res.status(400).json({ error: 'Failed to mark messages as read' });
  }
}; 