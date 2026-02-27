import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/admin.js';
import { queryAll, execute } from '../db/connection.js';

const router = Router();

router.use(authenticate, requireAdmin);

// Pending submissions
router.get('/submissions', (_req, res) => {
  const rows = queryAll(`
    SELECT s.*, u.username as author_username
    FROM skills s JOIN users u ON s.author_id = u.id
    WHERE s.status = 'pending' ORDER BY s.created_at ASC
  `);
  res.json(rows);
});

// Approve / reject
router.patch('/skills/:id/status', (req, res) => {
  const { status } = req.body;
  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ error: 'Status must be approved or rejected' });
  }
  execute("UPDATE skills SET status=?, updated_at=datetime('now') WHERE id=?",
    [status, req.params.id]);
  res.json({ ok: true });
});

// Toggle featured
router.patch('/skills/:id/featured', (req, res) => {
  const { featured } = req.body;
  execute("UPDATE skills SET featured=?, updated_at=datetime('now') WHERE id=?",
    [featured ? 1 : 0, req.params.id]);
  res.json({ ok: true });
});

export default router;
