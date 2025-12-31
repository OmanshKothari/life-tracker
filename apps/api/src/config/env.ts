import dotenv from 'dotenv';
import path from 'path';

// Load .env file from api folder
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

interface Environment {
  NODE_ENV: 'development' | 'production' | 'test';
  PORT: number;
  DATABASE_URL: string;
}

function getEnv(): Environment {
  const NODE_ENV = (process.env.NODE_ENV as Environment['NODE_ENV']) || 'development';
  const PORT = parseInt(process.env.PORT || '3001', 10);
  const DATABASE_URL = process.env.DATABASE_URL;

  if (!DATABASE_URL) {
    throw new Error('❌ DATABASE_URL environment variable is required');
  }

  return {
    NODE_ENV,
    PORT,
    DATABASE_URL,
  };
}

export const env = getEnv();
