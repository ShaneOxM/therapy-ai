import { NextResponse } from 'next/server';
import { HealthLakeClient, StartFHIRImportJobCommand, CreateFHIRDatastoreCommand } from "@aws-sdk/client-healthlake";

const client = new HealthLakeClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function GET() {
  try {
    const command = new StartFHIRImportJobCommand({
      DatastoreId: process.env.AWS_HEALTHLAKE_DATASTORE_ID,
      InputDataConfig: {
        S3Uri: `s3://${process.env.AWS_S3_BUCKET}/input/`,
      },
      JobOutputDataConfig: {
        S3Configuration: {
          S3Uri: `s3://${process.env.AWS_S3_BUCKET}/output/`,
          KmsKeyId: process.env.AWS_KMS_KEY_ID,
        }
      },
      DataAccessRoleArn: process.env.AWS_HEALTHLAKE_ROLE_ARN,
    });
    const result = await client.send(command);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error accessing HealthLake:', error);
    return NextResponse.json({ error: 'Failed to access HealthLake' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { action, data } = await request.json();

    switch (action) {
      case 'createDatastore':
        const createCommand = new CreateFHIRDatastoreCommand({
          DatastoreName: data.name,
          DatastoreTypeVersion: "R4",
          PreloadDataConfig: {
            PreloadDataType: "SYNTHEA"
          }
        });
        const createResult = await client.send(createCommand);
        return NextResponse.json(createResult);
      // Implement other actions as needed
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error processing HealthLake request:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}