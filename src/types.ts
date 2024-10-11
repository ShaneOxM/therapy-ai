export interface ClientData {
  name?: string | string[] | { given?: string[], family?: string, prefix?: string[] };
  email?: string;
  nextSession?: string;
  status?: 'Active' | 'Inactive';
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

export interface Document {
  id: string;
  title: string;
  content: string;
}