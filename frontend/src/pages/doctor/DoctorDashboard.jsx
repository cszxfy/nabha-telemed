import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { get } from '../../services/api'
import { getDoctorSession } from '../../services/doctorSession'
import DoctorLayout from './DoctorLayout'
import './DoctorCommon.css'

function initials(name='Patient'){return name.split(' ').map(p=>p[0]).join('').slice(0,2).toUpperCase()}
function waitedSince(value){if(!value)return 'Just now';const start=new Date(value).getTime();if(Number.isNaN(start))return 'Just now';const mins=Math.max(0,Math.floor((Date.now()-start)/60000));return mins<1?'Just now':`${mins} min waiting`}
function demoQueue(){return [{queueId:'demo-q-001',patientName:'Demo Patient',urgencyLevel:'medium',waitingSince:new Date().toISOString()}]}

export default function DoctorDashboard(){
 const navigate=useNavigate(); const session=getDoctorSession()
 const [queue,setQueue]=useState(demoQueue()); const [loading,setLoading]=useState(true)
 const [online,setOnline]=useState(()=>sessionStorage.getItem('nabha_doctor_online')!=='false')
 const loadQueue=useCallback(async()=>{
   if(!session?.token||!session?.doctorId){setQueue(demoQueue());setLoading(false);return}
   try{const data=await get(`/queue/doctor/${session.doctorId}`,session.token);setQueue(Array.isArray(data?.queue)&&data.queue.length?data.queue:demoQueue())}
   catch{setQueue(demoQueue())} finally{setLoading(false)}
 },[session?.doctorId,session?.token])
 useEffect(()=>{loadQueue();const timer=setInterval(loadQueue,12000);return()=>clearInterval(timer)},[loadQueue])
 function toggleOnline(){setOnline(v=>{const n=!v;sessionStorage.setItem('nabha_doctor_online',String(n));return n})}
 const high=queue.filter(p=>p.urgencyLevel==='high').length, medium=queue.filter(p=>p.urgencyLevel==='medium').length, first=queue[0]
 const today=new Date().toLocaleDateString(undefined,{weekday:'long',day:'numeric',month:'long',year:'numeric'})
 return <DoctorLayout><main className="doctor-main">
  <div className="doctor-page-head"><div><div className="doctor-kicker">Doctor dashboard</div><h1>Good morning, Doctor.</h1><p>{today} · Keep your queue moving with a focused consultation workflow.</p></div><div className="doctor-toggle"><button className={`doctor-toggle__button ${online?'on':''}`} onClick={toggleOnline} aria-pressed={online}><span/></button><div><strong>{online?'Online':'Offline'}</strong><div style={{fontSize:'.74rem',color:'var(--color-ink-light)'}}>Local availability status</div></div></div></div>
  <section className="doctor-grid doctor-grid-4" style={{marginBottom:'1rem'}}>
   <div className="doctor-card doctor-stat"><div className="doctor-stat__label">Waiting</div><div className="doctor-stat__value">{loading?'—':queue.length}</div><div className="doctor-stat__meta">patients in queue</div></div>
   <div className="doctor-card doctor-stat"><div className="doctor-stat__label">High priority</div><div className="doctor-stat__value">{loading?'—':high}</div><div className="doctor-stat__meta">triage flagged</div></div>
   <div className="doctor-card doctor-stat"><div className="doctor-stat__label">Medium</div><div className="doctor-stat__value">{loading?'—':medium}</div><div className="doctor-stat__meta">routine review</div></div>
   <div className="doctor-card doctor-stat"><div className="doctor-stat__label">Next position</div><div className="doctor-stat__value">{first?1:'—'}</div><div className="doctor-stat__meta">ready when you are</div></div>
  </section>
  <section className="doctor-grid doctor-grid-2">
   <div className="doctor-card doctor-hero doctor-queue-highlight"><div><div className="doctor-kicker">Next patient</div><h2>{first?.patientName||'Demo Patient'}</h2><p><span className={`doctor-status-pill doctor-status-${first?.urgencyLevel||'medium'}`}>{first?.urgencyLevel||'medium'} priority</span> · {waitedSince(first?.waitingSince)}</p></div><div className="doctor-hero-actions"><button className="doctor-btn doctor-btn-primary" onClick={()=>navigate('/doctor/queue')}>Open queue</button></div></div>
   <div className="doctor-card pad"><div className="doctor-kicker">Quick actions</div><div className="doctor-grid" style={{gap:'.65rem',marginTop:'.8rem'}}><button className="doctor-btn doctor-btn-secondary" onClick={()=>navigate('/doctor/queue')}>View today’s queue</button><button className="doctor-btn doctor-btn-secondary" onClick={()=>navigate('/doctor/history')}>Open consultation history</button></div><p style={{color:'var(--color-ink-light)',fontSize:'.76rem',marginTop:'.8rem'}}>Local demo mode keeps the workflow usable even when the backend is unavailable.</p></div>
  </section>
  <section className="doctor-card" style={{marginTop:'1rem'}}><div className="doctor-toolbar"><div><h2>Queue preview</h2><div className="doctor-toolbar__meta">Live refresh every 12 seconds</div></div><button className="doctor-btn doctor-btn-secondary" onClick={loadQueue}>Refresh</button></div><div className="doctor-table-wrap"><table className="doctor-table"><thead><tr><th>Position</th><th>Patient</th><th>Priority</th><th>Waiting</th></tr></thead><tbody>{queue.slice(0,5).map((patient,i)=><tr key={patient.queueId||i}><td><strong>#{i+1}</strong></td><td><div className="doctor-table__patient"><div className="patient-dot">{initials(patient.patientName)}</div><div><strong>{patient.patientName||'Patient'}</strong><span>Queue ID · {patient.queueId||'—'}</span></div></div></td><td><span className={`doctor-status-pill doctor-status-${patient.urgencyLevel||'medium'}`}>{patient.urgencyLevel||'medium'}</span></td><td>{waitedSince(patient.waitingSince)}</td></tr>)}</tbody></table></div></section>
 </main></DoctorLayout>
}
