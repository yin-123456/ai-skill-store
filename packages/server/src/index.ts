import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { config } from './config.js';
import { initDb } from './db/connection.js';
import { errorHandler } from './middleware/errors.js';
import authRoutes from './routes/auth.routes.js';
import skillsRoutes from './routes/skills.routes.js';
import reviewsRoutes from './routes/reviews.routes.js';
import categoriesRoutes from './routes/categories.routes.js';
import adminRoutes from './routes/admin.routes.js';

async function main() {
  await initDb();

  const app = express();

  app.use(helmet());
  app.use(cors({ origin: config.clientUrl, credentials: true }));
  app.use(express.json());
  app.use(rateLimit({ windowMs: 60_000, max: 100 }));

  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/skills', skillsRoutes);
  app.use('/api/v1/skills', reviewsRoutes);
  app.use('/api/v1/categories', categoriesRoutes);
  app.use('/api/v1/admin', adminRoutes);

  app.use(errorHandler);

  app.listen(config.port, () => {
    console.log(`Skill Store API running on http://localhost:${config.port}`);
  });
}

main().catch(console.error);
