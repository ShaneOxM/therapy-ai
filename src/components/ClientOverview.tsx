import React from 'react';
import { Button } from "@/components/ui/button";

export const ClientOverview: React.FC = () => {
  return (
    <div>
      <p className="mb-4">No clients found</p>
      <Button className="w-full">+ Add New Client</Button>
    </div>
  );
};