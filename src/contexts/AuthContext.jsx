import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);
const RESIDENTS_APP_ID = '__RESIDENTS_APP_ID__';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewAs, setViewAsState] = useState(() => localStorage.getItem('test_view_as') || 'admin');
  const setViewAs = (v) => { localStorage.setItem('test_view_as', v); setViewAsState(v); };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get('token');
    if (urlToken) {
      localStorage.setItem('sso_token', urlToken);
      window.history.replaceState({}, '', window.location.pathname);
    }
    const token = localStorage.getItem('sso_token');
    if (!token) { window.location.href = '/'; return; }
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.exp * 1000 < Date.now()) {
        localStorage.removeItem('sso_token');
        localStorage.removeItem('sso_user');
        localStorage.removeItem('sso_apps');
        window.location.href = '/';
        return;
      }
      setUser(payload);
    } catch {
      window.location.href = '/'; return;
    }
    setLoading(false);
  }, []);

  const isRealAdmin = user && ['admin_etablissement', 'admin_groupe'].includes(user.role_global);
  const isAdmin = () => isRealAdmin && viewAs === 'admin';
  const isManager = () => {
    if (isRealAdmin && viewAs === 'admin') return true;
    if (isRealAdmin && viewAs === 'gestionnaire') return true;
    if (isRealAdmin && viewAs === 'utilisateur') return false;
    if (isRealAdmin) return true;
    const app = (user?.apps || []).find(a => a.id === RESIDENTS_APP_ID);
    return app && ['gestionnaire', 'admin'].includes(app.role);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-400">Chargement...</div>;

  return (
    <AuthContext.Provider value={{ user, isAdmin, isManager, isRealAdmin, viewAs, setViewAs }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
