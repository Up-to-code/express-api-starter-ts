/**
 * Main Express application configuration
 *
 * This file sets up the Express application with middleware and routes.
 * It configures security, logging, CORS, and JSON parsing middleware,
 * and mounts all API routes under the /api/v1 prefix.
 *
 * @module app
 */

import express from 'express';
import morgan from 'morgan';
import helmet from 'helmet';
import cors from 'cors';

import * as middlewares from './middlewares';
import webhook from './api/webhook/whatsapp';
import marketing from './api/marketing';
import Client from './api/Client';
import Dashboard from '../src/routes/home';
import sendWhatsAppMessage from './api/Massage/sendWhatsAppMessage';
import qaPairs from './routes/qaPairs';
// import Massage from './api/Massage';

// Load environment variables from .env file
require('dotenv').config();

// Create Express application
const app = express();

// Configure middleware
app.use(morgan('dev')); // HTTP request logging
app.use(helmet()); // Security headers
app.use(cors()); // Cross-Origin Resource Sharing
app.use(express.json()); // Parse JSON request bodies

// Mount API routes
app.use('/api/v1/', Dashboard); // Dashboard and statistics routes
app.use('/api/v1/webhook/whatsapp', webhook); // WhatsApp webhook routes
app.use('/api/v1/marketing', marketing); // Marketing campaign routes
app.use('/api/v1/clients', Client); // Client management routes
app.use('/api/v1/sendWhatsAppMessage', sendWhatsAppMessage); // Direct message sending route
app.use('/api/v1/qa-pairs', qaPairs); // QA pairs routes
// app.use('/api/v1/massage', Massage); // Message management routes (commented out)

// Error handling middleware
app.use(middlewares.notFound); // 404 handler
app.use(middlewares.errorHandler); // Error handler

export default app;
