import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const config = {
  port: parseInt(process.env.PORT || '3001'),
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-in-production',
  github: {
    clientId: process.env.GITHUB_CLIENT_ID || '',
    clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
    callbackUrl: process.env.GITHUB_CALLBACK_URL || 'http://localhost:3001/api/v1/auth/github/callback',
  },
  adminUsername: process.env.ADMIN_GITHUB_USERNAME || '',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  dataDir: path.join(__dirname, '..', 'data'),
  dbPath: path.join(__dirname, '..', 'data', 'store.db'),
  packagesDir: path.join(__dirname, '..', 'data', 'packages'),
};
