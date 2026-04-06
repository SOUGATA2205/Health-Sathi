import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { QRCodeSVG } from 'qrcode.react';

export const LandingPage: React.FC = () => {
  const [showQR, setShowQR] = useState(false);
  const [feedbackStatus, setFeedbackStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [feedbackMessage, setFeedbackMessage] = useState('');

  const handleFeedbackSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFeedbackStatus('loading');
    setFeedbackMessage('');

    const formData = new FormData(e.currentTarget);
    // Add Web3Forms Access Key (Placeholder)
    // To get your REAL key, go to web3forms.com and enter your email
    formData.append('access_key', import.meta.env.VITE_WEB3FORMS_ACCESS_KEY || 'YOUR_ACCESS_KEY_HERE');
    formData.append('subject', 'New Health Sathi Feedback (Web3Forms)');

    try {
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Accept': 'application/json'
        },
        body: formData
      });

      const result = await response.json();

      if (result.success) {
        setFeedbackStatus('success');
        setFeedbackMessage('Great! Your feedback has been sent directly to our developer team.');
        (e.target as HTMLFormElement).reset();
      } else {
        throw new Error(result.message || 'Failed to send');
      }
    } catch (err: any) {
      setFeedbackStatus('error');
      setFeedbackMessage(err.message || 'Oops! Connection lost. Please try again.');
    }
  };

  const apkUrl = `${window.location.origin}/apk/Health-Sathi.apk`;

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="w-full px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-teal-600 text-white rounded-lg flex items-center justify-center font-bold text-sm shadow-sm">HS</div>
              <span className="text-xl font-bold text-slate-900 tracking-tight">Health Sathi</span>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/auth">
                <Button variant="primary" className="py-2 px-6 text-sm">
                  Log In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-36 overflow-hidden">
        {/* Dynamic Background Blobs */}
        <div className="absolute top-20 -left-20 w-96 h-96 bg-teal-400 rounded-full mix-blend-multiply filter blur-[120px] opacity-20 animate-blob"></div>
        <div className="absolute top-40 -right-20 w-96 h-96 bg-emerald-400 rounded-full mix-blend-multiply filter blur-[120px] opacity-20 animate-blob" style={{ animationDelay: '2s' }}></div>
        <div className="absolute -bottom-40 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-cyan-400 rounded-full mix-blend-multiply filter blur-[150px] opacity-20 animate-blob" style={{ animationDelay: '4s' }}></div>

        <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-slate-50/50 to-slate-100/80 z-0 backdrop-blur-[2px]"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-block mb-8 px-4 py-1.5 rounded-full bg-white/40 backdrop-blur-md border border-white/60 shadow-lg shadow-teal-500/5 animate-fade-in-up">
            <span className="text-[10px] font-black text-teal-700 uppercase tracking-[0.2em] flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse"></span>
              Powered by Envision
            </span>
          </div>

          <h1 className="text-6xl md:text-8xl font-black text-slate-900 tracking-tighter leading-[0.9] mb-8 animate-fade-in-up">
            Healthcare <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 via-emerald-500 to-cyan-500">Simplified.</span>
          </h1>

          <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto mb-12 leading-relaxed font-medium animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            Upload prescriptions, lab reports, or just speak your symptoms.
            Health Sathi interprets medical data instantly with Multimodal AI.
          </p>

          <div className="flex flex-col sm:flex-row gap-5 justify-center items-center mb-24 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <Link to="/auth" className="grow sm:grow-0">
              <button className="w-full px-10 py-5 bg-teal-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-2xl shadow-teal-600/30 hover:bg-teal-700 hover:-translate-y-1 active:scale-95 transition-all">
                Get Started Free
              </button>
            </Link>

            <div className="flex items-center bg-white/60 backdrop-blur-md rounded-2xl shadow-xl shadow-slate-200/40 border border-white/80 p-1 w-full sm:w-auto transition-all hover:shadow-2xl hover:-translate-y-1">
              <a href="/apk/Health-Sathi.apk" download className="flex-1 px-8 py-3.5 text-slate-700 font-black text-xs uppercase tracking-widest hover:text-teal-600 transition-colors flex items-center justify-center gap-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                Download App
              </a>
              <div className="w-px h-8 bg-slate-200/60 mx-1 hidden sm:block"></div>
              <button onClick={() => setShowQR(true)} className="p-3.5 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-xl transition-all hidden sm:flex items-center justify-center" title="Scan QR Code">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M4 4h6v6H4V4zm2 2v2h2V6H6zm10-2h6v6h-6V4zm2 2v2h2V6h-2zM4 14h6v6H4v-6zm2 2v2h2v-2H6zm10-2h3v2h-3v-2zm-2 2h2v2h-2v-2zm-2 2h2v2h-2v-2zm4 0h3v2h-3v-2zm-2-4h2v2h-2v-2zM12 4h2v2h-2V4zm0 4h2v2h-2V8zm0 6h2v2h-2v-2zm0-4h2v2h-2v-2z" /></svg>
              </button>
            </div>
          </div>

          <div className="relative animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <div className="absolute inset-0 bg-gradient-to-r from-teal-500 via-emerald-500 to-cyan-500 blur-[100px] opacity-20 rounded-full transform scale-75 animate-pulse-glow"></div>
            <div className="max-w-5xl mx-auto px-4 relative">
              <img
                src="assets/doc.png"
                alt="Doctor Dashboard"
                className="rounded-[2.5rem] shadow-[0_30px_70px_rgba(13,_148,_136,_0.25)] border border-white/60 mx-auto transform hover:scale-[1.01] transition-all duration-700 animate-float"
              />
              {/* Decorative elements over the image */}
              <div className="absolute -top-10 -right-5 sm:right-10 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-white/20 animate-float-slow hidden sm:block">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center text-teal-600">✓</div>
                  <div className="text-left">
                    <div className="text-[10px] font-black text-slate-400 tracking-widest uppercase">Verification</div>
                    <div className="text-xs font-bold text-slate-800">Doctor Verified</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-20 animate-fade-in-up">
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">Why Choose <span className="text-teal-600">Health Sathi</span>?</h2>
            <p className="text-slate-500 max-w-2xl mx-auto text-lg leading-relaxed">We combine advanced AI with human expertise to make medical information accessible and understandable.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            {[
              {
                title: "Multimodal Analysis",
                desc: "Don't just type. Upload photos of handwritten prescriptions, PDF lab reports, or record audio voice notes. Our AI understands it all.",
                icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>,
                color: "from-blue-500/20 to-blue-500/5",
                textColor: "text-blue-600"
              },
              {
                title: "Language Barrier Breaker",
                desc: "Get guidance in your local language. Health Sathi automatically detects spoken languages and translates complex medical terms into Hindi or English.",
                icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"></path></svg>,
                color: "from-teal-500/20 to-teal-500/5",
                textColor: "text-teal-600"
              },
              {
                title: "Doctor Verified",
                desc: "AI isn't perfect, so we keep humans in the loop. Doctors review critical cases and AI insights before you receive the final guidance.",
                icon: <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>,
                color: "from-indigo-500/20 to-indigo-500/5",
                textColor: "text-indigo-600"
              }
            ].map((feature, i) => (
              <div
                key={i}
                className="group relative p-10 rounded-[2.5rem] bg-slate-50 border border-slate-100/80 hover:bg-white hover:shadow-[0_30px_70px_rgba(0,0,0,0.06)] hover:-translate-y-3 transition-all duration-500 animate-fade-in-up"
                style={{ animationDelay: `${0.1 * (i + 1)}s` }}
              >
                <div className={`h-16 w-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center ${feature.textColor} mb-8 shadow-inner border border-white/40 transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`}>
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-black text-slate-800 mb-4 tracking-tight">{feature.title}</h3>
                <p className="text-slate-500 leading-relaxed font-medium">
                  {feature.desc}
                </p>
                <div className="absolute top-6 right-8 text-[10px] font-black text-slate-200 uppercase tracking-widest group-hover:text-teal-500/20 transition-colors">
                  Detail {i + 1}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Knowledge Base / RAG Showcase Section */}
      <section className="py-28 bg-slate-50 overflow-hidden relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/5 rounded-full blur-[120px] -z-0 animate-pulse-glow"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-24">
            <div className="flex-1 space-y-10">
              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100/50 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                <span className="text-[10px] font-black text-indigo-700 uppercase tracking-[0.2em]">Knowledge Context Engine</span>
              </div>
              <h2 className="text-5xl font-black text-slate-900 leading-[1.1] tracking-tighter">
                Not Just Guessing.<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-600">Retrieving Clinical Truth.</span>
              </h2>
              <p className="text-slate-500 text-lg leading-relaxed max-w-xl font-medium">
                Unlike general AI, Health Sathi uses <strong className="text-slate-900">Retrieval-Augmented Generation (RAG)</strong>. Every response is anchored in our verified Clinical Reference Library.
              </p>

              <div className="grid gap-4">
                {[
                  { step: i => i + 1, title: "Retrieve", desc: "AI scans internal library for relevant clinical protocols.", color: "bg-emerald-50 text-emerald-600" },
                  { step: i => i + 1, title: "Validate", desc: "Inputs cross-referenced against high-risk diagnostic triggers.", color: "bg-indigo-50 text-indigo-600" },
                  { step: i => i + 1, title: "Cite", desc: "Guidance is delivered with verifiable library citations.", color: "bg-teal-50 text-teal-600" }
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-6 p-5 bg-white rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow group">
                    <div className={`h-12 w-12 ${item.color} rounded-2xl flex items-center justify-center flex-shrink-0 font-black text-lg shadow-inner group-hover:scale-110 transition-transform`}>{i + 1}</div>
                    <div>
                      <h4 className="font-black text-slate-800 text-sm uppercase tracking-widest mb-1">{item.title}</h4>
                      <p className="text-sm text-slate-500 font-medium">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-8 w-full relative">
              {[
                { id: "CH 1", title: "Cardiology", emoji: "🫀", desc: "Hypertension thresholds: Stage 1 (130/80) to Crisis (180/120).", warning: "BP > 180/120", color: "red", delay: "0s" },
                { id: "CH 2", title: "Metabolic", emoji: "🍭", desc: "HbA1c & Glucose monitoring. Verified Low GI food exchange lists.", warning: "Sugar < 70 mg/dL", color: "amber", delay: "2s", offset: "sm:translate-y-12" },
                { id: "CH 3", title: "Respiratory", emoji: "🫁", desc: "O2 Saturation Benchmarks (<94%) and fever hydration.", warning: "ER if O2 < 94%", color: "blue", delay: "1s" },
                { id: "CH 4", title: "Renal", emoji: "🧪", desc: "Creatinine markers (0.7-1.3) and GERD acidity protocols.", warning: "Goal: 0.7-1.3 mg/dL", color: "emerald", delay: "3s", offset: "sm:translate-y-12" }
              ].map((chapter, i) => (
                <div
                  key={i}
                  className={`bg-white/80 backdrop-blur-xl p-8 rounded-[3rem] border border-white shadow-[0_20px_50px_rgba(0,0,0,0.04)] hover:shadow-[0_40px_80px_rgba(79,70,229,0.1)] hover:-translate-y-3 transition-all duration-500 cursor-default group animate-float-slow ${chapter.offset || ""}`}
                  style={{ animationDelay: chapter.delay }}
                >
                  <div className={`h-14 w-14 bg-${chapter.color}-50 rounded-[1.25rem] flex items-center justify-center mb-6 text-2xl shadow-inner border border-${chapter.color}-100/50 group-hover:rotate-12 transition-transform duration-500`}>
                    {chapter.emoji}
                  </div>
                  <h4 className="font-black text-slate-900 text-xs mb-2 uppercase tracking-[0.2em]">{chapter.id}: {chapter.title}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed font-medium mb-6">{chapter.desc}</p>
                  <div className={`pt-5 border-t border-slate-100/80`}>
                    <span className={`text-[10px] font-black text-${chapter.color}-600 uppercase flex items-center gap-2 tracking-widest`}>
                      <span className={`w-1.5 h-1.5 rounded-full bg-${chapter.color}-600 animate-pulse`}></span>
                      {chapter.warning}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 bg-teal-900 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-teal-400 rounded-full mix-blend-screen filter blur-[150px] opacity-10 transform translate-x-1/2 -translate-y-1/2 animate-blob"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-400 rounded-full mix-blend-screen filter blur-[120px] opacity-10 transform -translate-x-1/2 translate-y-1/2 animate-blob-delayed"></div>

        <div className="max-w-4xl mx-auto px-4 text-center relative z-10 animate-fade-in-up">
          <h2 className="text-4xl md:text-6xl font-black mb-8 leading-tight tracking-tighter">Ready to take control <br />of your health?</h2>
          <p className="text-teal-100 text-lg md:text-xl mb-12 max-w-2xl mx-auto font-medium opacity-80">
            Join thousands of patients and doctors using Health Sathi to simplify chronic disease management.
          </p>
          <Link to="/auth">
            <button className="px-12 py-5 bg-white text-teal-900 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-teal-50 transition-all shadow-[0_20px_50px_rgba(255,255,255,0.2)] hover:-translate-y-1 active:scale-95">
              Create Free Account
            </button>
          </Link>
        </div>
      </section>

      {/* Combined Feedback & Footer Section */}
      <section className="bg-slate-950 pt-32 pb-16 overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-24 items-start pb-24 border-b border-white/5">
            <div className="space-y-10">
              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-teal-500/10 border border-teal-500/20">
                <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></span>
                <span className="text-[10px] font-black text-teal-400 uppercase tracking-[0.2em]">Global Feedback Portal</span>
              </div>
              <h2 className="text-5xl font-black text-white leading-[1.1] tracking-tighter">
                Help Us Improve the <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-400">Health Sathi Experience</span>
              </h2>
              <p className="text-slate-400 leading-relaxed max-w-md text-lg font-medium">
                Your feedback is crucial. Whether it's a feature request, a bug report, or a general thought, we're all ears.
              </p>

              <div className="flex flex-wrap items-center gap-10 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                <div className="flex items-center gap-4">
                  <div className="h-8 w-8 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400 border border-emerald-500/20 shadow-inner">✓</div>
                  Verified Reviews
                </div>
                <div className="flex items-center gap-4">
                  <div className="h-8 w-8 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400 border border-emerald-500/20 shadow-inner">✓</div>
                  Direct Feedback
                </div>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-teal-500 to-emerald-500 rounded-[3rem] blur opacity-10 group-hover:opacity-20 transition duration-1000 group-hover:duration-200"></div>
              <div className="bg-slate-900/80 backdrop-blur-3xl p-10 rounded-[2.5rem] border border-white/10 shadow-2xl relative transition-all hover:bg-slate-900/90">
                <form onSubmit={handleFeedbackSubmit} className="space-y-8">
                  <div className="grid sm:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-teal-400 uppercase tracking-[0.2em] ml-1">Full Name</label>
                      <input
                        type="text"
                        name="name"
                        required
                        autoComplete="name"
                        disabled={feedbackStatus === 'loading' || feedbackStatus === 'success'}
                        className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-sm text-white placeholder-slate-600 focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 outline-none transition-all disabled:opacity-50"
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-teal-400 uppercase tracking-[0.2em] ml-1">Email Address</label>
                      <input
                        type="email"
                        name="email"
                        required
                        autoComplete="email"
                        disabled={feedbackStatus === 'loading' || feedbackStatus === 'success'}
                        className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-sm text-white placeholder-slate-600 focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 outline-none transition-all disabled:opacity-50"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-teal-400 uppercase tracking-[0.2em] ml-1">Message</label>
                    <textarea
                      name="message"
                      required
                      rows={4}
                      disabled={feedbackStatus === 'loading' || feedbackStatus === 'success'}
                      className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-sm text-white placeholder-slate-600 focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 outline-none transition-all resize-none disabled:opacity-50"
                      placeholder="Tell us what you think..."
                    ></textarea>
                  </div>

                  {feedbackMessage && (
                    <div className={`p-5 rounded-2xl text-xs font-black uppercase tracking-widest text-center animate-fade-in-up ${feedbackStatus === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                      {feedbackMessage}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={feedbackStatus === 'loading' || feedbackStatus === 'success'}
                    className="w-full py-5 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-teal-500/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed"
                  >
                    {feedbackStatus === 'loading' ? 'Sending...' : feedbackStatus === 'success' ? 'Sent Perfectly ✨' : 'Submit Feedback'}
                  </button>
                </form>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-4 gap-16 pt-24">
            <div className="col-span-1 md:col-span-2 space-y-8">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-teal-600 text-white rounded-[1.25rem] flex items-center justify-center font-black text-base shadow-xl shadow-teal-600/30">HS</div>
                <span className="text-2xl font-black text-white tracking-tighter">Health Sathi</span>
              </div>
              <p className="text-base text-slate-500 max-w-sm leading-relaxed font-medium">
                Empowering patients with AI-driven insights and connecting them with trusted medical professionals globally.
              </p>
            </div>
            <div className="space-y-8">
              <h4 className="text-white font-black uppercase text-[10px] tracking-[0.3em] opacity-40">Product</h4>
              <ul className="space-y-5 text-sm font-bold text-slate-400">
                <li><a href="#" className="hover:text-teal-400 transition-colors uppercase tracking-widest text-[11px]">Features</a></li>
                <li><a href="#" className="hover:text-teal-400 transition-colors uppercase tracking-widest text-[11px]">For Patients</a></li>
                <li><a href="#" className="hover:text-teal-400 transition-colors uppercase tracking-widest text-[11px]">For Doctors</a></li>
              </ul>
            </div>
            <div className="space-y-8">
              <h4 className="text-white font-black uppercase text-[10px] tracking-[0.3em] opacity-40">Legal</h4>
              <ul className="space-y-5 text-sm font-bold text-slate-400">
                <li><a href="#" className="hover:text-teal-400 transition-colors uppercase tracking-widest text-[11px]">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-teal-400 transition-colors uppercase tracking-widest text-[11px]">Terms of Service</a></li>
              </ul>
            </div>
          </div>

          <div className="mt-32 pt-12 border-t border-white/5 text-center">
            <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em]">
              © 2025 Health Sathi AI. All rights reserved. Built with Multimodal Precision.
            </p>
          </div>
        </div>
      </section>

      {/* QR Code Modal */}
      {showQR && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4" onClick={() => setShowQR(false)}>
          <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-sm w-full text-center transform transition-all" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-900">Scan to Download</h3>
              <button onClick={() => setShowQR(false)} className="p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            <div className="bg-white p-4 rounded-2xl border-4 border-slate-50 inline-block mb-6 shadow-sm">
              <QRCodeSVG value={apkUrl} size={200} level="H" includeMargin={false} />
            </div>
            <p className="text-slate-600 mb-8 text-sm leading-relaxed">
              Scan this QR code with your Android phone's camera to download the Health Sathi app immediately.
            </p>
            <a href="/apk/Health-Sathi.apk" download className="block w-full py-4 bg-teal-50 text-teal-700 rounded-xl font-bold hover:bg-teal-100 transition-colors border border-teal-100">
              Download Directly Instead
            </a>
          </div>
        </div>
      )}
    </div>
  );
};
