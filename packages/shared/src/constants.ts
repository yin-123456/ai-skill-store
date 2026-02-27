export const SKILL_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  UNLISTED: 'unlisted',
} as const;

export const USER_ROLE = {
  USER: 'user',
  ADMIN: 'admin',
} as const;

export const SORT_OPTIONS = {
  NEWEST: 'newest',
  DOWNLOADS: 'downloads',
  RATING: 'rating',
} as const;

export const DEFAULT_CATEGORIES = [
  { name: 'search', label: '搜索与检索', icon: '🔍', sort_order: 1 },
  { name: 'code-gen', label: '代码生成', icon: '💻', sort_order: 2 },
  { name: 'data', label: '数据分析', icon: '📊', sort_order: 3 },
  { name: 'document', label: '文档处理', icon: '📄', sort_order: 4 },
  { name: 'media', label: '多媒体', icon: '🎬', sort_order: 5 },
  { name: 'automation', label: '自动化', icon: '⚙️', sort_order: 6 },
  { name: 'communication', label: '通讯协作', icon: '💬', sort_order: 7 },
  { name: 'finance', label: '金融交易', icon: '💰', sort_order: 8 },
  { name: 'design', label: '设计创作', icon: '🎨', sort_order: 9 },
  { name: 'other', label: '其他', icon: '📦', sort_order: 99 },
];

export const MAX_UPLOAD_SIZE = 10 * 1024 * 1024; // 10MB
export const SKILL_NAME_REGEX = /^[a-z0-9][a-z0-9-]*[a-z0-9]$/;
export const PAGE_SIZE = 20;
