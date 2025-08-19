import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  TextField,
  IconButton,
  Divider,
  CircularProgress
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import io, { Socket } from 'socket.io-client';

interface Message {
  _id: string;
  sender: string;
  content: string;
  conversation: string;
  createdAt: string;
}

interface Conversation {
  _id: string;
  participants: {
    _id: string;
    firstName: string;
    lastName: string;
  }[];
  lastMessage?: Message;
}

const Messages: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize socket connection using env or same origin (CRA proxy will forward ws in dev)
    const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || undefined;
    socketRef.current = SOCKET_URL ? io(SOCKET_URL) : io();

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation._id);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (socketRef.current && user?._id) {
      socketRef.current.emit('join', user._id);
    }
  }, [user?._id]);

  useEffect(() => {
    if (!socketRef.current) return;

    const handler = () => {
      if (selectedConversation) {
        fetchMessages(selectedConversation._id);
      }
    };
    socketRef.current.on('newMessage', handler);

    return () => {
      socketRef.current?.off('newMessage', handler);
    };
  }, [selectedConversation]);

  const fetchConversations = async () => {
    try {
      const response = await axios.get('/api/messages/conversations');
      setConversations(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch conversations');
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      const response = await axios.get(`/api/messages/conversation/${conversationId}`);
      setMessages(response.data);
    } catch (err) {
      setError('Failed to fetch messages');
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      const response = await axios.post('/api/messages', {
        receiverId: getOtherParticipant(selectedConversation)?._id,
        content: newMessage
      });

      setMessages(prev => [...prev, response.data]);
      setNewMessage('');
    } catch (err) {
      setError('Failed to send message');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getOtherParticipant = (conversation: Conversation) => {
    return conversation.participants.find(p => p._id !== user?._id);
  };

  if (loading) {
    return (
      <Container>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container>
      <Grid container spacing={2} sx={{ mt: 2 }}>
        {/* Conversations List */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ height: 'calc(100vh - 100px)' }}>
            <List>
              {conversations.map(conversation => {
                const otherParticipant = getOtherParticipant(conversation);
                return (
                  <ListItem
                    key={conversation._id}
                    button
                    selected={selectedConversation?._id === conversation._id}
                    onClick={() => setSelectedConversation(conversation)}
                  >
                    <ListItemAvatar>
                      <Avatar>
                        {otherParticipant?.firstName[0]}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={`${otherParticipant?.firstName} ${otherParticipant?.lastName}`}
                      secondary={conversation.lastMessage?.content}
                    />
                  </ListItem>
                );
              })}
            </List>
          </Paper>
        </Grid>

        {/* Messages */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column' }}>
            {selectedConversation ? (
              <>
                {/* Messages Header */}
                <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
                  <Typography variant="h6">
                    {getOtherParticipant(selectedConversation)?.firstName}{' '}
                    {getOtherParticipant(selectedConversation)?.lastName}
                  </Typography>
                </Box>

                {/* Messages List */}
                <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
                  {messages.map(message => (
                    <Box
                      key={message._id}
                      sx={{
                        display: 'flex',
                        justifyContent: message.sender === user?._id ? 'flex-end' : 'flex-start',
                        mb: 2
                      }}
                    >
                      <Paper
                        sx={{
                          p: 2,
                          maxWidth: '70%',
                          bgcolor: message.sender === user?._id ? 'primary.main' : 'grey.100',
                          color: message.sender === user?._id ? 'white' : 'text.primary'
                        }}
                      >
                        <Typography variant="body1">
                          {message.content}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(message.createdAt).toLocaleTimeString()}
                        </Typography>
                      </Paper>
                    </Box>
                  ))}
                  <div ref={messagesEndRef} />
                </Box>

                {/* Message Input */}
                <Box
                  component="form"
                  onSubmit={handleSendMessage}
                  sx={{
                    p: 2,
                    borderTop: 1,
                    borderColor: 'divider',
                    display: 'flex',
                    gap: 1
                  }}
                >
                  <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    size="small"
                  />
                  <IconButton
                    color="primary"
                    type="submit"
                    disabled={!newMessage.trim()}
                  >
                    <SendIcon />
                  </IconButton>
                </Box>
              </>
            ) : (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%'
                }}
              >
                <Typography color="text.secondary">
                  Select a conversation to start messaging
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Messages; 