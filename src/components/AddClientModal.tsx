'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ClientData } from '@/types';

interface AddClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddClient: (client: ClientData) => void;
}

const AddClientModal: React.FC<AddClientModalProps> = ({ isOpen, onClose, onAddClient }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [nextSession, setNextSession] = useState('');
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, nextSession, status: 'Active' }),
      });

      if (!response.ok) {
        throw new Error('Failed to add client');
      }

      const newClient = await response.json();
      onAddClient(newClient);
      setName('');
      setEmail('');
      setNextSession('');
      onClose();
    } catch (error) {
      console.error('Error adding client:', error);
      setErrors({ general: 'Failed to add client. Please try again.' });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-gray-800 text-gray-100">
        <DialogHeader>
          <DialogTitle className="text-teal-300">Add New Client</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="col-span-3 bg-gray-700 text-gray-100 border-gray-600 focus:border-teal-500"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="col-span-3 bg-gray-700 text-gray-100 border-gray-600 focus:border-teal-500"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="nextSession" className="text-right">
                Next Session
              </Label>
              <Input
                id="nextSession"
                type="datetime-local"
                value={nextSession}
                onChange={(e) => setNextSession(e.target.value)}
                className="col-span-3 bg-gray-700 text-gray-100 border-gray-600 focus:border-teal-500"
              />
            </div>
          </div>
          {errors.general && <p className="text-red-500 text-center mb-4">{errors.general}</p>}
          <DialogFooter>
            <Button type="submit" className="bg-teal-600 hover:bg-teal-700 text-white">Add Client</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddClientModal;