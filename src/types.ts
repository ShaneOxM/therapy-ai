export interface ClientData {
  name: string;
  email: string;
  nextSession: string;
  status: 'Active' | 'Inactive';
}

export interface Client extends ClientData {
  id: string;
  resourceType: 'Patient';
  extension?: Array<{
    url: string;
    valueString?: string;
    valueDateTime?: string;
  }>;
}