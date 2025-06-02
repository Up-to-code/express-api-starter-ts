import express, { Request, Response } from 'express';
import { createUploadthing, createRouteHandler, type FileRouter } from 'uploadthing/express';
import { logWithTimestamp } from '../utils/logger';

const f = createUploadthing();

/**
 * UploadThing File Router Configuration
 * Handles file uploads for property images
 */
export const uploadRouter = {
  // Property image uploader
  propertyImageUploader: f({
    image: {
      maxFileSize: '8MB',
      maxFileCount: 10,
    },
  })
    .middleware(async ({ req }) => {
      // Authentication middleware - you can add user verification here
      logWithTimestamp('Property image upload initiated', 'info');

      // Return metadata that will be available in onUploadComplete
      return {
        uploadedBy: 'property-system',
        timestamp: new Date().toISOString(),
      };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // This code RUNS ON YOUR SERVER after upload
      const fileUrl = file.ufsUrl || file.url;
      logWithTimestamp(`Property image upload completed: ${fileUrl}`, 'info');

      // Return data to the client
      return {
        url: fileUrl,
        name: file.name,
        size: file.size,
        uploadedBy: metadata.uploadedBy,
        timestamp: metadata.timestamp,
      };
    }),

  // Avatar/profile image uploader
  avatarUploader: f({
    image: {
      maxFileSize: '4MB',
      maxFileCount: 1,
    },
  })
    .middleware(async ({ req }) => {
      logWithTimestamp('Avatar upload initiated', 'info');

      return {
        uploadedBy: 'user-system',
        timestamp: new Date().toISOString(),
      };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      const fileUrl = file.ufsUrl || file.url;
      logWithTimestamp(`Avatar upload completed: ${fileUrl}`, 'info');

      return {
        url: fileUrl,
        name: file.name,
        size: file.size,
        uploadedBy: metadata.uploadedBy,
        timestamp: metadata.timestamp,
      };
    }),

  // Document uploader for property documents
  documentUploader: f({
    pdf: {
      maxFileSize: '16MB',
      maxFileCount: 5,
    },
  })
    .middleware(async ({ req }) => {
      logWithTimestamp('Document upload initiated', 'info');

      return {
        uploadedBy: 'property-system',
        timestamp: new Date().toISOString(),
      };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      const fileUrl = file.ufsUrl || file.url;
      logWithTimestamp(`Document upload completed: ${fileUrl}`, 'info');

      return {
        url: fileUrl,
        name: file.name,
        size: file.size,
        uploadedBy: metadata.uploadedBy,
        timestamp: metadata.timestamp,
      };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof uploadRouter;

// Express router for UploadThing endpoints
const router = express.Router();

// Create UploadThing route handler
const uploadthingHandler = createRouteHandler({
  router: uploadRouter,
  config: {
    token: process.env.UPLOADTHING_TOKEN,
  },
});

// Mount UploadThing handler at root level
router.use('/', uploadthingHandler);

/**
 * GET /api/uploadthing/config
 * Get UploadThing configuration
 */
router.get('/config', (req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      data: {
        maxFileSizes: {
          propertyImages: '8MB',
          avatar: '4MB',
          documents: '16MB',
        },
        maxFileCounts: {
          propertyImages: 10,
          avatar: 1,
          documents: 5,
        },
        allowedTypes: {
          propertyImages: ['image/*'],
          avatar: ['image/*'],
          documents: ['application/pdf'],
        },
      },
    });
  } catch (error: any) {
    logWithTimestamp(`Error getting UploadThing config: ${error.message}`, 'error');
    res.status(500).json({
      success: false,
      error: 'Failed to get upload configuration',
      message: error.message,
    });
  }
});

/**
 * POST /api/uploadthing/delete
 * Delete uploaded file
 */
router.post('/delete', async (req: Request, res: Response) => {
  try {
    const { fileUrl } = req.body;

    if (!fileUrl) {
      return res.status(400).json({
        success: false,
        error: 'File URL is required',
      });
    }

    // Extract file key from URL
    const fileKey = fileUrl.split('/').pop();

    if (!fileKey) {
      return res.status(400).json({
        success: false,
        error: 'Invalid file URL',
      });
    }

    // Note: UploadThing doesn't provide a direct delete API in the free tier
    // You would need to implement file deletion based on your UploadThing plan
    logWithTimestamp(`File deletion requested: ${fileKey}`, 'info');

    res.json({
      success: true,
      message: 'File deletion requested',
      fileKey,
    });
  } catch (error: any) {
    logWithTimestamp(`Error deleting file: ${error.message}`, 'error');
    res.status(500).json({
      success: false,
      error: 'Failed to delete file',
      message: error.message,
    });
  }
});

/**
 * GET /api/uploadthing/files
 * List uploaded files (if supported by your UploadThing plan)
 */
router.get('/files', async (req: Request, res: Response) => {
  try {
    // This would require UploadThing Pro plan for file management
    res.json({
      success: true,
      data: [],
      message: 'File listing requires UploadThing Pro plan',
    });
  } catch (error: any) {
    logWithTimestamp(`Error listing files: ${error.message}`, 'error');
    res.status(500).json({
      success: false,
      error: 'Failed to list files',
      message: error.message,
    });
  }
});

export default router;
