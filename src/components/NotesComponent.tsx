import React, { useState, useRef } from 'react';
import { Button } from "./ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Client } from '@/types';
import { startSpeechRecognition } from '@/utils/speechRecognition';

interface NotesComponentProps {
  clients: Client[];
}

export const NotesComponent: React.FC<NotesComponentProps> = ({ clients }) => {
  const [selectedClient, setSelectedClient] = useState<string>('');
  const [isRecording, setIsRecording] = useState(false);
  const [note, setNote] = useState('');
  const recognitionRef = useRef<any>(null);

  const startRecording = () => {
    setIsRecording(true);
    recognitionRef.current = startSpeechRecognition(
      (transcript) => setNote(prev => prev + ' ' + transcript),
      () => setIsRecording(false)
    );
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsRecording(false);
  };

  const saveNote = async () => {
    try {
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ clientId: selectedClient, content: note }),
      });

      if (!response.ok) {
        throw new Error('Failed to save note');
      }

      setNote('');
      alert('Note saved successfully!');
    } catch (error) {
      console.error('Error saving note:', error);
      alert('Failed to save note. Please try again.');
    }
  };

  return (
    <div className="space-y-4">
      <Select onValueChange={setSelectedClient} value={selectedClient}>
        <SelectTrigger>
          <SelectValue placeholder="Select a client" />
        </SelectTrigger>
        <SelectContent>
          {clients.map((client) => (
            <SelectItem key={client.id} value={client.id}>
              {typeof client.name === 'string' ? client.name : 'Unnamed Client'}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <div className="flex space-x-2">
        <Button
          onClick={isRecording ? stopRecording : startRecording}
          className={isRecording ? "bg-red-600 hover:bg-red-700" : "bg-teal-600 hover:bg-teal-700"}
        >
          {isRecording ? "Stop Recording" : "Start Recording"}
        </Button>
        <Button onClick={saveNote} disabled={!note || !selectedClient}>
          Save Note
        </Button>
      </div>
      <Textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Session notes..."
        className="h-32"
      />
    </div>
  );
};