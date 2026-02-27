import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { Star, Download, Calendar, Shield } from 'lucide-react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function SkillDetailPage() {
  const { name } = useParams<{ name: string }>();
  const { user } = useAuth();
  const [skill, setSkill] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reviewForm, setReviewForm] = useState({ rating: 5, title: '', body: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!name) return;
    setLoading(true);
    api.getSkill(name).then(setSkill).catch(() => {}).finally(() => setLoading(false));
  }, [name]);

  const handleReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    setSubmitting(true);
    try {
      await api.postReview(name, reviewForm);
      const updated = await api.getSkill(name);
      setSkill(updated);
      setReviewForm({ rating: 5, title: '', body: '' });
    } catch { }
    setSubmitting(false);
  };

  if (loading) return <p className="text-center text-gray-400 py-20">Loading...</p>;
  if (!skill) return <p className="text-center text-gray-400 py-20">Skill not found.</p>;

  const latestVersion = skill.versions?.[0];
  const readme = latestVersion?.readme_md || skill.versions?.find((v: any) => v.readme_md)?.readme_md;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold text-gray-900">{skill.display_name}</h1>
              {skill.official ? <Shield className="w-5 h-5 text-primary-500" /> : null}
            </div>
            <p className="text-gray-500 text-sm">
              by {skill.author_username} · {skill.category_label || 'Uncategorized'}
            </p>
          </div>
          <a
            href={api.downloadSkill(skill.name)}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors flex items-center gap-2"
          >
            <Download className="w-4 h-4" /> Install
          </a>
        </div>
        <p className="text-gray-700 mb-4">{skill.description}</p>
        <div className="flex items-center gap-6 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
            {skill.avg_rating > 0 ? `${skill.avg_rating.toFixed(1)} (${skill.rating_count})` : 'No ratings'}
          </span>
          <span className="flex items-center gap-1">
            <Download className="w-4 h-4" /> {skill.download_count} downloads
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="w-4 h-4" /> v{skill.latest_version}
          </span>
        </div>
      </div>

      {/* README */}
      {readme && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 prose prose-sm max-w-none">
          <ReactMarkdown>{readme}</ReactMarkdown>
        </div>
      )}

      {/* Versions */}
      {skill.versions?.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h2 className="font-semibold mb-3">Versions</h2>
          <div className="space-y-2">
            {skill.versions.map((v: any) => (
              <div key={v.id} className="flex items-center justify-between text-sm py-1.5 border-b border-gray-100 last:border-0">
                <span className="font-mono text-primary-600">v{v.version}</span>
                <span className="text-gray-400">{new Date(v.created_at).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reviews */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold mb-4">Reviews ({skill.reviews?.length || 0})</h2>
        {user && (
          <form onSubmit={handleReview} className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-4 mb-3">
              <label className="text-sm text-gray-600">Rating:</label>
              <select
                value={reviewForm.rating}
                onChange={(e) => setReviewForm({ ...reviewForm, rating: +e.target.value })}
                className="border border-gray-300 rounded px-2 py-1 text-sm"
              >
                {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{'★'.repeat(n)}</option>)}
              </select>
            </div>
            <input
              value={reviewForm.title}
              onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })}
              placeholder="Title (optional)"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-2"
            />
            <textarea
              value={reviewForm.body}
              onChange={(e) => setReviewForm({ ...reviewForm, body: e.target.value })}
              placeholder="Write your review..."
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-2"
            />
            <button
              type="submit"
              disabled={submitting}
              className="bg-primary-600 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-primary-700 disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        )}
        <div className="space-y-4">
          {skill.reviews?.map((r: any) => (
            <div key={r.id} className="border-b border-gray-100 pb-3 last:border-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-amber-400 text-sm">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                <span className="text-sm font-medium text-gray-700">{r.username}</span>
                <span className="text-xs text-gray-400">{new Date(r.created_at).toLocaleDateString()}</span>
              </div>
              {r.title && <p className="text-sm font-medium text-gray-800">{r.title}</p>}
              {r.body && <p className="text-sm text-gray-600">{r.body}</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
