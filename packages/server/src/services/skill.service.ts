import { queryAll, queryOne } from '../db/connection.js';
import { PAGE_SIZE } from '@skill-store/shared';

interface ListParams {
  q?: string;
  category?: string;
  sort?: string;
  page?: number;
  status?: string;
}

export function listSkills(params: ListParams) {
  const { q, category, sort = 'newest', page = 1, status = 'approved' } = params;
  const conditions: string[] = ['s.status = ?'];
  const values: any[] = [status];

  if (q) {
    conditions.push('(s.name LIKE ? OR s.display_name LIKE ? OR s.description LIKE ?)');
    const like = `%${q}%`;
    values.push(like, like, like);
  }
  if (category) {
    conditions.push('c.name = ?');
    values.push(category);
  }

  const where = conditions.join(' AND ');
  const orderBy =
    sort === 'downloads' ? 's.download_count DESC' :
    sort === 'rating' ? 's.avg_rating DESC' :
    's.created_at DESC';

  const offset = (page - 1) * PAGE_SIZE;

  const rows = queryAll(`
    SELECT s.*, c.name as category_name, c.label as category_label, c.icon as category_icon,
           u.username as author_username, u.avatar_url as author_avatar
    FROM skills s
    LEFT JOIN categories c ON s.category_id = c.id
    LEFT JOIN users u ON s.author_id = u.id
    WHERE ${where}
    ORDER BY ${orderBy}
    LIMIT ? OFFSET ?
  `, [...values, PAGE_SIZE, offset]);

  const total = queryOne(
    `SELECT COUNT(*) as count FROM skills s LEFT JOIN categories c ON s.category_id = c.id WHERE ${where}`,
    values
  );

  return { skills: rows, total: total?.count ?? 0, page, pageSize: PAGE_SIZE };
}

export function getSkillByName(name: string) {
  return queryOne(`
    SELECT s.*, c.name as category_name, c.label as category_label, c.icon as category_icon,
           u.username as author_username, u.avatar_url as author_avatar, u.display_name as author_display_name
    FROM skills s
    LEFT JOIN categories c ON s.category_id = c.id
    LEFT JOIN users u ON s.author_id = u.id
    WHERE s.name = ?
  `, [name]);
}

export function getFeaturedSkills(limit = 6) {
  return queryAll(`
    SELECT s.*, c.name as category_name, c.label as category_label, c.icon as category_icon,
           u.username as author_username, u.avatar_url as author_avatar
    FROM skills s
    LEFT JOIN categories c ON s.category_id = c.id
    LEFT JOIN users u ON s.author_id = u.id
    WHERE s.status = 'approved' AND s.featured = 1
    ORDER BY s.download_count DESC
    LIMIT ?
  `, [limit]);
}

export function getUserSkills(userId: number) {
  return queryAll(`
    SELECT s.*, c.label as category_label FROM skills s
    LEFT JOIN categories c ON s.category_id = c.id
    WHERE s.author_id = ? ORDER BY s.updated_at DESC
  `, [userId]);
}
