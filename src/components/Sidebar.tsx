import React from 'react';
import Link from 'next/link';
import { Home, Users, FileText, Calendar, MessageSquare, Settings, Book } from 'lucide-react';

export const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 bg-gray-800 h-screen overflow-y-auto">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-teal-300 mb-6">TherapyAI</h1>
        <nav>
          <ul className="space-y-2">
            <SidebarItem href="/" icon={<Home className="h-5 w-5" />} text="Dashboard" />
            <SidebarItem href="/clients" icon={<Users className="h-5 w-5" />} text="Clients" />
            <SidebarItem href="/notes" icon={<FileText className="h-5 w-5" />} text="Notes" />
            <SidebarItem href="/schedule" icon={<Calendar className="h-5 w-5" />} text="Schedule" />
            <SidebarItem href="/ai-assistant" icon={<MessageSquare className="h-5 w-5" />} text="AI Assistant" />
            <SidebarItem href="/settings" icon={<Settings className="h-5 w-5" />} text="Settings" />
            <SidebarItem href="/knowledge-base" icon={<Book className="h-5 w-5" />} text="Knowledge Base" />
          </ul>
        </nav>
      </div>
    </aside>
  );
};

const SidebarItem: React.FC<{ href: string; icon: React.ReactNode; text: string }> = ({ href, icon, text }) => (
  <li>
    <Link href={href} className="flex items-center space-x-3 text-gray-300 hover:text-teal-300 transition-colors duration-200">
      {icon}
      <span>{text}</span>
    </Link>
  </li>
);
