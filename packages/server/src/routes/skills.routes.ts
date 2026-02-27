import { Router, Response } from 'express';
import { authenticate, AuthRequest, optionalAuth } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { listSkills, getSkillByName, getFeaturedSkills, getUserSkills } from '../services/skill.service.js';
import { parseSkillTarball, savePackage, publishVersion } from '../services/package.service.js';
import { getReviews } from '../services/review.service.js';
import { queryAll, queryOne, execute } from '../db/connection.js';

const router = Router();

// Browse / search
router.get('/', (req, res) => {
  const { q, category, sort, page } = req.query;
  const result = listSkills({
    q: q as string | undefined,
    category: category as string | undefined,
    sort: sort as string | undefined,
    page: page ? parseInt(String(page)) : 1,
  });
  res.json(result);
});

// Featured skills
router.get('/featured', (_req, res) => {
  res.json(getFeaturedSkills());
});

// My skills
router.get('/mine', authenticate, (req: AuthRequest, res: Response) => {
  res.json(getUserSkills(req.user!.id));
});

// Skill detail
router.get('/:name', optionalAuth, (req, res) => {
  const skill = getSkillByName(String(req.params.name));
  if (!skill) return res.status(404).json({ error: 'Skill not found' });

  const versions = queryAll(
    'SELECT id, version, file_size, checksum, created_at FROM versions WHERE skill_id = ? ORDER BY created_at DESC',
    [(skill as any).id]
  );

  const reviews = getReviews((skill as any).id);
  res.json({ ...skill, versions, reviews });
});

// Publish
router.post('/', authenticate, upload.single('tarball'), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const parsed = await parseSkillTarball(req.file.buffer);
    const { filePath, fileSize, checksum } = savePackage(parsed.name, parsed.version, req.file.buffer);
    const skillId = publishVersion(req.user!.id, parsed, filePath, fileSize, checksum);

    res.status(201).json({ id: skillId, name: parsed.name, version: parsed.version });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Download
router.get('/:name/download', (req, res) => {
  const skill = queryOne('SELECT id FROM skills WHERE name = ? AND status = ?', [req.params.name, 'approved']);
  if (!skill) return res.status(404).json({ error: 'Skill not found' });

  const version = queryOne(
    'SELECT tarball_path FROM versions WHERE skill_id = ? ORDER BY created_at DESC LIMIT 1',
    [skill.id]
  );
  if (!version) return res.status(404).json({ error: 'No version found' });

  execute('UPDATE skills SET download_count = download_count + 1 WHERE id = ?', [skill.id]);
  res.download(version.tarball_path);
});

export default router;
