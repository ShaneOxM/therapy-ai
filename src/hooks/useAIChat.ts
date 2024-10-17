import { useState } from 'react';
import { encryptMessage, decryptMessage } from '@/utils/encryption';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export const useAIChat = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Hello! I'm your AI assistant. How can I help you with your cases today?" }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (content: string) => {
    setIsLoading(true);
    const newMessage: Message = { role: 'user', content };
    setMessages(prev => [...prev, newMessage]);

    try {
      const encryptedMessage = encryptMessage(content);
      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: encryptedMessage }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const { encryptedResponse } = await response.json();
      const decryptedResponse = decryptMessage(encryptedResponse);

      setMessages(prev => [...prev, { role: 'assistant', content: decryptedResponse }]);
    } catch (error) {
      console.error('Error in AI chat:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: 'I apologize, but I encountered an error. Please try again.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return { messages, sendMessage, isLoading };
};
