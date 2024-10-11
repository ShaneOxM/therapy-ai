import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const AIChat: React.FC = () => {
  const [input, setInput] = useState('');

  return (
    <div>
      <div className="mb-4 h-40 overflow-y-auto bg-gray-700 p-2 rounded">
        <p>Hello! I&apos;m your AI assistant. How can I help you with your cases today?</p>
      </div>
      <div className="flex">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question..."
          className="flex-grow mr-2"
        />
        <Button>Send</Button>
      </div>
    </div>
  );
};