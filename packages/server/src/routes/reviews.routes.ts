import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth.js';
import { addReview, getReviews } from '../services/review.service.js';
import { queryOne } from '../db/connection.js';

const router = Router();

router.get('/:name/reviews', (req, res) => {
  const skill = queryOne('SELECT id FROM skills WHERE name = ?', [req.params.name]);
  if (!skill) return res.status(404).json({ error: 'Skill not found' });
  res.json(getReviews(skill.id));
});

router.post('/:name/reviews', authenticate, (req: AuthRequest, res: Response) => {
  const skill = queryOne('SELECT id FROM skills WHERE name = ?', [req.params.name]);
  if (!skill) return res.status(404).json({ error: 'Skill not found' });

  const { rating, title, body } = req.body;
  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Rating must be 1-5' });
  }

  addReview(skill.id, req.user!.id, rating, title || null, body || null);
  res.status(201).json({ ok: true });
});

export default router;
