import { Router } from 'express';
import { config } from '../config.js';
import { exchangeCodeForToken, fetchGitHubUser, upsertUser, signJwt } from '../services/auth.service.js';

const router = Router();

router.get('/github', (_req, res) => {
  const url = `https://github.com/login/oauth/authorize?client_id=${config.github.clientId}&scope=read:user,user:email`;
  res.redirect(url);
});

router.get('/github/callback', async (req, res) => {
  try {
    const code = req.query.code as string;
    if (!code) return res.status(400).json({ error: 'Missing code' });

    const accessToken = await exchangeCodeForToken(code);
    const ghUser = await fetchGitHubUser(accessToken);
    const user = upsertUser(ghUser);
    const token = signJwt(user as any);

    res.redirect(`${config.clientUrl}/auth/callback?token=${token}`);
  } catch (err: any) {
    console.error('OAuth error:', err.message);
    res.redirect(`${config.clientUrl}/auth/callback?error=${encodeURIComponent(err.message)}`);
  }
});

export default router;
