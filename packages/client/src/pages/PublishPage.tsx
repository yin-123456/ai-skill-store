import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileArchive } from 'lucide-react';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function PublishPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const [publishing, setPublishing] = useState(false);

  if (!user) {
    return (
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <p className="text-gray-500 mb-4">Please sign in to publish skills.</p>
        <a href="/api/v1/auth/github" className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm">
          Sign in with GitHub
        </a>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setError('');
    setPublishing(true);
    try {
      const result = await api.publishSkill(file);
      navigate(`/skills/${result.name}`);
    } catch (err: any) {
      setError(err.message);
    }
    setPublishing(false);
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-6">Publish a Skill</h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6">
        <label className="block mb-6">
          <div
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
              file ? 'border-primary-400 bg-primary-50' : 'border-gray-300 hover:border-primary-300'
            }`}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); setFile(e.dataTransfer.files[0]); }}
          >
            {file ? (
              <div className="flex items-center justify-center gap-2 text-primary-600">
                <FileArchive className="w-6 h-6" />
                <span className="font-medium">{file.name}</span>
                <span className="text-sm text-gray-400">({(file.size / 1024).toFixed(1)} KB)</span>
              </div>
            ) : (
              <>
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Drop a .tar.gz file here or click to browse</p>
                <p className="text-xs text-gray-400 mt-1">Must contain a valid SKILL.md with frontmatter</p>
              </>
            )}
            <input
              type="file"
              accept=".tar.gz,.tgz,application/gzip"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </div>
        </label>

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <button
          type="submit"
          disabled={!file || publishing}
          className="w-full bg-primary-600 text-white py-2.5 rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 transition-colors"
        >
          {publishing ? 'Publishing...' : 'Publish Skill'}
        </button>
      </form>
    </div>
  );
}
