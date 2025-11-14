import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/store/authStore';
import { useNotificationStore } from '@/store/notificationStore';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export const useSocket = () => {
  const socketRef = useRef<Socket | null>(null);
  const { user, token, isAuthenticated } = useAuthStore();
  const { addNotification } = useNotificationStore();

  useEffect(() => {
    if (!isAuthenticated || !token) return;

    // Initialize socket connection
    socketRef.current = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket'],
    });

    const socket = socketRef.current;

    // Connection events
    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);

      // Join appropriate rooms based on user role
      if (user?.role === 'super_admin' || user?.role === 'admin') {
        socket.emit('join_room', 'admin_room');
      }

      if (user?.role === 'department_user' && user?.department) {
        socket.emit('join_room', `department_${user.department}`);
      }

      if (user?.role === 'patient') {
        socket.emit('join_room', `patient_${user._id}`);
      }

      // All users join their personal room
      socket.emit('join_room', `user_${user?._id}`);
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    // Handle realtime events
    socket.on('new_report', (data) => {
      addNotification({
        title: 'New Report Created',
        message: `Case #${data.caseNumber} has been created`,
        type: 'info',
        data,
      });
    });

    socket.on('report_uploaded', (data) => {
      addNotification({
        title: 'Report Uploaded',
        message: `Report for Case #${data.caseNumber} has been uploaded`,
        type: 'success',
        data,
      });
    });

    socket.on('status_changed', (data) => {
      addNotification({
        title: 'Status Updated',
        message: `Case #${data.caseNumber} status changed to ${data.status}`,
        type: 'info',
        data,
      });
    });

    socket.on('notification', (data) => {
      addNotification({
        title: data.title || 'Notification',
        message: data.message,
        type: data.type || 'info',
        data: data.data,
      });
    });

    // Cleanup
    return () => {
      socket.disconnect();
    };
  }, [isAuthenticated, token, user, addNotification]);

  return socketRef.current;
};
