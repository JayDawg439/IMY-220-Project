import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Splash from './pages/Splash';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Post from './pages/Post';
import Album from './pages/Album';
import Admin from './pages/Admin';

function Protected({ children, adminOnly = false }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="grid min-h-screen place-items-center font-mono text-neon">loading</div>;
  if (!user) return <Navigate to="/" replace />;
  if (adminOnly && user.role !== 'admin') return <Navigate to="/home" replace />;
  return children;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Splash />} />
          <Route path="/home" element={<Protected><Home /></Protected>} />
          <Route path="/profile/:id" element={<Protected><Profile /></Protected>} />
          <Route path="/post/:id" element={<Protected><Post /></Protected>} />
          <Route path="/album/:id" element={<Protected><Album /></Protected>} />
          <Route path="/admin" element={<Protected adminOnly><Admin /></Protected>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
