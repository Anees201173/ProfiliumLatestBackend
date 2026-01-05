const AWS = require('aws-sdk');

// Configure AWS SDK for S3 using environment variables
// Make sure to set these in your .env:
// AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, S3_BUCKET_NAME

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const s3 = new AWS.S3();

/**
 * Upload a file buffer to S3.
 * @param {Object} params
 * @param {Buffer} params.buffer - File buffer
 * @param {string} params.key - S3 object key (path/filename)
 * @param {string} params.contentType - MIME type
 * @returns {Promise<string>} - Public URL or S3 location
 */
async function uploadToS3({ buffer, key, contentType }) {
  if (!process.env.S3_BUCKET_NAME) {
    throw new Error('S3_BUCKET_NAME is not configured');
  }

  const uploadParams = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: key,
    Body: buffer,
    ContentType: contentType,
    // ACL intentionally omitted because the bucket has ACLs disabled (BucketOwnerEnforced).
    // Make objects public via bucket policy if needed.
  };

  const result = await s3.upload(uploadParams).promise();
  return result.Location; // URL to the uploaded object
}

module.exports = {
  s3,
  uploadToS3,
};
