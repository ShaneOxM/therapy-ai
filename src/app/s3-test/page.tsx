'use client';

import React, { useState, useEffect } from 'react';

export default function S3TestPage() {
  const [status, setStatus] = useState<string>('Checking...');

  useEffect(() => {
    fetch('/api/s3-status')
      .then(response => response.json())
      .then(data => {
        setStatus(data.status === 'connected' ? 'Connected' : 'Error: ' + data.message);
      })
      .catch(error => {
        setStatus('Error: ' + error.message);
      });
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">S3 Connection Test</h1>
      <p>Status: {status}</p>
    </div>
  );
}