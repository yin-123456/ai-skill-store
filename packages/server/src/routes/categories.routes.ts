import { Router } from 'express';
import { queryAll } from '../db/connection.js';

const router = Router();

router.get('/', (_req, res) => {
  const rows = queryAll('SELECT * FROM categories ORDER BY sort_order');
  res.json(rows);
});

export default router;
