'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import AddClientModal from './AddClientModal';
import { Client, ClientData } from '@/types';
import { searchClients, createClient } from '@/utils/healthLakeUtils';

// Add this helper function at the top of the file
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

const ClientsPage: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedClients = await searchClients();
      setClients(fetchedClients);
    } catch (error) {
      console.error('Error fetching clients:', error);
      setError('Failed to load clients. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredClients = clients.filter(client =>
    (formatName(client.name).toLowerCase().includes(searchTerm.toLowerCase()) || 
     client?.email?.toLowerCase().includes(searchTerm.toLowerCase())) ?? false
  );

  const handleAddClient = async (newClient: ClientData) => {
    try {
      const addedClient = await createClient(newClient);
      setClients([...clients, addedClient]);
      setIsAddClientModalOpen(false);
    } catch (error) {
      console.error('Error adding client:', error);
      setError('Failed to add client. Please try again.');
    }
  };

  return (
    <div className="p-6 bg-gray-900 text-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-teal-300">Clients</h1>
      <Card className="bg-gray-800 border-teal-500/50 shadow-lg shadow-teal-500/10 mb-6">
        <CardHeader>
          <CardTitle className="text-teal-300">Client Management</CardTitle>
          <CardDescription className="text-gray-400">Search and manage your clients</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2 mb-4">
            <Input
              type="text"
              placeholder="Search clients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-gray-700 text-gray-100 border-gray-600 focus:border-teal-500"
            />
            <Button onClick={() => setIsAddClientModalOpen(true)} className="bg-teal-600 hover:bg-teal-700 text-white">Add New Client</Button>
          </div>
          {isLoading ? (
            <p>Loading clients...</p>
          ) : error ? (
            <p className="text-red-500">{error}</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-teal-300">Name</TableHead>
                  <TableHead className="text-teal-300">Email</TableHead>
                  <TableHead className="text-teal-300">Next Session</TableHead>
                  <TableHead className="text-teal-300">Status</TableHead>
                  <TableHead className="text-teal-300">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredClients.length > 0 ? (
                  filteredClients.map((client) => (
                    <TableRow key={client.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          <Avatar className="h-8 w-8 mr-2">
                            <AvatarFallback>{formatName(client.name).split(' ').map(n => n[0]).join('').toUpperCase()}</AvatarFallback>
                          </Avatar>
                          {formatName(client.name)}
                        </div>
                      </TableCell>
                      <TableCell>{client.email}</TableCell>
                      <TableCell>{client.nextSession}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          client.status === 'Active' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'
                        }`}>
                          {client.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm" className="mr-2 text-teal-300 border-teal-500/50 hover:bg-teal-600 hover:text-white">
                          View
                        </Button>
                        <Button variant="outline" size="sm" className="text-teal-300 border-teal-500/50 hover:bg-teal-600 hover:text-white">
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">No clients found</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      <AddClientModal
        isOpen={isAddClientModalOpen}
        onClose={() => setIsAddClientModalOpen(false)}
        onAddClient={handleAddClient}
      />
    </div>
  );
};

export default ClientsPage;