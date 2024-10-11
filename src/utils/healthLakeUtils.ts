import { 
  HealthLakeClient, 
  CreateFHIRDatastoreCommand, 
  TagResourceCommand,
} from "@aws-sdk/client-healthlake";
import axios from 'axios';
import { SignatureV4 } from "@aws-sdk/signature-v4";
import { Sha256 } from "@aws-crypto/sha256-js";
import { HttpRequest } from "@aws-sdk/protocol-http";
import { Client, ClientData, Document } from '@/types';

// Remove this redundant interface
// interface Client extends ClientData {
//   id: string;
//   extension?: Array<{
//     url: string;
//     valueString?: string;
//     valueDateTime?: string;
//   }>;
// }

console.log('Environment variables in healthLakeUtils:');
console.log('AWS_REGION:', process.env.AWS_REGION);
console.log('AWS_ACCESS_KEY_ID:', process.env.AWS_ACCESS_KEY_ID ? 'Set' : 'Not set');
console.log('AWS_SECRET_ACCESS_KEY:', process.env.AWS_SECRET_ACCESS_KEY ? 'Set' : 'Not set');
console.log('AWS_HEALTHLAKE_DATASTORE_ID:', process.env.AWS_HEALTHLAKE_DATASTORE_ID);
console.log('AWS_HEALTHLAKE_ENDPOINT:', process.env.AWS_HEALTHLAKE_ENDPOINT);

const client = new HealthLakeClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const datastoreId = process.env.AWS_HEALTHLAKE_DATASTORE_ID!;
const healthLakeEndpoint = process.env.AWS_HEALTHLAKE_ENDPOINT!;

async function getAwsSignedRequest(url: string, method: string): Promise<Record<string, string>> {
  console.log('Getting AWS signed request for URL:', url);
  console.log('Method:', method);
  console.log('AWS Region:', process.env.AWS_REGION);
  console.log('AWS Access Key ID:', process.env.AWS_ACCESS_KEY_ID?.substring(0, 5) + '...');
  
  const signer = new SignatureV4({
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
    region: process.env.AWS_REGION!,
    service: 'healthlake',
    sha256: Sha256,
  });

  const parsedUrl = new URL(url);
  
  const request = new HttpRequest({
    method,
    protocol: parsedUrl.protocol,
    hostname: parsedUrl.hostname,
    path: parsedUrl.pathname + parsedUrl.search,
    headers: {
      'host': parsedUrl.hostname,
      'Content-Type': 'application/json',
    },
  });

  const signedRequest = await signer.sign(request);
  console.log('Signed request headers:', JSON.stringify(signedRequest.headers, null, 2));
  
  return signedRequest.headers as Record<string, string>;
}

export async function searchClients(searchTerm?: string): Promise<Client[]> {
  console.log('Starting searchClients function');
  console.log('Search term:', searchTerm);
  
  if (!process.env.AWS_HEALTHLAKE_ENDPOINT || !process.env.AWS_HEALTHLAKE_DATASTORE_ID) {
    console.error('AWS_HEALTHLAKE_ENDPOINT or AWS_HEALTHLAKE_DATASTORE_ID is not set');
    throw new Error('HealthLake configuration is missing');
  }

  const url = `${process.env.AWS_HEALTHLAKE_ENDPOINT}/Patient${searchTerm ? `?name=${searchTerm}` : ''}`;
  console.log('Constructed URL:', url);

  try {
    const signedHeaders = await getAwsSignedRequest(url, 'GET');
    console.log('Signed Headers:', JSON.stringify(signedHeaders, null, 2));

    const response = await axios.get(url, { 
      headers: signedHeaders,
      validateStatus: function (status) {
        return status < 500; // Resolve only if the status code is less than 500
      }
    });

    console.log('HealthLake Response status:', response.status);
    console.log('HealthLake Response headers:', JSON.stringify(response.headers, null, 2));
    console.log('HealthLake Response data:', JSON.stringify(response.data, null, 2));

    if (response.status === 401) {
      console.error('Authentication failed. Please check your AWS credentials.');
      throw new Error('Authentication failed');
    }

    if (!response.data.entry) {
      console.warn('No entries found in HealthLake response');
      return [];
    }

    return response.data.entry.map((entry: { resource: Client }) => entry.resource);
  } catch (error) {
    console.error('Error searching clients:', error);
    if (axios.isAxiosError(error)) {
      console.error('Axios error details:', error.response?.data);
      console.error('Axios error status:', error.response?.status);
      console.error('Axios error headers:', JSON.stringify(error.response?.headers, null, 2));
    }
    throw error;
  }
}

export async function createClient(clientData: ClientData): Promise<Client> {
  console.log('Creating client with data:', clientData);
  const url = `${process.env.AWS_HEALTHLAKE_ENDPOINT}/Patient`;
  console.log('Request URL:', url);
  const patientResource = {
    resourceType: "Patient",
    name: [{ given: [clientData.name] }],
    telecom: [{ system: "email", value: clientData.email }],
    extension: [
      {
        url: "http://example.com/nextSession",
        valueDateTime: clientData.nextSession
      },
      {
        url: "http://example.com/status",
        valueString: clientData.status || 'Active'
      }
    ]
  };

  try {
    const signedHeaders = await getAwsSignedRequest(url, 'POST');
    console.log('Signed Headers:', signedHeaders);

    const response = await axios.post(url, patientResource, { 
      headers: {
        ...signedHeaders,
        'Content-Type': 'application/json'
      }
    });

    console.log('HealthLake Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating client:', error);
    if (axios.isAxiosError(error)) {
      console.error('Axios error details:', error.response?.data);
    }
    throw error;
  }
}

export async function createFHIRDatastore() {
  const command = new CreateFHIRDatastoreCommand({
    DatastoreName: "TherapistClientDatastore",
    DatastoreTypeVersion: "R4",
    PreloadDataConfig: {
      PreloadDataType: "SYNTHEA"
    }
  });

  const response = await client.send(command);
  return response;
}

export async function getClient(id: string): Promise<Client> {
  const url = `https://${healthLakeEndpoint}/datastore/${datastoreId}/r4/Patient/${id}`;

  try {
    const response = await axios.get(url, {
      headers: {
        'Authorization': `Bearer ${await getAwsSignedRequest(url, 'GET')}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error getting client:', error);
    throw error;
  }
}

export async function updateClient(id: string, clientData: Partial<ClientData>): Promise<Client> {
  const url = `https://${healthLakeEndpoint}/datastore/${datastoreId}/r4/Patient/${id}`;

  const updatedResource = {
    resourceType: "Patient",
    id: id,
    name: [{ given: [clientData.name] }],
    telecom: [{ system: "email", value: clientData.email }],
    extension: [
      {
        url: "http://example.com/nextSession",
        valueDateTime: clientData.nextSession
      },
      {
        url: "http://example.com/status",
        valueString: clientData.status
      }
    ]
  };

  try {
    const response = await axios.put(url, updatedResource, {
      headers: {
        'Authorization': `Bearer ${await getAwsSignedRequest(url, 'PUT')}`,
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error updating client:', error);
    throw error;
  }
}

export async function deleteClient(id: string) {
  const url = `https://${healthLakeEndpoint}/datastore/${datastoreId}/r4/Patient/${id}`;

  try {
    const currentResource = await getClient(id);
    currentResource.extension = currentResource.extension || [];
    const statusExtension = currentResource.extension.find((ext) => ext.url === "http://example.com/status");
    
    if (statusExtension) {
      statusExtension.valueString = 'Inactive';
    } else {
      currentResource.extension.push({
        url: "http://example.com/status",
        valueString: 'Inactive'
      });
    }

    const response = await axios.put(url, currentResource, {
      headers: {
        'Authorization': `Bearer ${await getAwsSignedRequest(url, 'PUT')}`,
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  } catch (error) {
    console.error('Error deleting client:', error);
    throw error;
  }
}

export async function tagResource(resourceArn: string, tags: { [key: string]: string }) {
  const command = new TagResourceCommand({
    ResourceARN: resourceArn,
    Tags: Object.entries(tags).map(([key, value]) => ({ Key: key, Value: value }))
  });

  const response = await client.send(command);
  return response;
}

interface HealthLakeDocumentEntry {
  resource: {
    id: string;
    content: Array<{
      attachment?: {
        title?: string;
        data?: string;
      };
    }>;
  };
}

export async function searchDocuments(searchTerm?: string): Promise<Document[]> {
  const url = `${process.env.AWS_HEALTHLAKE_ENDPOINT}/DocumentReference${searchTerm ? `?title=${searchTerm}` : ''}`;

  try {
    const signedHeaders = await getAwsSignedRequest(url, 'GET');
    const response = await axios.get<{ entry?: HealthLakeDocumentEntry[] }>(url, { headers: signedHeaders });

    if (!response.data.entry) {
      return [];
    }

    return response.data.entry.map((entry: HealthLakeDocumentEntry) => ({
      id: entry.resource.id,
      title: entry.resource.content[0]?.attachment?.title || 'Untitled',
      content: entry.resource.content[0]?.attachment?.data || '',
    }));
  } catch (error) {
    console.error('Error searching documents:', error);
    throw error;
  }
}

export async function uploadDocument(document: { title: string; content: string; contentType: string }): Promise<Document> {
  const url = `${process.env.AWS_HEALTHLAKE_ENDPOINT}/DocumentReference`;

  const documentResource = {
    resourceType: "DocumentReference",
    status: "current",
    content: [
      {
        attachment: {
          contentType: document.contentType,
          data: btoa(document.content),
          title: document.title,
        },
      },
    ],
  };

  try {
    const signedHeaders = await getAwsSignedRequest(url, 'POST');
    const response = await axios.post(url, documentResource, {
      headers: {
        ...signedHeaders,
        'Content-Type': 'application/json',
      },
    });

    return {
      id: response.data.id,
      title: document.title,
      content: document.content,
    };
  } catch (error) {
    console.error('Error uploading document:', error);
    throw error;
  }
}

export async function createNote(clientId: string, content: string): Promise<any> {
  const url = `${process.env.AWS_HEALTHLAKE_ENDPOINT}/DocumentReference`;
  const noteResource = {
    resourceType: "DocumentReference",
    subject: {
      reference: `Patient/${clientId}`
    },
    content: [
      {
        attachment: {
          contentType: "text/plain",
          data: btoa(content)
        }
      }
    ],
    type: {
      coding: [
        {
          system: "http://loinc.org",
          code: "11506-3",
          display: "Progress note"
        }
      ]
    },
    status: "current"
  };

  try {
    const signedHeaders = await getAwsSignedRequest(url, 'POST');
    const response = await axios.post(url, noteResource, {
      headers: {
        ...signedHeaders,
        'Content-Type': 'application/json'
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error creating note:', error);
    throw error;
  }
}