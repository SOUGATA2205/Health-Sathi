import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store';
import { ReportStatus, HealthReport, UserRole, UserProfile } from '../types';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { logoutUser } from '../services/dbService';

export const DoctorDashboard: React.FC = () => {
  const { 
    reports, 
    updateReportStatus, 
    loadReports, 
    setAuth, 
    isSidebarOpen, 
    setSidebarOpen, 
    sidebarActiveSection,
    currentPatientName,
    currentUserId,
    currentUserProfile,
    updateProfile,
    deleteReport
  } = useAppStore();
  
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editNote, setEditNote] = useState("");
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Profile Editing State
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editForm, setEditForm] = useState<Partial<UserProfile>>({});

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  // Sync edit form with profile data when opening edit mode
  useEffect(() => {
    if (isEditingProfile) {
      if (currentUserProfile) {
        setEditForm(currentUserProfile);
      } else {
        setEditForm({ name: currentPatientName, email: '' });
      }
    }
  }, [isEditingProfile, currentUserProfile, currentPatientName]);

  const handleLogout = async () => {
    await logoutUser();
    setSidebarOpen(false);
    setAuth(UserRole.GUEST, '', null);
  };

  const handleProfileSave = async () => {
    if (Object.keys(editForm).length > 0) {
       await updateProfile(editForm);
    }
    setIsEditingProfile(false);
  };

  // Sort: Critical -> Warning (Pending) -> Review
  const sortedReports = [...reports].sort((a, b) => {
    const statusOrder = {
      [ReportStatus.CRITICAL]: 0,
      [ReportStatus.PENDING]: 1,
      [ReportStatus.REVIEWED]: 2,
    };
    return statusOrder[a.status] - statusOrder[b.status] || b.timestamp - a.timestamp;
  });

  const selectedReport = reports.find(r => r.id === selectedReportId);
  
  useEffect(() => {
    if (!selectedReportId && reports.length > 0 && window.innerWidth >= 768) {
      setSelectedReportId(sortedReports[0].id);
    }
  }, [reports, selectedReportId, sortedReports]);

  useEffect(() => {
    if (selectedReport) {
      setIsEditing(false);
      setEditNote("");
    }
  }, [selectedReport?.id]);

  const previousReport = selectedReport 
    ? reports.find(r => r.patientName === selectedReport.patientName && r.id !== selectedReport.id && r.timestamp < selectedReport.timestamp)
    : null;

  const handleApprove = async (id: string) => {
    await updateReportStatus(id, ReportStatus.REVIEWED, "Approved by Dr. Singh.");
  };

  const handleEscalate = async (id: string) => {
    await updateReportStatus(id, ReportStatus.CRITICAL, "Escalated for Tele-consult.");
  };

  const handleDeleteReport = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this report from the database? This action cannot be undone.")) {
      await deleteReport(id);
      if (selectedReportId === id) {
        setSelectedReportId(null);
      }
    }
  };

  const handleStartModify = () => {
    if (selectedReport) {
      if (!selectedReportId) setSelectedReportId(selectedReport.id);
      // Pre-fill with existing notes OR AI guidance to allow modification of the draft
      const initialText = selectedReport.doctorNotes || selectedReport.aiAnalysis?.english_guidance || "";
      setEditNote(initialText);
      setIsEditing(true);
    }
  };

  const handleSaveModification = async () => {
    if (selectedReport) {
      await updateReportStatus(selectedReport.id, ReportStatus.REVIEWED, editNote);
      setIsEditing(false);
    }
  };

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col md:flex-row bg-slate-50 overflow-hidden relative">
      
      {/* Animated Background Blobs */}
      <div className="fixed top-40 -right-40 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div className="fixed -bottom-20 -left-20 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" style={{ animationDelay: '2s' }}></div>
      
      {/* --- SIDEBAR OVERLAY --- */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[110] transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* --- TOGGLEABLE SIDEBAR --- */}
      <aside className={`fixed top-0 left-0 h-full w-85 bg-white shadow-2xl z-[120] transform transition-transform duration-300 ease-in-out flex flex-col ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-8 flex-1 overflow-y-auto">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">
               {sidebarActiveSection === 'profile' ? 'Doctor Profile' : 'Sathi Library'}
            </h2>
            <button onClick={() => setSidebarOpen(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors">
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
          </div>

          {sidebarActiveSection === 'profile' ? (
            <div className="animate-in fade-in slide-in-from-left-4 duration-300">
              <section className="mb-12 relative">
                {!isEditingProfile && (
                  <button onClick={() => setIsEditingProfile(true)} className="absolute top-0 right-0 p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Edit Profile">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                  </button>
                )}
                <div className="text-center mb-8">
                   <div className="h-28 w-28 mx-auto bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center text-5xl font-bold border border-indigo-100 shadow-sm mb-5">
                     Dr
                   </div>
                   <h3 className="text-2xl font-bold text-slate-900">{currentPatientName}</h3>
                </div>

                {isEditingProfile ? (
                  <div className="space-y-4 mb-8">
                      <div>
                         <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Specialization</label>
                         <input 
                           type="text" 
                           className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                           value={editForm.specialization || ""} 
                           onChange={e => setEditForm({...editForm, specialization: e.target.value})} 
                           placeholder="e.g. Cardiologist"
                         />
                       </div>
                       <div>
                         <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Hospital Name</label>
                         <input 
                           type="text" 
                           className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                           value={editForm.hospitalName || ""} 
                           onChange={e => setEditForm({...editForm, hospitalName: e.target.value})} 
                           placeholder="e.g. City General Hospital"
                         />
                       </div>
                      <div className="flex gap-3 pt-2">
                        <Button fullWidth onClick={handleProfileSave} className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/20">Save</Button>
                        <Button fullWidth variant="outline" onClick={() => setIsEditingProfile(false)}>Cancel</Button>
                      </div>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-4 mb-8">
                      <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-center">
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">Total Reviews</p>
                          <p className="font-bold text-xl text-slate-800">{reports.length}</p>
                      </div>
                      <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-center">
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">Active Alerts</p>
                          <p className="font-bold text-xl text-red-600">{reports.filter(r => r.status === ReportStatus.CRITICAL).length}</p>
                      </div>

                      <div className="col-span-2 bg-indigo-600 rounded-2xl p-5 text-white shadow-lg shadow-indigo-600/20">
                        <p className="text-[10px] font-bold uppercase mb-2 flex items-center gap-2 opacity-90">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3a1 1 0 00-.787 0l-7 3a1 1 0 000 1.838l1.69.724z"></path></svg>
                          {currentUserProfile?.specialization || 'General Physician'}
                        </p>
                        <p className="text-[11px] leading-relaxed font-medium opacity-80">
                          Working at {currentUserProfile?.hospitalName || 'your medical center'}.
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </section>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-left-4 duration-300">
               {/* Same Library Content as Patient but for Doctor Reference */}
               <section className="mb-8">
                  <div className="flex items-center gap-3 mb-8 bg-indigo-50 p-4 rounded-2xl border border-indigo-100">
                    <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-2xl">📚</div>
                    <div>
                      <p className="font-bold text-indigo-900 tracking-tight">Clinical Standards</p>
                      <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-widest">v1.0.24 Update</p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="bg-white border border-slate-100 p-6 rounded-2xl shadow-sm">
                      <h4 className="font-bold text-slate-800 text-sm mb-2">Diagnostic Thresholds</h4>
                      <p className="text-[11px] text-slate-500 leading-relaxed font-medium">Reference for hypertensive crisis and metabolic shock markers according to Health Sathi protocols.</p>
                    </div>
                  </div>
               </section>
            </div>
          )}
        </div>

        <div className="p-8 border-t border-slate-50 bg-slate-50/30">
           <button 
             onClick={handleLogout}
             className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl border border-slate-200 bg-white text-slate-500 hover:text-red-600 hover:bg-red-50 hover:border-red-100 transition-all font-bold text-xs uppercase tracking-widest shadow-sm"
           >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
              Logout
           </button>
        </div>
      </aside>

      {/* --- TRIAGE SIDEBAR (Left Panel) --- */}
      <div className={`w-full md:w-1/3 lg:w-1/4 bg-white/70 backdrop-blur-md border-r border-slate-200 flex flex-col h-full z-10 animate-slide-in-right ${selectedReportId ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-5 border-b border-slate-100 bg-white/50">
          <h2 className="font-black text-slate-800 text-lg tracking-tight uppercase text-xs opacity-50 mb-3">Patient Triage</h2>
          <div className="flex gap-2">
             <span className="text-[10px] bg-red-100 text-red-700 px-2 py-1 rounded-lg font-bold uppercase tracking-wider border border-red-200 shadow-sm">
               {reports.filter(r => r.status === ReportStatus.CRITICAL).length} Emergency
             </span>
             <span className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-1 rounded-lg font-bold uppercase tracking-wider border border-indigo-100 shadow-sm">
               {reports.length} Total
             </span>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {sortedReports.map(report => (
            <div 
              key={report.id}
              onClick={() => setSelectedReportId(report.id)}
              className={`p-5 border-b border-slate-50 cursor-pointer transition-all duration-300 relative group ${
                selectedReport?.id === report.id 
                  ? 'bg-indigo-50/80 shadow-inner' 
                  : 'hover:bg-white/50'
              }`}
            >
              <div className="flex justify-between items-start mb-1">
                <h3 className={`font-bold text-sm tracking-tight ${selectedReport?.id === report.id ? 'text-indigo-900' : 'text-slate-700'}`}>
                  {report.patientName}
                </h3>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleDeleteReport(report.id); }}
                    className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                    title="Delete Report"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                  </button>
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-2">
                <div className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-widest border ${
                   report.status === ReportStatus.CRITICAL ? 'bg-red-50 text-red-600 border-red-100 shadow-[0_0_10px_rgba(239,68,68,0.2)]' :
                   report.status === ReportStatus.PENDING ? 'bg-amber-50 text-amber-600 border-amber-100' :
                   'bg-emerald-50 text-emerald-600 border-emerald-100'
                }`}>
                  {report.status}
                </div>
                <p className="text-[10px] text-slate-400 font-medium">{new Date(report.timestamp).toLocaleDateString()}</p>
              </div>
              
              {selectedReport?.id === report.id && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-600 rounded-r-full shadow-[2px_0_10px_rgba(79,70,229,0.3)]"></div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* --- MAIN REVIEW WORKSPACE --- */}
      <div className={`flex-1 flex flex-col h-full overflow-hidden relative ${!selectedReportId ? 'hidden md:flex' : 'flex'}`}>
        {selectedReport ? (
          <>
            <header className="bg-white/80 backdrop-blur-md p-6 border-b border-slate-200 shadow-[0_4px_20px_rgba(0,0,0,0.03)] z-10 animate-fade-in-up">
               <div className="flex justify-between items-start">
                 <div className="flex items-center gap-4">
                    {/* Back Button for Mobile */}
                    <button 
                      onClick={() => setSelectedReportId(null)}
                      className="md:hidden p-2.5 -ml-2 text-slate-400 hover:bg-slate-50 hover:text-indigo-600 rounded-xl transition-all"
                      title="Back to Triage"
                    >
                       <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                    </button>
                    
                    <div className="relative">
                       <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                         {selectedReport.patientName}
                       </h1>
                       
                       <div className="flex items-center gap-2 mt-1.5">
                         <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                         <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">
                           Last Assessment: {new Date(selectedReport.timestamp).toLocaleString()}
                         </p>
                       </div>
                    </div>
                 </div>
                 {selectedReport.aiAnalysis && (
                   <div className="flex flex-col items-end">
                      <div className={`text-xs font-black px-4 py-2 rounded-2xl border shadow-sm ${
                        selectedReport.aiAnalysis.confidence_score > 85 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                          : 'bg-amber-50 text-amber-700 border-amber-100'
                      }`}>
                         {selectedReport.aiAnalysis.confidence_score}% Precision Match
                      </div>
                   </div>
                 )}
               </div>
            </header>

              <div className="flex-1 overflow-y-auto p-6 md:p-10 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              {selectedReport.status === ReportStatus.CRITICAL && (
                <div className="mb-8 bg-red-50/80 backdrop-blur-sm border border-red-200 rounded-[2rem] p-6 flex items-start gap-4 shadow-[0_20px_40px_rgba(239,68,68,0.1)] animate-float">
                  <div className="h-12 w-12 bg-red-100 rounded-2xl flex items-center justify-center text-2xl shadow-inner border border-red-200/50">🚨</div>
                  <div>
                    <h3 className="text-red-900 font-black text-lg tracking-tight uppercase text-xs opacity-70 mb-1">Critical Clinical Attention</h3>
                    <p className="text-red-700 font-bold leading-relaxed">{selectedReport.aiAnalysis?.critical_reason || "Immediate clinical intervention requested based on critical markers."}</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-6">
                   <Card>
                      <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">Lab Values Comparison</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                          <thead className="bg-slate-50 text-slate-500 uppercase text-xs">
                            <tr>
                              <th className="px-4 py-3">Metric</th>
                              <th className="px-4 py-3">Previous</th>
                              <th className="px-4 py-3 text-indigo-700 font-bold bg-indigo-50">Current</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {selectedReport.aiAnalysis?.extracted_values && Object.entries(selectedReport.aiAnalysis.extracted_values).map(([key, value]) => (
                               <tr key={key}>
                                 <td className="px-4 py-3 font-medium text-slate-700">{key}</td>
                                 <td className="px-4 py-3 text-slate-400">{(previousReport?.aiAnalysis?.extracted_values?.[key] as string) || "-"}</td>
                                 <td className="px-4 py-3 font-bold text-slate-900 bg-indigo-50/30">{String(value)}</td>
                               </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                   </Card>
                </div>
                <div className="space-y-8">
                   {selectedReport.imageUri && (
                      <div className="aspect-video bg-slate-100 rounded-[2rem] overflow-hidden border border-slate-200 relative group shadow-xl shadow-slate-200/50">
                         <img src={selectedReport.imageUri} alt="Report" className="w-full h-full object-contain bg-[#0a0a0a]" />
                         <button onClick={() => setPreviewImage(selectedReport.imageUri!)} className="absolute inset-0 bg-indigo-900/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center text-white text-xs font-black uppercase tracking-widest backdrop-blur-sm">Expend Document Preview</button>
                      </div>
                   )}
                   <Card className="border-emerald-100 bg-emerald-50/50 backdrop-blur-sm rounded-[2rem] shadow-sm relative overflow-hidden">
                     <div className="absolute top-0 right-0 p-4 opacity-10">
                        <svg className="w-16 h-16 text-emerald-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path></svg>
                     </div>
                     <h3 className="font-black text-emerald-800 text-[10px] mb-3 uppercase tracking-widest flex items-center gap-2">
                        <span className="w-1 h-1 bg-emerald-500 rounded-full"></span> Sathi AI Guidance
                     </h3>
                     <p className="text-base text-slate-800 italic leading-relaxed font-medium">"{selectedReport.aiAnalysis?.english_guidance}"</p>
                   </Card>
                </div>
              </div>
            </div>

            {/* FIXED BOTTOM ACTION BAR WITH EDITING MODE */}
            <div className="bg-white/90 backdrop-blur-xl border-t border-slate-200 p-6 z-20 shadow-[0_-10px_40px_rgba(0,0,0,0.08)]">
               {isEditing ? (
                 <div className="max-w-5xl mx-auto space-y-4 animate-fade-in-up">
                   <div className="relative">
                     <div className="absolute top-3 left-4 text-[9px] font-black text-indigo-400 uppercase tracking-widest pointer-events-none">Drafting Clinical Modification</div>
                     <textarea
                       value={editNote}
                       onChange={(e) => setEditNote(e.target.value)}
                       placeholder="Add your specialized clinical notes here..."
                       className="w-full p-6 pt-10 border-2 border-indigo-100 rounded-[1.5rem] text-sm font-medium resize-none focus:outline-none focus:border-indigo-400 bg-indigo-50/50 text-slate-800 transition-all"
                       rows={4}
                     />
                   </div>
                   <div className="flex gap-4">
                     <Button variant="primary" className="flex-[2] py-4 rounded-xl shadow-xl shadow-indigo-600/20 font-bold tracking-widest uppercase text-xs" onClick={handleSaveModification}>Approve & Dispatch Modification</Button>
                     <Button variant="secondary" className="flex-1 py-4 rounded-xl font-bold tracking-widest uppercase text-xs" onClick={() => setIsEditing(false)}>Cancel Draft</Button>
                   </div>
                 </div>
               ) : (
                 <div className="max-w-5xl mx-auto flex gap-4">
                    <Button variant="primary" className="flex-[1.5] py-4 rounded-xl shadow-xl shadow-indigo-600/20 font-black tracking-widest uppercase text-xs hover:scale-[1.02] transition-transform" onClick={() => handleApprove(selectedReport.id)}>Quick Approve</Button>
                    <Button variant="secondary" className="flex-1 py-4 rounded-xl border-2 border-slate-100 font-black tracking-widest uppercase text-xs hover:bg-slate-50 transition-all hover:scale-[1.02]" onClick={handleStartModify}>Modify Insights</Button>
                    <Button variant="danger" className="flex-1 py-4 rounded-xl shadow-xl shadow-red-600/10 font-black tracking-widest uppercase text-xs hover:scale-[1.02] transition-transform" onClick={() => handleEscalate(selectedReport.id)}>Escalate Case</Button>
                 </div>
               )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center flex-col text-slate-400">
             <p>Select a patient report to review.</p>
          </div>
        )}
      </div>

      {previewImage && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/90 p-4" onClick={() => setPreviewImage(null)}>
          <img src={previewImage} className="max-w-full max-h-full rounded-lg" />
        </div>
      )}
    </div>
  );
};