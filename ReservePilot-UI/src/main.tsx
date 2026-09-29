import { FormEvent, StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './style.css';

type Holding = { symbol: string; quantity: number; price: number };

function App() {
  const [showHoldingForm, setShowHoldingForm] = useState(false);
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const totalTreasury = holdings.reduce((total, holding) => total + holding.quantity * holding.price, 0);

  function addHolding(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const symbol = String(formData.get('symbol') || '').trim().toUpperCase();
    const quantity = Number(formData.get('quantity'));
    const price = Number(formData.get('price'));
    if (!symbol || quantity <= 0 || price < 0) return;
    setHoldings((current) => [...current, { symbol, quantity, price }]);
    event.currentTarget.reset();
    setShowHoldingForm(false);
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><span className="brand-mark">R</span><span>Reserve<span className="brand-light">Pilot</span><small>TREASURY INTELLIGENCE</small></span></div>
        <div className="org"><span className="org-icon">T</span><div><b>Treasury desk</b><small>Planning workspace</small></div></div>
        <nav className="nav-wrap" aria-label="Primary navigation">
          <div className="nav-group"><div className="nav-label">WORKSPACE</div><a className="nav-link" href="#overview">Overview</a><a className="nav-link" href="#treasury">Treasury</a><a className="nav-link" href="#scenarios">Scenarios</a></div>
          <div className="nav-group"><div className="nav-label">TOOLS</div><a className="nav-link" href="#evidence">Evidence</a><a className="nav-link" href="#settings">Settings</a></div>
        </nav>
      </aside>
      <main className="main-shell">
        <header className="topbar"><div className="crumb">ReservePilot <span>/</span> Overview</div><div className="top-actions"><span className="badge">PLANNING MODE</span></div></header>
        <div className="content">
          <section className="page-head"><div><h1>Treasury overview</h1><p>Monitor reserve coverage, runway, and concentration at a glance.</p></div></section>
          <section className="metric-grid three" aria-label="Treasury metrics">
            <div className="metric"><div className="metric-top">TOTAL TREASURY</div><strong>${totalTreasury.toLocaleString()}</strong><div className="metric-bottom">{holdings.length ? `${holdings.length} holding${holdings.length === 1 ? '' : 's'} recorded` : 'Connect holdings to begin'}</div></div>
            <div className="metric"><div className="metric-top">RESERVE RUNWAY</div><strong>--</strong><div className="metric-bottom">No expense profile yet</div></div>
            <div className="metric"><div className="metric-top">STABLE RESERVE</div><strong>0%</strong><div className="metric-bottom">No assets recorded</div></div>
          </section>
          <section className="panel" id="overview">
            <div className="panel-head"><div><h2>Build your treasury profile</h2><p>Add holdings and monthly expenses to unlock analysis.</p></div><button className="button" type="button" onClick={() => setShowHoldingForm((visible) => !visible)}>{showHoldingForm ? 'Close' : 'Add holdings'}</button></div>
            {showHoldingForm && <form className="holding-form" id="treasury" onSubmit={addHolding}><div className="form-grid"><label>Asset symbol<input name="symbol" placeholder="BTC" required /></label><label>Quantity<input name="quantity" type="number" min="0" step="any" placeholder="0" required /></label><label>Price in USD<input name="price" type="number" min="0" step="any" placeholder="0" required /></label></div><button className="button" type="submit">Save holding</button></form>}
            {holdings.length > 0 && <div className="holding-list" aria-label="Added holdings">{holdings.map((holding, index) => <div key={`${holding.symbol}-${index}`}><span>{holding.symbol}</span><span>{holding.quantity} at ${holding.price.toLocaleString()}</span></div>)}</div>}
            <div className="empty-steps"><span><b>01</b> Add assets</span><span><b>02</b> Set expenses</span><span><b>03</b> Run scenarios</span></div>
          </section>
        </div>
      </main>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>);
