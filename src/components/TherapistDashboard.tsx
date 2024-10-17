'use client';

import React, { useState, useEffect } from 'react'
import { Bell, Plus, Calendar, FileText, Users, ChevronRight } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { Button } from "./ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Progress } from "./ui/progress"
import { ScrollArea } from "./ui/scroll-area"
import AddClientModal from './AddClientModal';
import { Client, ClientData } from '@/types';
import { motion } from "framer-motion";
import { AIChat } from './AIChat';

function formatName(name: ClientData['name']): string {
  if (typeof name === 'string') {
    return name;
  }
  if (Array.isArray(name)) {
    return name.join(' ');
  }
  if (typeof name === 'object' && name !== null) {
    return [name.prefix, name.given, name.family]
      .flat()
      .filter(Boolean)
      .join(' ');
  }
  return 'Unnamed Client';
}

export const TherapistDashboard: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([])
  const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false);
  const [workload, setWorkload] = useState({
    clientsThisWeek: 0,
    totalClients: 0,
    notesToComplete: 0,
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const clientsRes = await fetch('/api/clients');
      const workloadRes = await fetch('/api/workload');
      
      if (!clientsRes.ok) throw new Error('Failed to fetch clients');
      if (!workloadRes.ok) throw new Error('Failed to fetch workload');

      const clientsData: Client[] = await clientsRes.json();
      const workloadData = await workloadRes.json();

      setClients(clientsData);
      setWorkload(workloadData);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load dashboard data. Please try again later.');
    }
  };

  const handleAddClient = async (newClient: ClientData) => {
    try {
      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newClient),
      });

      if (!response.ok) {
        throw new Error('Failed to add client');
      }

      const addedClient: Client = await response.json();
      setClients([...clients, addedClient]);
    } catch (error) {
      console.error('Error adding client:', error);
    }
  };

  return (
    <div className="bg-gray-900 text-gray-100 h-screen overflow-auto">
      <div className="p-6">
        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-300 px-4 py-3 rounded-lg mb-6" role="alert">
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        )}
        <header className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-100">Dashboard</h1>
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="icon" className="text-gray-300 hover:text-teal-300 transition-colors duration-200">
              <Bell className="h-5 w-5" />
            </Button>
            <Avatar>
              <AvatarImage src="/placeholder-user.jpg" alt="User avatar" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div 
            className="lg:col-span-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="bg-gray-800 border-gray-700 shadow-lg">
              <CardHeader className="bg-gray-750 border-b border-gray-700">
                <CardTitle className="text-xl text-teal-300">AI Assistant</CardTitle>
                <CardDescription className="text-gray-400">Chat with your AI assistant for case discussions and support</CardDescription>
              </CardHeader>
              <CardContent className="p-4 h-[400px]">
                <AIChat />
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="bg-gray-800 border-gray-700 shadow-lg">
              <CardHeader className="bg-gray-750 border-b border-gray-700">
                <CardTitle className="text-xl text-teal-300">Today's Schedule</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <ScrollArea className="h-[300px]">
                  {clients.slice(0, 5).map((client) => (
                    <div key={client.id} className="flex items-center mb-4 p-2 hover:bg-gray-750 rounded-lg transition-colors duration-200">
                      <Avatar className="h-10 w-10 mr-3">
                        <AvatarFallback>{formatName(client.name).charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-grow">
                        <p className="font-medium text-gray-100">{formatName(client.name)}</p>
                        <p className="text-sm text-gray-400">{client.nextSession || 'Not scheduled'}</p>
                      </div>
                      <Button variant="ghost" size="sm" className="text-teal-300 hover:text-teal-200">
                        <Calendar className="h-4 w-4 mr-1" /> Schedule
                      </Button>
                    </div>
                  ))}
                </ScrollArea>
                <Button onClick={() => setIsAddClientModalOpen(true)} className="w-full mt-4 bg-teal-600 hover:bg-teal-700 text-white">
                  <Plus className="mr-2 h-4 w-4" /> Add New Client
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            className="lg:col-span-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Card className="bg-gray-800 border-gray-700 shadow-lg">
              <CardHeader className="bg-gray-750 border-b border-gray-700">
                <CardTitle className="text-xl text-teal-300">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="p-4 grid grid-cols-2 gap-4">
                <Button variant="outline" className="flex justify-between items-center text-left bg-gray-750 hover:bg-gray-700 border-gray-600">
                  <div>
                    <p className="font-medium text-gray-100">Create Note</p>
                    <p className="text-sm text-gray-400">Add a new session note</p>
                  </div>
                  <FileText className="h-5 w-5 text-teal-300" />
                </Button>
                <Button variant="outline" className="flex justify-between items-center text-left bg-gray-750 hover:bg-gray-700 border-gray-600">
                  <div>
                    <p className="font-medium text-gray-100">Schedule Session</p>
                    <p className="text-sm text-gray-400">Book a new appointment</p>
                  </div>
                  <Calendar className="h-5 w-5 text-teal-300" />
                </Button>
                <Button variant="outline" className="flex justify-between items-center text-left bg-gray-750 hover:bg-gray-700 border-gray-600">
                  <div>
                    <p className="font-medium text-gray-100">View Clients</p>
                    <p className="text-sm text-gray-400">Manage your client list</p>
                  </div>
                  <Users className="h-5 w-5 text-teal-300" />
                </Button>
                <Button variant="outline" className="flex justify-between items-center text-left bg-gray-750 hover:bg-gray-700 border-gray-600">
                  <div>
                    <p className="font-medium text-gray-100">AI Insights</p>
                    <p className="text-sm text-gray-400">Get AI-powered analytics</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-teal-300" />
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <Card className="bg-gray-800 border-gray-700 shadow-lg">
              <CardHeader className="bg-gray-750 border-b border-gray-700">
                <CardTitle className="text-xl text-teal-300">Workload</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-300">Clients this week</span>
                      <span className="text-gray-100 font-medium">{workload.clientsThisWeek}/{workload.totalClients}</span>
                    </div>
                    <Progress value={(workload.clientsThisWeek / workload.totalClients) * 100} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-gray-300">Notes to complete</span>
                      <span className="text-gray-100 font-medium">{workload.notesToComplete}</span>
                    </div>
                    <Progress value={(workload.notesToComplete / 10) * 100} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div 
            className="lg:col-span-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <Card className="bg-gray-800 border-gray-700 shadow-lg">
              <CardHeader className="bg-gray-750 border-b border-gray-700">
                <CardTitle className="text-xl text-teal-300">Recent Notes</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <ScrollArea className="h-[200px]">
                  {/* Replace with actual recent notes data */}
                  {[1, 2, 3, 4, 5].map((_, index) => (
                    <div key={index} className="flex items-center mb-4 p-2 hover:bg-gray-750 rounded-lg transition-colors duration-200">
                      <FileText className="h-6 w-6 text-teal-300 mr-3" />
                      <div className="flex-grow">
                        <p className="font-medium text-gray-100">Note Title {index + 1}</p>
                        <p className="text-sm text-gray-400">Client Name • {new Date().toLocaleDateString()}</p>
                      </div>
                      <Button variant="ghost" size="sm" className="text-teal-300 hover:text-teal-200">
                        View
                      </Button>
                    </div>
                  ))}
                </ScrollArea>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      <AddClientModal
        isOpen={isAddClientModalOpen}
        onClose={() => setIsAddClientModalOpen(false)}
        onAddClient={handleAddClient}
      />
    </div>
  )
}
