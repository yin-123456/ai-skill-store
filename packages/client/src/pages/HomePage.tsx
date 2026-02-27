import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, ArrowRight } from 'lucide-react';
import { api } from '../api/client';
import SkillCard from '../components/SkillCard';

export default function HomePage() {
  const [featured, setFeatured] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [query, setQuery] = useState('');

  useEffect(() => {
    api.getFeatured().then(setFeatured).catch(() => {});
    api.getCategories().then(setCategories).catch(() => {});
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <section className="text-center mb-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Discover AI Skills
        </h1>
        <p className="text-lg text-gray-500 mb-8 max-w-xl mx-auto">
          Browse, install, and share skills that extend your AI agent's capabilities.
        </p>
        <form
          onSubmit={(e) => { e.preventDefault(); if (query.trim()) window.location.href = `/browse?q=${encodeURIComponent(query)}`; }}
          className="max-w-lg mx-auto relative"
        >
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search skills..."
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none transition-all text-base"
          />
        </form>
      </section>

      {categories.length > 0 && (
        <section className="mb-16">
          <h2 className="text-xl font-semibold mb-4">Categories</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {categories.map((c: any) => (
              <Link
                key={c.name}
                to={`/browse?category=${c.name}`}
                className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-4 py-3 hover:border-primary-300 hover:shadow-sm transition-all text-sm"
              >
                <span className="text-xl">{c.icon}</span>
                <span className="text-gray-700">{c.label}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {featured.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Featured Skills</h2>
            <Link to="/browse" className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1">
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {featured.map((s: any) => <SkillCard key={s.id} skill={s} />)}
          </div>
        </section>
      )}
    </div>
  );
}
