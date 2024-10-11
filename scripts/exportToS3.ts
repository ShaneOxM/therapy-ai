import { S3Client, PutObjectCommand, ListObjectsV2Command, GetObjectCommand } from "@aws-sdk/client-s3";
import { HealthLakeClient, StartFHIRExportJobCommand, DescribeFHIRExportJobCommand } from "@aws-sdk/client-healthlake";
import dotenv from 'dotenv';

// Load environment variables from .env.local file
dotenv.config({ path: '.env.local' });

const s3Client = new S3Client({ 
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  }
});

const healthLakeClient = new HealthLakeClient({ 
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  }
});

interface ExportedFile {
  key: string;
  url: string;
}

async function exportToS3() {
  try {
    console.log('Environment variables:');
    console.log('AWS_REGION:', process.env.AWS_REGION);
    console.log('AWS_HEALTHLAKE_DATASTORE_ID:', process.env.AWS_HEALTHLAKE_DATASTORE_ID);
    console.log('AWS_S3_BUCKET:', process.env.AWS_S3_BUCKET);
    console.log('AWS_KMS_KEY_ID:', process.env.AWS_KMS_KEY_ID);
    console.log('AWS_HEALTHLAKE_ROLE_ARN:', process.env.AWS_HEALTHLAKE_ROLE_ARN);
    console.log('THERAPY_AI_ACCESS_KEY_ID:', process.env.THERAPY_AI_ACCESS_KEY_ID?.substring(0, 5) + '...');
    console.log('THERAPY_AI_SECRET_ACCESS_KEY:', process.env.THERAPY_AI_SECRET_ACCESS_KEY ? 'Set' : 'Not set');

    if (!process.env.AWS_HEALTHLAKE_DATASTORE_ID) {
      throw new Error('AWS_HEALTHLAKE_DATASTORE_ID is not set');
    }

    // Start HealthLake export job
    const exportCommand = new StartFHIRExportJobCommand({
      DatastoreId: process.env.AWS_HEALTHLAKE_DATASTORE_ID,
      OutputDataConfig: {
        S3Configuration: {
          S3Uri: `s3://${process.env.AWS_S3_BUCKET_HEALTHLAKE_OUTPUT}/`,
          KmsKeyId: process.env.AWS_KMS_KEY_ID,
        }
      },
      DataAccessRoleArn: process.env.AWS_HEALTHLAKE_ROLE_ARN,
    });

    const exportResponse = await healthLakeClient.send(exportCommand);
    console.log("Export job started:", exportResponse.JobId);

    // Wait for export to complete
    await waitForExportJobCompletion(exportResponse.JobId!);

    // Once export is complete, read the exported files and upload to your temporary S3 bucket
    const exportedFiles = await listExportedFiles(`s3://${process.env.AWS_S3_BUCKET_HEALTHLAKE_OUTPUT}/`);
    
    for (const file of exportedFiles) {
      const fileContent = await s3Client.send(new GetObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_HEALTHLAKE_OUTPUT,
        Key: file.key,
      }));
      
      await s3Client.send(new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_TEMP,
        Key: `temp-storage/${file.key}`,
        Body: await fileContent.Body?.transformToString(),
      }));
    }

    console.log("Export to temporary S3 storage complete");
  } catch (error) {
    console.error('Error in exportToS3:', error);
    throw error;
  }
}

async function waitForExportJobCompletion(jobId: string) {
  let jobStatus = 'SUBMITTED';
  while (jobStatus !== 'COMPLETED' && jobStatus !== 'FAILED') {
    const describeCommand = new DescribeFHIRExportJobCommand({
      DatastoreId: process.env.AWS_HEALTHLAKE_DATASTORE_ID,
      JobId: jobId,
    });
    const describeResponse = await healthLakeClient.send(describeCommand);
    jobStatus = describeResponse.ExportJobProperties?.JobStatus || 'UNKNOWN';
    console.log(`Export job status: ${jobStatus}`);
    if (jobStatus !== 'COMPLETED' && jobStatus !== 'FAILED') {
      await new Promise(resolve => setTimeout(resolve, 30000)); // Wait for 30 seconds before checking again
    }
  }
  if (jobStatus === 'FAILED') {
    throw new Error('Export job failed');
  }
}

async function listExportedFiles(s3Uri: string): Promise<ExportedFile[]> {
  const bucketName = s3Uri.split('//')[1].split('/')[0];
  const prefix = s3Uri.split(bucketName + '/')[1] || '';

  const command = new ListObjectsV2Command({
    Bucket: bucketName,
    Prefix: prefix,
  });

  const response = await s3Client.send(command);
  return response.Contents?.map(object => ({
    key: object.Key!,
    url: `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${object.Key}`,
  })) || [];
}

exportToS3().catch(error => {
  console.error('Unhandled error in exportToS3:', error);
  process.exit(1);
});