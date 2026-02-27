import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import * as tar from 'tar';
import matter from 'gray-matter';
import semver from 'semver';
import { queryOne, execute, transaction } from '../db/connection.js';
import { config } from '../config.js';
import { SKILL_NAME_REGEX } from '@skill-store/shared';

interface ParsedSkill {
  name: string;
  displayName: string;
  description: string;
  version: string;
  license: string;
  homepage?: string;
  official?: boolean;
  readme: string;
  metadata: Record<string, any>;
}

export function parseSkillTarball(buffer: Buffer): Promise<ParsedSkill> {
  return new Promise((resolve, reject) => {
    const tmpDir = path.join(config.dataDir, 'tmp-' + Date.now());
    fs.mkdirSync(tmpDir, { recursive: true });
    const tarPath = path.join(tmpDir, 'upload.tar.gz');
    fs.writeFileSync(tarPath, buffer);

    tar.x({ file: tarPath, cwd: tmpDir, strip: 1 })
      .then(() => {
        const skillMdPath = path.join(tmpDir, 'SKILL.md');
        if (!fs.existsSync(skillMdPath)) {
          throw new Error('SKILL.md not found in archive');
        }
        const raw = fs.readFileSync(skillMdPath, 'utf-8');
        const { data, content } = matter(raw);

        if (!data.name || !SKILL_NAME_REGEX.test(data.name)) {
          throw new Error('Invalid skill name in SKILL.md frontmatter');
        }
        if (!data.description) throw new Error('Missing description in SKILL.md');
        if (!data.version || !semver.valid(data.version)) {
          throw new Error('Invalid semver version in SKILL.md');
        }

        resolve({
          name: data.name,
          displayName: data.display_name || data.name,
          description: data.description,
          version: data.version,
          license: data.license || 'MIT',
          homepage: data.homepage,
          official: !!data.official,
          readme: content.trim(),
          metadata: data,
        });
      })
      .catch(reject)
      .finally(() => fs.rmSync(tmpDir, { recursive: true, force: true }));
  });
}

export function savePackage(name: string, version: string, buffer: Buffer) {
  const dir = path.join(config.packagesDir, name);
  fs.mkdirSync(dir, { recursive: true });
  const filePath = path.join(dir, `${name}-${version}.tar.gz`);
  fs.writeFileSync(filePath, buffer);
  const checksum = crypto.createHash('sha256').update(buffer).digest('hex');
  return { filePath, fileSize: buffer.length, checksum };
}

export function publishVersion(
  authorId: number,
  parsed: ParsedSkill,
  filePath: string,
  fileSize: number,
  checksum: string
) {
  return transaction(() => {
    let skill = queryOne('SELECT id FROM skills WHERE name = ?', [parsed.name]);

    if (skill) {
      const owner = queryOne('SELECT author_id FROM skills WHERE id = ?', [skill.id]);
      if (owner.author_id !== authorId) throw new Error('Not the skill owner');
    }

    const categoryRow = queryOne('SELECT id FROM categories WHERE name = ?', ['other']);
    const categoryId = categoryRow?.id || null;

    if (!skill) {
      const info = execute(
        `INSERT INTO skills (name, display_name, description, author_id, category_id, license, homepage, official, latest_version)
         VALUES (?,?,?,?,?,?,?,?,?)`,
        [parsed.name, parsed.displayName, parsed.description,
         authorId, categoryId, parsed.license, parsed.homepage || null,
         parsed.official ? 1 : 0, parsed.version]
      );
      skill = { id: info.lastInsertRowid };
    } else {
      execute(
        `UPDATE skills SET display_name=?, description=?, license=?, homepage=?, latest_version=?, updated_at=datetime('now') WHERE id=?`,
        [parsed.displayName, parsed.description, parsed.license, parsed.homepage || null, parsed.version, skill.id]
      );
    }

    const existing = queryOne('SELECT id FROM versions WHERE skill_id=? AND version=?', [skill.id, parsed.version]);
    if (existing) throw new Error(`Version ${parsed.version} already exists`);

    execute(
      `INSERT INTO versions (skill_id, version, readme_md, metadata, tarball_path, file_size, checksum)
       VALUES (?,?,?,?,?,?,?)`,
      [skill.id, parsed.version, parsed.readme, JSON.stringify(parsed.metadata), filePath, fileSize, checksum]
    );

    return skill.id;
  });
}
