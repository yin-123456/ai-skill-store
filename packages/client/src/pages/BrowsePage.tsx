import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import { api } from '../api/client';
import SkillCard from '../components/SkillCard';

export default function BrowsePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState<any>({ skills: [], total: 0, page: 1 });
  const [categories, setCategories] = useState<any[]>([]);
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [loading, setLoading] = useState(true);

  const category = searchParams.get('category') || '';
  const sort = searchParams.get('sort') || 'newest';
  const page = parseInt(searchParams.get('page') || '1');

  useEffect(() => {
    api.getCategories().then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params: Record<string, string> = {};
    if (query) params.q = query;
    if (category) params.category = category;
    if (sort) params.sort = sort;
    params.page = String(page);
    api.getSkills(params).then(setData).catch(() => {}).finally(() => setLoading(false));
  }, [query, category, sort, page]);

  const updateParam = (key: string, val: string) => {
    const p = new URLSearchParams(searchParams);
    if (val) p.set(key, val); else p.delete(key);
    p.delete('page');
    setSearchParams(p);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={searchParams.get('q') || ''}
            onChange={(e) => { setQuery(e.target.value); updateParam('q', e.target.value); }}
            placeholder="Search skills..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:border-primary-500 focus:ring-1 focus:ring-primary-200 outline-none text-sm"
          />
        </div>
        <select
          value={category}
          onChange={(e) => updateParam('category', e.target.value)}
          className="px-3 py-2 rounded-lg border border-gray-300 text-sm bg-white"
        >
          <option value="">All Categories</option>
          {categories.map((c: any) => (
            <option key={c.name} value={c.name}>{c.icon} {c.label}</option>
          ))}
        </select>
        <select
          value={sort}
          onChange={(e) => updateParam('sort', e.target.value)}
          className="px-3 py-2 rounded-lg border border-gray-300 text-sm bg-white"
        >
          <option value="newest">Newest</option>
          <option value="downloads">Most Downloads</option>
          <option value="rating">Highest Rated</option>
        </select>
      </div>

      {loading ? (
        <p className="text-center text-gray-400 py-20">Loading...</p>
      ) : data.skills.length === 0 ? (
        <p className="text-center text-gray-400 py-20">No skills found.</p>
      ) : (
        <>
          <p className="text-sm text-gray-500 mb-4">{data.total} skill{data.total !== 1 ? 's' : ''} found</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.skills.map((s: any) => <SkillCard key={s.id} skill={s} />)}
          </div>
          {data.total > 20 && (
            <div className="flex justify-center gap-2 mt-8">
              {Array.from({ length: Math.ceil(data.total / 20) }, (_, i) => (
                <button
                  key={i}
                  onClick={() => updateParam('page', String(i + 1))}
                  className={`px-3 py-1 rounded text-sm ${page === i + 1 ? 'bg-primary-600 text-white' : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'}`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
