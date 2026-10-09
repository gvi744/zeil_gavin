import { useEffect, useState } from 'react';
import { Link, Navigate, NavLink, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import ModeToggle from './components/ModeToggle.jsx';
import Jobs from './pages/Jobs.jsx';
import JobDetail from './pages/JobDetail.jsx';
import CreateJob from './pages/CreateJob.jsx';
import Feed from './pages/Feed.jsx';

function NotFound() {
  return (
    <div className="page empty">
      <h1>Page not found</h1>
      <Link to="/">Go home</Link>
    </div>
  );
}

export default function App() {
  const [mode, setMode] = useState('Applicant');
  const navigate = useNavigate();
  const { pathname } = useLocation();

  // Keep the toggle in sync when landing directly on a page for the other mode.
  useEffect(() => {
    if (pathname.startsWith('/manager')) setMode('Manager');
    else if (pathname.startsWith('/jobs')) setMode('Applicant');
  }, [pathname]);

  const switchMode = (m) => {
    setMode(m);
    navigate(m === 'Manager' ? '/manager/feed' : '/jobs');
  };

  const links =
    mode === 'Manager'
      ? [
          { to: '/manager/new', label: 'Create job' },
          { to: '/manager/feed', label: 'FYP' },
        ]
      : [{ to: '/jobs', label: 'Jobs' }];

  return (
    <div className="app">
      <header className="topbar">
        <Link to="/" className="brand">zeil_gavin</Link>
        <nav className="nav">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to}>
              {l.label}
            </NavLink>
          ))}
        </nav>
        <ModeToggle mode={mode} onChange={switchMode} />
      </header>

      <main>
        <Routes>
          <Route path="/" element={<Navigate to={mode === 'Manager' ? '/manager/feed' : '/jobs'} replace />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/jobs/:id" element={<JobDetail />} />
          <Route path="/manager/new" element={<CreateJob />} />
          <Route path="/manager/feed" element={<Feed />} />
          <Route path="/manager/feed/:jobId" element={<Feed />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
}
