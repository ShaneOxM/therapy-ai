import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { Client, ClientData } from '@/types';

const s3Client = new S3Client({ region: process.env.AWS_REGION });

export async function getClients(): Promise<Client[]> {
  try {
    const command = new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_TEMP,
      Key: 'clients.json',
    });
    const response = await s3Client.send(command);
    const clientsJson = await response.Body?.transformToString();
    return JSON.parse(clientsJson || '[]');
  } catch (error) {
    console.error('Error fetching clients from S3:', error);
    return [];
  }
}

export async function addClient(clientData: ClientData): Promise<Client> {
  try {
    const clients = await getClients();
    const newClient: Client = { ...clientData, id: Date.now().toString(), resourceType: 'Patient' };
    clients.push(newClient);
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_TEMP,
      Key: 'clients.json',
      Body: JSON.stringify(clients),
    });
    await s3Client.send(command);
    return newClient;
  } catch (error) {
    console.error('Error adding client to S3:', error);
    throw new Error('Failed to add client');
  }
}

export async function checkS3Status(): Promise<boolean> {
  try {
    const command = new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_TEMP,
      Key: 'clients.json',
    });
    await s3Client.send(command);
    return true;
  } catch (error) {
    console.error('Error checking S3 status:', error);
    return false;
  }
}

// Implement other data operations here (e.g., updateClient, deleteClient, etc.)