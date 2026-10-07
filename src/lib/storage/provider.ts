export const StorageProvider = {
  write: async (key: string, buffer: Buffer, mimeType: string): Promise<string> => {
    // In a real implementation, this would use fs to write locally or AWS SDK for S3/MinIO
    // Mock implementation for the scope of this engine
    return `/uploads/${key}`;
  }
};
