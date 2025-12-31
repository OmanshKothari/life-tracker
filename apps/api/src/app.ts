import express from 'express';
import cors from 'cors';

import { errorHandler } from './middlewares/errorHandler';
import { notFoundHandler } from './middlewares/notFoundHandler';
import { requestLogger } from './middlewares/requestLogger';

// Import routes
import healthRouter from './routes/health.routes';
import apiRouter from './routes/index';

const app: express.Application = express();

// ==========================================================================
// MIDDLEWARE
// ==========================================================================

// Parse JSON bodies
app.use(express.json());

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// Enable CORS for all origins (we'll restrict this later)
app.use(cors());

// Request logging (development only)
app.use(requestLogger);

// ==========================================================================
// ROUTES
// ==========================================================================

// Health check endpoint
app.use('/health', healthRouter);

// API routes (versioned)
app.use('/api/v1', apiRouter);

// ==========================================================================
// ERROR HANDLING
// ==========================================================================

// 404 handler - must be after all routes
app.use(notFoundHandler);

// Global error handler - must be last
app.use(errorHandler);

export default app;
