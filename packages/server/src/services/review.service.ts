import { queryAll, queryOne, execute } from '../db/connection.js';

export function addReview(skillId: number, userId: number, rating: number, title: string | null, body: string | null) {
  execute(
    `INSERT INTO reviews (skill_id, user_id, rating, title, body) VALUES (?,?,?,?,?)
     ON CONFLICT(skill_id, user_id) DO UPDATE SET rating=?, title=?, body=?, updated_at=datetime('now')`,
    [skillId, userId, rating, title, body, rating, title, body]
  );
  recalcRating(skillId);
}

export function getReviews(skillId: number) {
  return queryAll(`
    SELECT r.*, u.username, u.avatar_url
    FROM reviews r JOIN users u ON r.user_id = u.id
    WHERE r.skill_id = ? ORDER BY r.created_at DESC
  `, [skillId]);
}

function recalcRating(skillId: number) {
  const row = queryOne(
    `SELECT AVG(rating) as avg, COUNT(*) as cnt FROM reviews WHERE skill_id = ?`,
    [skillId]
  );
  execute(
    `UPDATE skills SET avg_rating = ?, rating_count = ?, updated_at = datetime('now') WHERE id = ?`,
    [Math.round((row?.avg || 0) * 10) / 10, row?.cnt || 0, skillId]
  );
}
