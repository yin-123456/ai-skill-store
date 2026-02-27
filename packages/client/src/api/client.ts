const BASE = '/api/v1';

async function request<T>(url: string, opts?: RequestInit): Promise<T> {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = { ...opts?.headers as any };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (!(opts?.body instanceof FormData)) headers['Content-Type'] = 'application/json';

  const res = await fetch(BASE + url, { ...opts, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Request failed');
  }
  return res.json();
}

export const api = {
  getSkills: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<any>(`/skills${qs}`);
  },
  getFeatured: () => request<any[]>('/skills/featured'),
  getSkill: (name: string) => request<any>(`/skills/${name}`),
  getCategories: () => request<any[]>('/categories'),
  publishSkill: (file: File) => {
    const form = new FormData();
    form.append('tarball', file);
    return request<any>('/skills', { method: 'POST', body: form });
  },
  downloadSkill: (name: string) => `${BASE}/skills/${name}/download`,
  postReview: (name: string, data: { rating: number; title?: string; body?: string }) =>
    request<any>(`/skills/${name}/reviews`, { method: 'POST', body: JSON.stringify(data) }),
  getMySkills: () => request<any[]>('/skills/mine'),
  // Admin
  getSubmissions: () => request<any[]>('/admin/submissions'),
  updateSkillStatus: (id: number, status: string) =>
    request<any>(`/admin/skills/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  toggleFeatured: (id: number, featured: boolean) =>
    request<any>(`/admin/skills/${id}/featured`, { method: 'PATCH', body: JSON.stringify({ featured }) }),
};
