import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './style.css';

function App() {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">R</span>
          <span>Reserve<span className="brand-light">Pilot</span><small>TREASURY INTELLIGENCE</small></span>
        </div>
        <div className="org">
          <span className="org-icon">T</span>
          <div><b>Treasury desk</b><small>Planning workspace</small></div>
        </div>
        <nav className="nav-wrap" aria-label="Primary navigation">
          <div className="nav-group">
            <div className="nav-label">WORKSPACE</div>
            <a className="nav-link" href="#overview">Overview</a>
            <a className="nav-link" href="#treasury">Treasury</a>
            <a className="nav-link" href="#scenarios">Scenarios</a>
          </div>
          <div className="nav-group">
            <div className="nav-label">TOOLS</div>
            <a className="nav-link" href="#evidence">Evidence</a>
            <a className="nav-link" href="#settings">Settings</a>
          </div>
        </nav>
      </aside>

      <main className="main-shell">
        <header className="topbar">
          <div className="crumb">ReservePilot <span>/</span> Overview</div>
          <div className="top-actions"><span className="badge">PLANNING MODE</span></div>
        </header>
        <div className="content">
          <section className="page-head">
            <div><h1>Treasury overview</h1><p>Monitor reserve coverage, runway, and concentration at a glance.</p></div>
          </section>
          <section className="metric-grid three" aria-label="Treasury metrics">
            <div className="metric"><div className="metric-top">TOTAL TREASURY</div><strong>$0.00</strong><div className="metric-bottom">Connect holdings to begin</div></div>
            <div className="metric"><div className="metric-top">RESERVE RUNWAY</div><strong>--</strong><div className="metric-bottom">No expense profile yet</div></div>
            <div className="metric"><div className="metric-top">STABLE RESERVE</div><strong>0%</strong><div className="metric-bottom">No assets recorded</div></div>
          </section>
          <section className="panel" id="overview">
            <div className="panel-head"><div><h2>Build your treasury profile</h2><p>Add holdings and monthly expenses to unlock analysis.</p></div><a className="button" href="#treasury">Add holdings</a></div>
            <div className="empty-steps"><span><b>01</b> Add assets</span><span><b>02</b> Set expenses</span><span><b>03</b> Run scenarios</span></div>
          </section>
        </div>
      </main>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode><App /></StrictMode>,
);