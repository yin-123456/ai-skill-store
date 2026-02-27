import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Download, Star } from 'lucide-react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function DashboardPage() {
  const { user } = useAuth();
  const [skills, setSkills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    api.getMySkills().then(setSkills).catch(() => {}).finally(() => setLoading(false));
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <p className="text-gray-500">Please sign in to view your dashboard.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Dashboard</h1>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold">My Published Skills</h2>
          <Link to="/publish" className="text-sm text-primary-600 hover:text-primary-700">
            + Publish New
          </Link>
        </div>

        {loading ? (
          <p className="text-gray-400 text-sm py-8 text-center">Loading...</p>
        ) : skills.length === 0 ? (
          <p className="text-gray-400 text-sm py-8 text-center">
            You haven't published any skills yet.
          </p>
        ) : (
          <div className="divide-y divide-gray-100">
            {skills.map((s: any) => (
              <Link
                key={s.id}
                to={`/skills/${s.name}`}
                className="flex items-center justify-between py-3 hover:bg-gray-50 -mx-2 px-2 rounded transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Package className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{s.display_name}</p>
                    <p className="text-xs text-gray-500">v{s.latest_version} · {s.category_label}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    s.status === 'approved' ? 'bg-green-100 text-green-700' :
                    s.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>{s.status}</span>
                  <span className="flex items-center gap-1"><Download className="w-3 h-3" />{s.download_count}</span>
                  <span className="flex items-center gap-1"><Star className="w-3 h-3 text-amber-400" />{s.avg_rating > 0 ? s.avg_rating.toFixed(1) : '—'}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
