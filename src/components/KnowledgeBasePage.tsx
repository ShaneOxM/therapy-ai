'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { searchDocuments, uploadDocument } from '@/utils/healthLakeUtils';

// Move this interface to src/types.ts
interface Document {
  id: string;
  title: string;
  content: string;
}

const KnowledgeBasePage: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const fetchedDocuments = await searchDocuments();
      setDocuments(fetchedDocuments);
    } catch (error) {
      console.error('Error fetching documents:', error);
      setError('Failed to fetch documents');
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const content = e.target?.result as string;
      try {
        const uploadedDocument = await uploadDocument({
          title: file.name,
          content: content,
          contentType: file.type,
        });
        setDocuments(prevDocuments => [...prevDocuments, uploadedDocument]);
      } catch (error) {
        console.error('Error uploading document:', error);
        setError('Failed to upload document');
      }
    };
    reader.readAsText(file);
  };

  const handleSearch = async () => {
    try {
      const searchResults = await searchDocuments(searchTerm);
      setDocuments(searchResults);
    } catch (error) {
      console.error('Error searching documents:', error);
      setError('Failed to search documents');
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
          {Array.isArray(documents) && documents.length > 0 ? (
            documents.map((document) => (
              <div key={document.id} className="mb-2">
                {document.title}
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