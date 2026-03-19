import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

/* ── SVG decorations ──────────────────────────────────────────────────── */
function LeafTall({ className }) {
  return (
    <svg viewBox="0 0 120 180" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M60 170 C20 130 10 80 40 30 C50 10 70 10 80 30 C110 80 100 130 60 170Z" fill="currentColor" />
      <path d="M60 170 C60 130 60 80 60 20" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
function LeafWide({ className }) {
  return (
    <svg viewBox="0 0 160 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M10 50 C40 10 120 10 150 50 C120 90 40 90 10 50Z" fill="currentColor" />
      <path d="M10 50 C60 50 110 50 150 50" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
function Petal({ className }) {
  return (
    <svg viewBox="0 0 80 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M40 110 C10 80 5 40 40 10 C75 40 70 80 40 110Z" fill="currentColor" />
    </svg>
  );
}

function Badge({ children }) {
  return (
    <span className="text-[0.78rem] font-medium tracking-widest uppercase text-white/80 bg-white/15 backdrop-blur-sm border border-white/25 rounded-full px-4 py-1.5">
      {children}
    </span>
  );
}

/* ── Floating-label input ─────────────────────────────────────────────── */
function FloatingInput({ id, label, type, placeholder, value, onChange }) {
  const [focused, setFocused] = useState(false);
  const lifted = focused || value.length > 0;

  return (
    <div className="relative">
      {/* The input */}
      <input
        id={id}
        type={type}
        required
        placeholder={lifted ? placeholder : ''}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          /* Override autofill background */
          WebkitBoxShadow: focused ? '0 0 0 60px #ffffff inset' : '0 0 0 60px #f4f0eb inset',
          WebkitTextFillColor: 'var(--text-base)',
        }}
        className={`
          peer block w-full
          pt-7 pb-3 px-5
          text-[1.05rem] text-[var(--text-base)] font-body
          rounded-2xl outline-none
          border-2 transition-all duration-200
          placeholder:text-[var(--text-faint)] placeholder:text-[0.9rem]
          ${focused
            ? 'bg-white border-[var(--sage)] shadow-[0_0_0_5px_rgba(124,158,143,0.13)]'
            : 'bg-[#f4f0eb] border-transparent hover:border-[rgba(124,158,143,0.35)] hover:bg-[#efe9e1]'
          }
        `}
      />

      {/* Floating label */}
      <label
        htmlFor={id}
        className={`
          absolute left-5 pointer-events-none
          font-body font-medium tracking-wide
          transition-all duration-200
          ${lifted
            ? 'top-2.5 text-[0.68rem] tracking-[0.1em] uppercase text-[var(--sage)]'
            : 'top-1/2 -translate-y-1/2 text-[1rem] text-[var(--text-muted)]'
          }
        `}
      >
        {label}
      </label>

      {/* Bottom accent line */}
      <div
        className={`
          absolute bottom-0 left-5 right-5 h-[2px] rounded-full
          bg-gradient-to-r from-[var(--sage)] to-[var(--sage-deep)]
          transition-all duration-300 origin-left
          ${focused ? 'scale-x-100 opacity-100' : 'scale-x-0 opacity-0'}
        `}
      />
    </div>
  );
}

/* ── Main login page ──────────────────────────────────────────────────── */
export default function Login() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    console.log('Logging in with:', email);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex font-body bg-[var(--cream)] text-[var(--text-base)] overflow-hidden">

      {/* ── LEFT – branding panel ───────────────────────────────────────── */}
      <div className="hidden lg:flex flex-col justify-between lg:w-[46%] flex-shrink-0 relative overflow-hidden p-14 bg-gradient-to-br from-[#7c9e8f] via-[#6b9a85] to-[#8f7a5a] text-white">

        {/* Blobs */}
        <div className="absolute -top-24 -left-24 w-[28rem] h-[28rem] rounded-full bg-white/20 blur-3xl pointer-events-none animate-breathe" />
        <div className="absolute -bottom-16 -right-10 w-96 h-96 rounded-full bg-[#c4a882]/25 blur-3xl pointer-events-none animate-breathe [animation-delay:3s]" />
        <div className="absolute top-[42%] left-[55%] w-56 h-56 rounded-full bg-white/10 blur-2xl pointer-events-none animate-breathe [animation-delay:1.5s]" />

        {/* Leaves */}
        <LeafTall className="absolute top-[7%] right-[5%] w-[110px] text-white/20 animate-float-a" />
        <LeafWide className="absolute bottom-[20%] -left-6 w-[160px] text-white/15 animate-float-b" />
        <Petal    className="absolute bottom-[5%] right-[14%] w-[64px] text-[#f5ddb4]/30 animate-float-a [animation-delay:2s]" />
        <Petal    className="absolute top-[38%] left-[7%] w-[44px] text-white/20 animate-float-b [animation-delay:4s]" />

        {/* Wordmark */}
        <div className="relative z-10">
          <span className="font-display italic font-light text-[2.4rem] text-white/90 tracking-wide">
            DeTask
          </span>
        </div>

        {/* Copy */}
        <div className="relative z-10">
          <p className="font-display italic text-[0.85rem] tracking-[0.18em] uppercase text-white/60 mb-6">
            Your safe space at work
          </p>
          <h2 className="font-display font-normal leading-[1.15] text-[clamp(2.6rem,3.4vw,3.4rem)] text-white mb-6">
            Nurturing minds,<br />
            <em className="font-light">empowering teams.</em>
          </h2>
          <p className="text-[1rem] leading-[1.8] text-white/72 max-w-[360px]">
            A unified platform for leaders to understand, support, and elevate
            their team's mental wellbeing through actionable insights and
            meaningful care.
          </p>
          <div className="flex flex-wrap gap-2.5 mt-9">
            <Badge>Clinician-backed</Badge>
            <Badge>Fully confidential</Badge>
            <Badge>Always supportive</Badge>
          </div>
        </div>

        <div className="relative z-10 text-[0.78rem] text-white/40">
          &copy; {new Date().getFullYear()} DeTask Inc. &middot; All rights reserved.
        </div>
      </div>

      {/* ── RIGHT – form panel ──────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 py-14 relative overflow-hidden bg-[var(--cream)]">

        {/* Watermark leaves */}
        <LeafTall className="absolute -bottom-10 -right-8 w-[220px] text-[var(--sage)]/10 pointer-events-none animate-float-a" />
        <LeafWide className="absolute -top-8 -left-10 w-[240px] text-[var(--sage)]/[0.07] pointer-events-none animate-float-b" />

        <div className="relative z-10 w-full max-w-[480px]">

          {/* Mobile wordmark */}
          <div className="lg:hidden text-center mb-12 animate-fade-up-1">
            <span className="font-display italic font-normal text-[3rem] text-[var(--sage-deep)] tracking-wide">
              DeTask
            </span>
            <div className="w-12 h-[2px] mx-auto mt-2.5 rounded-full bg-gradient-to-r from-[var(--sage)] to-[var(--warm)]" />
          </div>

          {/* Heading */}
          <div className="mb-9 animate-fade-up-2 text-center">
            <h1 className="font-display font-normal text-[2.8rem] text-[var(--text-base)] leading-[1.1] mb-2">
              Welcome back
            </h1>
            <p className="text-[1rem] text-[var(--text-muted)] font-light tracking-wide">
              Sign in to continue your journey.
            </p>
          </div>

          {/* Card */}
          <div className="animate-fade-up-3 bg-white rounded-3xl border border-[var(--border-soft)] shadow-[0_8px_48px_rgba(100,80,60,0.09),0_2px_8px_rgba(100,80,60,0.05)] px-9 py-10">
            <form onSubmit={handleLogin} className="space-y-6">

              {/* Email */}
              <div className="animate-fade-up-3">
                <FloatingInput
                  id="email"
                  label="Work Email"
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              {/* Password */}
              <div className="animate-fade-up-4">
                <FloatingInput
                  id="password"
                  label="Password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <div className="text-right mt-2.5">
                  <a href="#" className="text-[0.83rem] text-[var(--warm)] hover:text-[var(--warm-deep)] transition-colors">
                    Forgot password?
                  </a>
                </div>
              </div>

              {/* Submit */}
              <div className="animate-fade-up-5 pt-2">
                <button
                  type="submit"
                  className="
                    w-full py-4
                    text-[1rem] font-medium tracking-[0.08em] uppercase
                    text-white
                    bg-gradient-to-br from-[var(--sage)] to-[var(--sage-deep)]
                    rounded-2xl border-none cursor-pointer
                    shadow-[0_6px_20px_rgba(90,138,120,0.38)]
                    hover:shadow-[0_10px_28px_rgba(90,138,120,0.5)]
                    hover:-translate-y-0.5
                    active:translate-y-0 active:shadow-[0_3px_10px_rgba(90,138,120,0.3)]
                    transition-all duration-200
                  "
                >
                  Sign In
                </button>
              </div>

            </form>
          </div>

          {/* Privacy note */}
          <p className="animate-fade-up-6 mt-7 text-center text-[0.85rem] leading-relaxed text-[var(--text-faint)]">
            Your wellbeing data is always{' '}
            <span className="text-[var(--sage)] font-medium">private &amp; secure</span>.
          </p>

        </div>
      </div>

    </div>
  );
}