import React, { useState, useEffect, useRef } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAIChat } from '@/hooks/useAIChat';

export const AIChat: React.FC = () => {
  const [input, setInput] = useState('');
  const { messages, sendMessage, isLoading } = useAIChat();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (input.trim()) {
      sendMessage(input);
      setInput('');
    }
  };

  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-grow mb-4 p-4 bg-gray-800 rounded-lg" ref={scrollAreaRef}>
        {messages.map((message, index) => (
          <div key={index} className={`mb-2 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
            <span className={`inline-block p-2 rounded-lg ${
              message.role === 'user' ? 'bg-teal-600 text-white' : 'bg-gray-700 text-gray-100'
            }`}>
              {message.content}
            </span>
          </div>
        ))}
      </ScrollArea>
      <div className="flex">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question..."
          className="flex-grow mr-2 bg-gray-700 text-gray-100 border-gray-600"
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
        />
        <Button onClick={handleSend} disabled={isLoading} className="bg-teal-600 hover:bg-teal-700 text-white">
          {isLoading ? 'Sending...' : 'Send'}
        </Button>
      </div>
    </div>
  );
};
