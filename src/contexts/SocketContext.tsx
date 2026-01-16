'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { API_BASE_URL } from '@/config/api';

interface Message {
  id: string;
  fromUserId: string;
  toUserId: string;
  content: string;
  createdAt: string;
  fromUser: {
    id: string;
    name: string;
    avatar: string | null;
    type: string;
  };
  toUser: {
    id: string;
    name: string;
    avatar: string | null;
    type: string;
  };
}

interface TypingIndicator {
  userId: string;
  userName: string;
  isTyping: boolean;
}

interface CollabRequest {
  id: string;
  brandId: string;
  creatorId: string;
  status: string;
}

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  sendMessage: (toUserId: string, content: string) => void;
  sendTypingIndicator: (toUserId: string, isTyping: boolean) => void;
  onNewMessage: (callback: (message: Message) => void) => () => void;
  onTyping: (callback: (data: TypingIndicator) => void) => () => void;
  onNewCollabRequest: (callback: (request: CollabRequest) => void) => () => void;
  onCollabRequestUpdated: (callback: (request: CollabRequest) => void) => () => void;
  unreadCounts: Record<string, number>;
  totalUnread: number;
  markAsRead: (partnerId: string) => void;
  pendingRequestCount: number;
  incrementRequestCount: () => void;
  decrementRequestCount: () => void;
  setRequestCount: (count: number) => void;
}

const SocketContext = createContext<SocketContextType | null>(null);

export function SocketProvider({ children }: { children: ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [pendingRequestCount, setPendingRequestCount] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    // Connect to Socket.IO server
    const newSocket = io(API_BASE_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    newSocket.on('connect', () => {
      console.log('Socket connected');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message);
      setIsConnected(false);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  const sendMessage = useCallback((toUserId: string, content: string) => {
    if (socket && isConnected) {
      socket.emit('sendMessage', { toUserId, content });
    }
  }, [socket, isConnected]);

  const sendTypingIndicator = useCallback((toUserId: string, isTyping: boolean) => {
    if (socket && isConnected) {
      socket.emit('typing', { toUserId, isTyping });
    }
  }, [socket, isConnected]);

  const onNewMessage = useCallback((callback: (message: Message) => void) => {
    if (!socket) return () => {};

    const handler = (message: Message) => {
      callback(message);
      // Update unread count for incoming messages
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const decoded = JSON.parse(atob(token.split('.')[1]));
          if (message.fromUserId !== decoded.id) {
            setUnreadCounts(prev => ({
              ...prev,
              [message.fromUserId]: (prev[message.fromUserId] || 0) + 1
            }));
          }
        } catch (e) {
          console.error('Error decoding token:', e);
        }
      }
    };

    socket.on('newMessage', handler);
    return () => {
      socket.off('newMessage', handler);
    };
  }, [socket]);

  const onTyping = useCallback((callback: (data: TypingIndicator) => void) => {
    if (!socket) return () => {};

    socket.on('userTyping', callback);
    return () => {
      socket.off('userTyping', callback);
    };
  }, [socket]);

  const onNewCollabRequest = useCallback((callback: (request: CollabRequest) => void) => {
    if (!socket) return () => {};

    const handler = (request: CollabRequest) => {
      callback(request);
      // Increment pending request count for creators
      setPendingRequestCount(prev => prev + 1);
    };

    socket.on('newCollabRequest', handler);
    return () => {
      socket.off('newCollabRequest', handler);
    };
  }, [socket]);

  const onCollabRequestUpdated = useCallback((callback: (request: CollabRequest) => void) => {
    if (!socket) return () => {};

    socket.on('collabRequestUpdated', callback);
    return () => {
      socket.off('collabRequestUpdated', callback);
    };
  }, [socket]);

  const incrementRequestCount = useCallback(() => {
    setPendingRequestCount(prev => prev + 1);
  }, []);

  const decrementRequestCount = useCallback(() => {
    setPendingRequestCount(prev => Math.max(0, prev - 1));
  }, []);

  const setRequestCount = useCallback((count: number) => {
    setPendingRequestCount(count);
  }, []);

  const markAsRead = useCallback((partnerId: string) => {
    setUnreadCounts(prev => {
      const newCounts = { ...prev };
      delete newCounts[partnerId];
      return newCounts;
    });
  }, []);

  const totalUnread = Object.values(unreadCounts).reduce((sum, count) => sum + count, 0);

  return (
    <SocketContext.Provider value={{
      socket,
      isConnected,
      sendMessage,
      sendTypingIndicator,
      onNewMessage,
      onTyping,
      onNewCollabRequest,
      onCollabRequestUpdated,
      unreadCounts,
      totalUnread,
      markAsRead,
      pendingRequestCount,
      incrementRequestCount,
      decrementRequestCount,
      setRequestCount
    }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}
