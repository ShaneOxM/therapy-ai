'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

interface File {
  id: string;
  content: { attachment: { title: string } }[];
}

const KnowledgeBasePage: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      const response = await fetch('/api/healthlake');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (Array.isArray(data)) {
        setFiles(data);
      } else {
        console.error('Received data is not an array:', data);
        setError('Received invalid data format');
      }
    } catch (error) {
      console.error('Error fetching files:', error);
      setError('Failed to fetch files');
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const content = e.target?.result as string;
      try {
        const response = await fetch('/api/healthlake', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'uploadFile',
            data: {
              filename: file.name,
              contentType: file.type,
              content: content
            }
          })
        });
        if (response.ok) {
          fetchFiles();
        } else {
          setError('Failed to upload file');
        }
      } catch (error) {
        console.error('Error uploading file:', error);
        setError('Error uploading file');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSearch = async () => {
    try {
      const response = await fetch('/api/healthlake', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'searchFiles',
          data: { searchTerm }
        })
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (Array.isArray(data)) {
        setFiles(data);
      } else {
        console.error('Received search data is not an array:', data);
        setError('Received invalid search results');
      }
    } catch (error) {
      console.error('Error searching files:', error);
      setError('Failed to search files');
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Knowledge Base</h1>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <Card>
        <CardHeader>
          <CardTitle>Upload File</CardTitle>
          <CardDescription>Upload a new file to the knowledge base</CardDescription>
        </CardHeader>
        <CardContent>
          <Input type="file" onChange={handleFileUpload} />
        </CardContent>
      </Card>
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Search Files</CardTitle>
          <CardDescription>Search for files in the knowledge base</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2">
            <Input
              type="text"
              placeholder="Search files..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button onClick={handleSearch}>Search</Button>
          </div>
        </CardContent>
      </Card>
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Files</CardTitle>
          <CardDescription>List of files in the knowledge base</CardDescription>
        </CardHeader>
        <CardContent>
          {Array.isArray(files) && files.length > 0 ? (
            files.map((file) => (
              <div key={file.id} className="mb-2">
                {file.content[0]?.attachment?.title || 'Untitled'}
              </div>
            ))
          ) : (
            <div>No files found</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default KnowledgeBasePage;