'use client';

import { SocketProvider } from '@/contexts/SocketContext';
import { ReactNode } from 'react';

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <SocketProvider>
      {children}
    </SocketProvider>
  );
}
