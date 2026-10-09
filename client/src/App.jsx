import { useEffect, useState } from 'react';
import { Link, Navigate, NavLink, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import ModeToggle from './components/ModeToggle.jsx';
import Jobs from './pages/Jobs.jsx';
import JobDetail from './pages/JobDetail.jsx';
import CreateJob from './pages/CreateJob.jsx';
import Feed from './pages/Feed.jsx';
import Shortlist from './pages/Shortlist.jsx';

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
          { to: '/manager/shortlist', label: 'Shortlist' },
        ]
      : [{ to: '/jobs', label: 'Jobs' }];

  const cta = mode === 'Manager' ? { to: '/manager/feed', label: 'Review candidates' } : { to: '/jobs', label: 'Find jobs' };

  return (
    <div className="app">
      <div className="utility-bar">
        <div className="wrap utility-inner">
          <span className="utility-note">Built for the ZEIL hackathon</span>
          <ModeToggle mode={mode} onChange={switchMode} />
        </div>
      </div>

      <header className="site-header">
        <div className="wrap header-inner">
          <nav className="nav" aria-label="Main">
            {links.map((l) => (
              <NavLink key={l.to} to={l.to}>
                {l.label}
              </NavLink>
            ))}
          </nav>
          <Link to="/" className="wordmark" aria-label="CandidatesFY home">
            Candidates<span>FY</span>
          </Link>
          <div className="header-cta">
            <Link to={cta.to} className="btn btn-outline">{cta.label}</Link>
          </div>
        </div>
      </header>

      <main>
        <Routes>
          <Route path="/" element={<Navigate to={mode === 'Manager' ? '/manager/feed' : '/jobs'} replace />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/jobs/:id" element={<JobDetail />} />
          <Route path="/manager/new" element={<CreateJob />} />
          <Route path="/manager/feed" element={<Feed />} />
          <Route path="/manager/feed/:jobId" element={<Feed />} />
          <Route path="/manager/shortlist" element={<Shortlist />} />
          <Route path="/manager/shortlist/:jobId" element={<Shortlist />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <footer className="site-footer">
        <div className="wrap footer-inner">
          <div className="footer-cols">
            <div>
              <p className="footer-head">Job seekers</p>
              <Link to="/jobs">Browse jobs</Link>
            </div>
            <div>
              <p className="footer-head">Hiring managers</p>
              <Link to="/manager/new">Post a job</Link>
              <Link to="/manager/feed">For You Page</Link>
              <Link to="/manager/shortlist">Shortlist</Link>
            </div>
            <div>
              <p className="footer-head">About</p>
              <span>Blind first look, AI-ranked.</span>
              <span>A hackathon prototype by Gavin.</span>
            </div>
          </div>
          <p className="footer-wordmark" aria-hidden="true">CandidatesFY</p>
        </div>
      </footer>
    </div>
  );
}
