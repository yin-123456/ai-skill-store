import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { Check, X, Star } from 'lucide-react';

export default function AdminPage() {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role !== 'admin') return;
    api.getSubmissions().then(setSubmissions).catch(() => {}).finally(() => setLoading(false));
  }, [user]);

  if (!user || user.role !== 'admin') {
    return <p className="text-center text-gray-400 py-20">Admin access required.</p>;
  }

  const handleStatus = async (id: number, status: string) => {
    await api.updateSkillStatus(id, status);
    setSubmissions((prev) => prev.filter((s) => s.id !== id));
  };

  const handleFeatured = async (id: number, featured: boolean) => {
    await api.toggleFeatured(id, featured);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Admin Panel</h1>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold mb-4">Pending Submissions ({submissions.length})</h2>

        {loading ? (
          <p className="text-gray-400 text-sm py-8 text-center">Loading...</p>
        ) : submissions.length === 0 ? (
          <p className="text-gray-400 text-sm py-8 text-center">No pending submissions.</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {submissions.map((s: any) => (
              <div key={s.id} className="py-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{s.display_name}</p>
                  <p className="text-sm text-gray-500">
                    {s.name} · by {s.author_username} · {new Date(s.created_at).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">{s.description}</p>
                </div>
                <div className="flex items-center gap-2 ml-4 shrink-0">
                  <button
                    onClick={() => handleFeatured(s.id, true)}
                    className="p-1.5 rounded-lg border border-gray-200 text-amber-500 hover:bg-amber-50"
                    title="Feature"
                  >
                    <Star className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleStatus(s.id, 'approved')}
                    className="p-1.5 rounded-lg border border-gray-200 text-green-600 hover:bg-green-50"
                    title="Approve"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleStatus(s.id, 'rejected')}
                    className="p-1.5 rounded-lg border border-gray-200 text-red-500 hover:bg-red-50"
                    title="Reject"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
