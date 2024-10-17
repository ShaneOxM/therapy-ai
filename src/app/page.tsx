import React from 'react';
import { Sidebar } from '@/components/Sidebar';
import { TherapistDashboard } from '@/components/TherapistDashboard';

export default function Home() {
  return (
    <div className="flex h-screen bg-gray-900 text-gray-100 overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-hidden">
        <TherapistDashboard />
      </main>
    </div>
  );
}
