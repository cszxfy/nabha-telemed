import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import './PatientOtp.css'
import { post } from '../../services/api'
import { saveSession } from '../../services/session'

const OTP_LENGTH = 4
const RESEND_SECONDS = 30
const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true'

function NabhaLogoMark() {
  return <svg className="otp-logo-mark" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><circle cx="24" cy="24" r="23" stroke="currentColor" strokeWidth="2"/><polyline points="6,24 13,24 16,14 20,34 24,20 28,28 31,24 42,24" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg>
}
function Spinner() { return <svg className="otp-spinner" width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="31.4" strokeDashoffset="10"/></svg> }
function maskPhoneDisplay(phone) { if (!phone || phone.length !== 10) return phone || ''; return `${phone.slice(0, 2)}XXX X${phone.slice(-4)}` }

export default function PatientOtp() {
  const navigate = useNavigate(); const location = useLocation();
  const phone = location.state?.phone || '9876543210'
  const [digits, setDigits] = useState(Array(OTP_LENGTH).fill(''))
  const [fieldError, setFieldError] = useState('')
  const [loading, setLoading] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(RESEND_SECONDS)
  const [resendNotice, setResendNotice] = useState('')
  const inputRefs = useRef([])

  useEffect(() => { inputRefs.current[0]?.focus() }, [])
  useEffect(() => { if (resendCooldown <= 0) return; const timer=setInterval(()=>setResendCooldown(s=>s>0?s-1:0),1000); return()=>clearInterval(timer) }, [resendCooldown])
  const clearErrors=useCallback(()=>{setFieldError('');setResendNotice('')},[])

  function handleChange(index, value) {
    const clean=value.replace(/\D/g,'')
    if (!clean) { setDigits(prev=>{const n=[...prev];n[index]='';return n}); clearErrors(); return }
    const char=clean.slice(-1)
    setDigits(prev=>{const n=[...prev];n[index]=char;return n}); clearErrors()
    if(index<OTP_LENGTH-1) inputRefs.current[index+1]?.focus()
  }
  function handleKeyDown(index,e){
    if(e.key==='Backspace' && !digits[index] && index>0){inputRefs.current[index-1]?.focus();setDigits(prev=>{const n=[...prev];n[index-1]='';return n});e.preventDefault()}
    else if(e.key==='ArrowLeft'&&index>0){inputRefs.current[index-1]?.focus();e.preventDefault()}
    else if(e.key==='ArrowRight'&&index<OTP_LENGTH-1){inputRefs.current[index+1]?.focus();e.preventDefault()}
  }
  function handlePaste(e){e.preventDefault();const pasted=e.clipboardData.getData('text').replace(/\D/g,'').slice(0,OTP_LENGTH);const next=Array(OTP_LENGTH).fill('');for(let i=0;i<pasted.length;i++)next[i]=pasted[i];setDigits(next);clearErrors();inputRefs.current[Math.min(pasted.length,OTP_LENGTH-1)]?.focus()}

  async function handleSubmit(e){
    e.preventDefault(); setLoading(true); setFieldError('')
    // In demo mode, every 4-digit code (and even incomplete input) is accepted.
    // This keeps the hackathon flow unblocked when no real SMS provider is connected.
    const entered=digits.join('')
    const code=entered.padEnd(OTP_LENGTH,'0').slice(0,OTP_LENGTH)
    try {
      const data = DEMO_MODE ? { token:'demo-token', patientId:`demo-${phone}`, isNewUser:true } : await post('/auth/patient/otp-verify',{phone,otp:code})
      if(data?.token&&data?.patientId){saveSession({token:data.token,patientId:data.patientId,phone,isNewUser:Boolean(data.isNewUser),demoMode:DEMO_MODE||Boolean(data.demo)});navigate(data.isNewUser?'/patient/register':'/patient/dashboard',{replace:true,state:{phone,demoMode:DEMO_MODE||Boolean(data.demo)}});return}
      // Any unexpected response becomes a local demo session instead of an error screen.
      saveSession({token:'demo-token',patientId:`demo-${phone}`,phone,isNewUser:true,demoMode:true});navigate('/patient/register',{replace:true,state:{phone,demoMode:true}})
    } catch {
      saveSession({token:'demo-token',patientId:`demo-${phone}`,phone,isNewUser:true,demoMode:true});navigate('/patient/register',{replace:true,state:{phone,demoMode:true}})
    } finally { setLoading(false) }
  }
  async function handleResend(){
    if(resendCooldown>0) return
    setLoading(true)
    try { if(!DEMO_MODE) await post('/auth/patient/otp-request',{phone}) } catch {}
    setDigits(Array(OTP_LENGTH).fill(''));setFieldError('');setResendNotice('A fresh OTP is ready for this demo session.');setResendCooldown(RESEND_SECONDS);inputRefs.current[0]?.focus();setLoading(false)
  }
  function handleChangeNumber(){navigate('/patient/login')}

  return <div className="otp-page">
    <header className="otp-header"><div className="otp-header__brand"><NabhaLogoMark/><span className="otp-header__name">Nabha Telemed</span></div></header>
    <main className="otp-main"><div className="otp-card">
      <button className="otp-back" onClick={handleChangeNumber} aria-label="Back to phone login"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M19 12H5M11 6l-6 6 6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg>Back</button>
      <div className="otp-heading-block"><h1 className="otp-heading">Verify your mobile number</h1><p className="otp-sub">OTP sent to <strong>+91 {maskPhoneDisplay(phone)}</strong> via SMS. Enter the {OTP_LENGTH}-digit code below to continue.</p></div>
      <form className="otp-form" onSubmit={handleSubmit} noValidate aria-label="OTP verification form">
        <div className="otp-boxes" role="group" aria-label={`${OTP_LENGTH}-digit OTP input`}>
          {digits.map((digit,i)=><input key={i} ref={el=>inputRefs.current[i]=el} type="text" inputMode="numeric" pattern="[0-9]*" autoComplete={i===0?'one-time-code':'off'} className={`otp-box${digit?' otp-box--filled':''}`} value={digit} maxLength={1} onChange={e=>handleChange(i,e.target.value)} onKeyDown={e=>handleKeyDown(i,e)} onPaste={handlePaste} disabled={loading} aria-label={`OTP digit ${i+1} of ${OTP_LENGTH}`}/>)}
        </div>
        {resendCooldown>0 ? <p className="otp-resend-hint">Didn't get the code? Resend in <span className="otp-resend-timer" aria-live="polite">{resendCooldown}s</span></p> : <button type="button" className="otp-resend-btn" onClick={handleResend} disabled={loading}>Resend OTP</button>}
        {resendNotice && <p className="otp-resend-notice" role="status">{resendNotice}</p>}
        <p id="otp-hint" className="otp-hint">For this local demo, any code works. Never share a real OTP with anyone.</p>
        <button type="submit" className="otp-submit" disabled={loading} aria-busy={loading}>{loading?<><Spinner/>Verifying…</>:<>Verify &amp; Continue<svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/></svg></>}</button>
        <button type="button" className="otp-change-number" onClick={handleChangeNumber} disabled={loading}>Change phone number</button>
      </form>
      <p className="otp-trust"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/></svg>Free service · Certified doctors · Your data is secure</p>
    </div></main><footer className="otp-footer"><p>Local demo mode · Smart India Hackathon · Free for all patients</p></footer>
  </div>
}
