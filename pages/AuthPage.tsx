
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store';
import { UserRole } from '../types';
import { Button } from '../components/ui/Button';
import { registerUser, loginUser } from '../services/dbService';

type AuthStage = 'ROLE_SELECTION' | 'FORM';

export const AuthPage = () => {
  const navigate = useNavigate();
  const { setAuth, loadReports } = useAppStore();
  const [stage, setStage] = useState<AuthStage>('ROLE_SELECTION');
  const [isRegister, setIsRegister] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.PATIENT);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setStage('FORM');
    setError('');
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isRegister) {
        const res = await registerUser(email, password, name, selectedRole, specialization);
        setAuth(res.role, name, res.user.uid, res.user);
      } else {
        const res = await loginUser(email, password);
        if (res.role !== selectedRole) {
          throw new Error(`This account is registered as a ${res.role.toLowerCase()}. Please select the correct portal.`);
        }
        setAuth(res.role, res.name || email, res.user.uid, res.user);
      }
      
      // Load reports immediately after setting auth to ensure data is ready
      await loadReports();
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  // Dynamic Theme Logic
  const isPatient = selectedRole === UserRole.PATIENT;
  const theme = {
    primary: isPatient ? 'teal' : 'indigo',
    gradientText: isPatient ? 'bg-gradient-to-r from-teal-600 to-emerald-600' : 'bg-gradient-to-r from-indigo-600 to-blue-600',
    bgGradient: isPatient ? 'from-teal-50 to-emerald-100' : 'from-indigo-50 to-blue-100',
    ringColor: isPatient ? 'focus:ring-teal-500/20' : 'focus:ring-indigo-500/20',
    borderColor: isPatient ? 'focus:border-teal-500' : 'focus:border-indigo-500',
    buttonVariant: isPatient ? 'primary' : 'secondary' as 'primary' | 'secondary'
  };

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 sm:p-6 transition-colors duration-700 bg-gradient-to-br ${theme.bgGradient}`}>
      
      {/* Decorative Background Elements */}
      <div className={`fixed top-[-10%] left-[-10%] w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] rounded-full mix-blend-multiply filter blur-[80px] opacity-40 animate-blob ${isPatient ? 'bg-teal-300' : 'bg-indigo-300'}`} />
      <div className={`fixed bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] rounded-full mix-blend-multiply filter blur-[80px] opacity-40 animate-blob ${isPatient ? 'bg-emerald-300' : 'bg-blue-300'}`} style={{ animationDelay: '2s' }} />

      <div className="w-full max-w-[480px] bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-[0_30px_60px_-12px_rgba(0,0,0,0.12)] border border-white/60 relative overflow-hidden transition-all duration-500">
        
        {/* Back Button - Navigation Logic */}
        <button 
          onClick={() => {
            if (stage === 'FORM') {
              setStage('ROLE_SELECTION');
              setError('');
            } else {
              navigate('/');
            }
          }}
          className="absolute top-6 left-6 p-2 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors z-20"
          title={stage === 'FORM' ? "Back to Role Selection" : "Back to Home"}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
        </button>

        <div className="p-8 md:p-10">
          
          {/* Header Title */}
          <div className="text-center mb-10">
             <div className="mb-4 inline-flex items-center justify-center p-3 bg-white rounded-2xl shadow-lg shadow-slate-200/50">
                <div className={`h-8 w-8 rounded-lg flex items-center justify-center text-white font-bold text-sm ${isPatient ? 'bg-teal-600' : 'bg-indigo-600'}`}>HS</div>
             </div>
             <h1 className={`text-3xl font-black text-transparent bg-clip-text ${theme.gradientText} tracking-tight mb-2`}>
               {stage === 'ROLE_SELECTION' ? 'Health Sathi' : (isRegister ? 'Create Account' : 'Welcome Back')}
             </h1>
             <p className="text-slate-500 font-medium text-sm">
               {stage === 'ROLE_SELECTION' ? 'Please select your role to proceed' : 'Securely access your medical dashboard'}
             </p>
          </div>

          {stage === 'ROLE_SELECTION' ? (
            <div className="grid gap-5 animate-fade-in-up">
              {/* Patient Card */}
              <button 
                onClick={() => handleRoleSelect(UserRole.PATIENT)}
                className="group relative w-full p-1 rounded-3xl bg-gradient-to-br from-slate-100 to-slate-200 hover:from-teal-400 hover:to-emerald-500 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-teal-500/20"
              >
                <div className="relative bg-white h-full rounded-[1.3rem] p-6 flex items-center gap-5 transition-colors group-hover:bg-white/95">
                   <div className="h-14 w-14 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 shadow-inner">
                     <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6z"/><path d="M6.5 10.5c0 3 2 5 5.5 5s5.5-2 5.5-5"/><path d="M9 14.5l-2.5 5"/><path d="M15 14.5l2.5 5"/><path d="M9 17h6"/></svg>
                   </div>
                   <div className="text-left">
                     <h3 className="font-bold text-slate-800 text-lg group-hover:text-teal-700 transition-colors">Patient Portal</h3>
                     <p className="text-xs font-medium text-slate-500 mt-0.5">Manage reports & get guidance</p>
                   </div>
                   <div className="ml-auto text-slate-300 group-hover:text-teal-500 transition-colors">
                     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                   </div>
                </div>
              </button>

              {/* Doctor Card */}
              <button 
                onClick={() => handleRoleSelect(UserRole.DOCTOR)}
                className="group relative w-full p-1 rounded-3xl bg-gradient-to-br from-slate-100 to-slate-200 hover:from-indigo-400 hover:to-blue-500 transition-all duration-300 shadow-sm hover:shadow-xl hover:shadow-indigo-500/20"
              >
                <div className="relative bg-white h-full rounded-[1.3rem] p-6 flex items-center gap-5 transition-colors group-hover:bg-white/95">
                   <div className="h-14 w-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300 shadow-inner">
                     <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3"/><path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"/><circle cx="20" cy="10" r="2"/></svg>
                   </div>
                   <div className="text-left">
                     <h3 className="font-bold text-slate-800 text-lg group-hover:text-indigo-700 transition-colors">Doctor Portal</h3>
                     <p className="text-xs font-medium text-slate-500 mt-0.5">Verify cases & clinical triage</p>
                   </div>
                   <div className="ml-auto text-slate-300 group-hover:text-indigo-500 transition-colors">
                     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                   </div>
                </div>
              </button>
            </div>
          ) : (
            <div className="animate-slide-in-right">
              
              {error && (
                <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm font-semibold rounded-2xl border border-red-100 flex items-center gap-3 animate-in shake">
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleAuth} className="space-y-4">
                
                {isRegister && (
                  <div className="space-y-4 animate-fade-in-up" style={{ animationDuration: '0.5s' }}>
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">Full Name</label>
                      <div className="relative group">
                         <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-slate-600 transition-colors">
                           <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                         </div>
                         <input 
                           type="text" 
                           value={name} 
                           onChange={e => setName(e.target.value)} 
                           className={`w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 placeholder-slate-400 font-medium focus:bg-white focus:outline-none focus:ring-4 ${theme.ringColor} ${theme.borderColor} transition-all duration-200`} 
                           placeholder={selectedRole === UserRole.DOCTOR ? "e.g. Dr. Anjali Singh" : "e.g. Rahul Sharma"}
                           required 
                         />
                      </div>
                    </div>

                    {selectedRole === UserRole.DOCTOR && (
                      <div className="space-y-1.5 animate-fade-in-up" style={{ animationDuration: '0.6s' }}>
                         <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">Specialization</label>
                         <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-slate-600 transition-colors">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path></svg>
                            </div>
                            <input 
                              type="text" 
                              value={specialization} 
                              onChange={e => setSpecialization(e.target.value)} 
                              className={`w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 placeholder-slate-400 font-medium focus:bg-white focus:outline-none focus:ring-4 ${theme.ringColor} ${theme.borderColor} transition-all duration-200`} 
                              placeholder="e.g. Cardiologist"
                              required 
                            />
                         </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-1.5">
                   <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">Email</label>
                   <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-slate-600 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                      </div>
                      <input 
                        type="email" 
                        value={email} 
                        onChange={e => setEmail(e.target.value)} 
                        className={`w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 placeholder-slate-400 font-medium focus:bg-white focus:outline-none focus:ring-4 ${theme.ringColor} ${theme.borderColor} transition-all duration-200`} 
                        placeholder="name@example.com"
                        required 
                      />
                   </div>
                </div>

                <div className="space-y-1.5">
                   <label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest ml-1">Password</label>
                   <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-slate-600 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                      </div>
                      <input 
                        type={showPassword ? "text" : "password"} 
                        value={password} 
                        onChange={e => setPassword(e.target.value)} 
                        className={`w-full pl-11 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 placeholder-slate-400 font-medium focus:bg-white focus:outline-none focus:ring-4 ${theme.ringColor} ${theme.borderColor} transition-all duration-200`} 
                        placeholder="••••••••"
                        required 
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
                        title={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path></svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                        )}
                      </button>
                   </div>
                </div>

                <div className="pt-4">
                  <Button 
                    fullWidth 
                    type="submit" 
                    disabled={loading}
                    variant={theme.buttonVariant}
                    className="py-4 rounded-2xl text-sm font-bold uppercase tracking-widest shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-300"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center gap-2">
                         <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                         Authenticating...
                      </div>
                    ) : (isRegister ? 'Create Secure Account' : 'Sign In to Portal')}
                  </Button>
                </div>
              </form>

              <div className="mt-8 text-center">
                <p className="text-slate-400 text-xs font-medium mb-2">
                  {isRegister ? "Already have an account?" : "New to Health Sathi?"}
                </p>
                <button 
                  onClick={() => {
                    setIsRegister(!isRegister);
                    setError('');
                  }} 
                  className={`text-sm font-bold transition-all ${isPatient ? 'text-teal-600 hover:text-teal-700' : 'text-indigo-600 hover:text-indigo-700'}`}
                >
                  {isRegister ? "Sign In Instead" : "Create New Account"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
