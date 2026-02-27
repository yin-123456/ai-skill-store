import jwt from 'jsonwebtoken';
import { config } from '../config.js';
import { queryOne, execute } from '../db/connection.js';

interface GitHubUser {
  id: number;
  login: string;
  name: string | null;
  avatar_url: string;
  email: string | null;
}

export function exchangeCodeForToken(code: string): Promise<string> {
  return fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      client_id: config.github.clientId,
      client_secret: config.github.clientSecret,
      code,
    }),
  })
    .then((r) => r.json())
    .then((data: any) => {
      if (data.error) throw new Error(data.error_description || data.error);
      return data.access_token as string;
    });
}

export async function fetchGitHubUser(accessToken: string): Promise<GitHubUser> {
  const res = await fetch('https://api.github.com/user', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) throw new Error('Failed to fetch GitHub user');
  return res.json() as Promise<GitHubUser>;
}

export function upsertUser(gh: GitHubUser) {
  const role = gh.login === config.adminUsername ? 'admin' : 'user';

  const existing = queryOne('SELECT * FROM users WHERE github_id = ?', [gh.id]);
  if (existing) {
    execute(
      `UPDATE users SET username=?, display_name=?, avatar_url=?, email=?, role=?, updated_at=datetime('now') WHERE github_id=?`,
      [gh.login, gh.name, gh.avatar_url, gh.email, role, gh.id]
    );
    return { ...existing, username: gh.login, role };
  }

  const info = execute(
    `INSERT INTO users (github_id, username, display_name, avatar_url, email, role) VALUES (?,?,?,?,?,?)`,
    [gh.id, gh.login, gh.name, gh.avatar_url, gh.email, role]
  );

  return { id: info.lastInsertRowid, username: gh.login, role };
}

export function signJwt(user: { id: number; username: string; role: string }) {
  return jwt.sign({ sub: user.id, username: user.username, role: user.role }, config.jwtSecret, {
    expiresIn: '7d',
  });
}
