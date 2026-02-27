export interface User {
  id: number;
  github_id: number;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  email: string | null;
  role: 'user' | 'admin';
  created_at: string;
}

export interface Skill {
  id: number;
  name: string;
  display_name: string;
  description: string;
  author_id: number;
  category_id: number | null;
  license: string;
  homepage: string | null;
  official: boolean;
  status: 'pending' | 'approved' | 'rejected' | 'unlisted';
  featured: boolean;
  download_count: number;
  avg_rating: number;
  rating_count: number;
  latest_version: string | null;
  created_at: string;
  updated_at: string;
  author?: User;
  category?: Category;
}

export interface Version {
  id: number;
  skill_id: number;
  version: string;
  readme_md: string | null;
  metadata: string | null;
  tarball_path: string;
  file_size: number | null;
  checksum: string | null;
  created_at: string;
}

export interface Review {
  id: number;
  skill_id: number;
  user_id: number;
  rating: number;
  title: string | null;
  body: string | null;
  created_at: string;
  updated_at: string;
  user?: User;
}

export interface Category {
  id: number;
  name: string;
  label: string;
  description: string | null;
  icon: string | null;
  sort_order: number;
}

export interface UserInstall {
  id: number;
  user_id: number;
  skill_id: number;
  version: string;
  installed_at: string;
}
