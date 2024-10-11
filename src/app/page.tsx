import React from 'react';
import { Sidebar } from '@/components/Sidebar';
import { TherapistDashboard } from '@/components/TherapistDashboard';

export default function Home() {
  return (
    <div className="flex h-screen bg-background text-gray-900 overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-auto p-6">
        <TherapistDashboard />
      </main>
    </div>
  );
}
