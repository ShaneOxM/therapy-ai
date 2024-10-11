import React from 'react';

export const Workload: React.FC = () => {
  return (
    <div>
      <div className="flex justify-between mb-2">
        <span>Clients this week</span>
        <span>0/0</span>
      </div>
      <div className="flex justify-between">
        <span>Notes to complete</span>
        <span>0</span>
      </div>
    </div>
  );
};