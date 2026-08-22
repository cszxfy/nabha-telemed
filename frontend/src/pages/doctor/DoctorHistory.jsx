import DoctorLayout from './DoctorLayout'
import './DoctorCommon.css'

export default function DoctorHistory() {
  return <DoctorLayout><main className="doctor-main">
    <div className="doctor-page-head"><div><div className="doctor-kicker">Screen 24 · History</div><h1>Consultation history</h1><p>Searchable history belongs here, but the frozen contract currently does not expose a doctor-history endpoint.</p></div></div>
    <section className="doctor-card">
      <div className="doctor-toolbar"><div><h2>Previous consultations</h2><div className="doctor-toolbar__meta">Ready for a future doctor-history API</div></div><div className="doctor-actions"><input aria-label="Search history" placeholder="Search patient" disabled style={{minHeight:42,border:'1px solid var(--color-border)',borderRadius:10,padding:'.65rem .8rem',font:'inherit'}} /></div></div>
      <div className="doctor-empty" style={{margin:'1rem'}}><strong>Doctor history API is not available yet.</strong>The current frozen contract has no <code>GET /doctor/history</code> or consultation-history endpoint. No fake consultations are shown here.</div>
    </section>
    <section className="doctor-grid doctor-grid-3" style={{marginTop:'1rem'}}>
      <div className="doctor-card pad"><div className="doctor-kicker">Search-ready</div><h2 style={{fontSize:'1.1rem',margin:'.2rem 0 .4rem'}}>Patient</h2><p style={{fontSize:'.8rem',color:'var(--color-ink-mid)'}}>Filter by patient name or ID once history data is exposed.</p></div>
      <div className="doctor-card pad"><div className="doctor-kicker">Date range</div><h2 style={{fontSize:'1.1rem',margin:'.2rem 0 .4rem'}}>Consultation date</h2><p style={{fontSize:'.8rem',color:'var(--color-ink-mid)'}}>Filter by consultation date without changing the screen structure.</p></div>
      <div className="doctor-card pad"><div className="doctor-kicker">Prescription</div><h2 style={{fontSize:'1.1rem',margin:'.2rem 0 .4rem'}}>Prescription status</h2><p style={{fontSize:'.8rem',color:'var(--color-ink-mid)'}}>Show generated prescription records when the backend exposes consultation history.</p></div>
    </section>
    <p className="doctor-footer-note">This placeholder is intentionally data-honest: the screen is production-ready in structure without fabricating backend records.</p>
  </main></DoctorLayout>
}
