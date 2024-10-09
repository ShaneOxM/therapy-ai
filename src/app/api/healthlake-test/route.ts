import { NextResponse } from 'next/server';
import AWS from 'aws-sdk';

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION
});

const healthLake = new AWS.HealthLake();

export async function GET() {
  try {
    const params: AWS.HealthLake.ListFHIRDatastoresRequest = {
      Filter: {
        DatastoreStatus: 'ACTIVE'
      }
    };
    const result = await healthLake.listFHIRDatastores(params).promise();
    
    // Filter the datastores to find the one matching our DatastoreId
    const ourDatastore = result.DatastorePropertiesList?.find(
      datastore => datastore.DatastoreId === process.env.AWS_HEALTHLAKE_DATASTORE_ID
    );

    if (ourDatastore) {
      return NextResponse.json({ message: 'Connected successfully', datastore: ourDatastore });
    } else {
      return NextResponse.json({ error: 'Datastore not found' }, { status: 404 });
    }
  } catch (error) {
    console.error('Error connecting to HealthLake:', error);
    return NextResponse.json({ error: 'Failed to connect to HealthLake' }, { status: 500 });
  }
}