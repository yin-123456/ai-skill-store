import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Package, LogOut, User, LayoutDashboard } from 'lucide-react';

export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-lg text-primary-600">
          <Package className="w-5 h-5" />
          AI Skill Store
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link to="/browse" className="text-gray-600 hover:text-primary-600 transition-colors">Browse</Link>
          {user ? (
            <>
              <Link to="/publish" className="text-gray-600 hover:text-primary-600 transition-colors">Publish</Link>
              <Link to="/dashboard" className="text-gray-600 hover:text-primary-600 transition-colors">
                <LayoutDashboard className="w-4 h-4 inline mr-1" />Dashboard
              </Link>
              {user.role === 'admin' && (
                <Link to="/admin" className="text-amber-600 hover:text-amber-700 transition-colors">Admin</Link>
              )}
              <div className="flex items-center gap-2 ml-2 pl-4 border-l border-gray-200">
                <User className="w-4 h-4 text-gray-400" />
                <span className="text-gray-700">{user.username}</span>
                <button onClick={logout} className="text-gray-400 hover:text-red-500 transition-colors">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <a href="/api/v1/auth/github" className="bg-gray-900 text-white px-3 py-1.5 rounded-lg text-sm hover:bg-gray-800 transition-colors">
              Sign in with GitHub
            </a>
          )}
        </nav>
      </div>
    </header>
  );
}
