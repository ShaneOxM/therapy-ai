import { S3Client, GetObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { HealthLakeClient, StartFHIRImportJobCommand } from "@aws-sdk/client-healthlake";

const s3Client = new S3Client({ region: process.env.AWS_REGION });
const healthLakeClient = new HealthLakeClient({ region: process.env.AWS_REGION });

async function importFromS3() {
  // List all objects in the temporary S3 bucket
  const listCommand = new ListObjectsV2Command({
    Bucket: process.env.AWS_S3_BUCKET_TEMP,
    Prefix: 'temp-storage/',
  });
  const listedObjects = await s3Client.send(listCommand);

  // Download each object and prepare for import
  for (const object of listedObjects.Contents || []) {
    const getObjectCommand = new GetObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_TEMP,
      Key: object.Key,
    });
    const response = await s3Client.send(getObjectCommand);
    const content = await response.Body?.transformToString();
    
    // Upload content to the HealthLake import S3 location
    // This step depends on how HealthLake expects import files to be structured
  }

  // Start HealthLake import job
  const importCommand = new StartFHIRImportJobCommand({
    DatastoreId: process.env.AWS_HEALTHLAKE_DATASTORE_ID,
    InputDataConfig: {
      S3Uri: `s3://${process.env.AWS_S3_BUCKET}/healthlake-import/`,
    },
    JobOutputDataConfig: {
      S3Configuration: {
        S3Uri: `s3://${process.env.AWS_S3_BUCKET}/import-results/`,
        KmsKeyId: process.env.AWS_KMS_KEY_ID,
      }
    },
    DataAccessRoleArn: process.env.AWS_HEALTHLAKE_ROLE_ARN,
  });

  const importResponse = await healthLakeClient.send(importCommand);
  console.log("Import job started:", importResponse.JobId);
}

importFromS3().catch(console.error);