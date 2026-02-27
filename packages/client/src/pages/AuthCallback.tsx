import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AuthCallback() {
  const [params] = useSearchParams();
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const token = params.get('token');
    const error = params.get('error');
    if (token) {
      login(token);
      navigate('/', { replace: true });
    } else {
      console.error('Auth error:', error);
      navigate('/', { replace: true });
    }
  }, []);

  return <p className="text-center text-gray-400 py-20">Signing in...</p>;
}
