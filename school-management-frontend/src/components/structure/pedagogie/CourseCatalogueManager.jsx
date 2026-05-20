import React, { useState, useEffect } from 'react';
import { BookOpen, FolderTree, Tag, Plus, Save, Trash2, ChevronRight } from 'lucide-react';
import courseAcademicConfigService from '../../../services/pedagogieService/courseAcademicConfigService';

const CourseCatalogueManager = () => {
  const [activeView, setActiveView] = useState('domains'); // domains, subdomains, subjects
  const [data, setData] = useState({ domains: [], subDomains: [], subjects: [] });
  const [loading, setLoading] = useState(false);

  // Form States
  const [domainForm, setDomainForm] = useState({ name: '', orderIndex: 0 });
  const [subDomainForm, setSubDomainForm] = useState({ name: '', domainId: '', orderIndex: 0 });
  const [subjectForm, setSubjectForm] = useState({ name: '', domainId: '', subDomainId: '' });

  useEffect(() => { loadAllData(); }, []);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [d, sd, s] = await Promise.all([
        courseAcademicConfigService.getAllDomains(),
        courseAcademicConfigService.getAllSubDomains(),
        courseAcademicConfigService.getAllSubjects()
      ]);
      setData({ domains: d.data, subDomains: sd.data, subjects: s.data });
    } catch (err) { console.error("Erreur de chargement", err); }
    finally { setLoading(false); }
  };

  const handleDomainSubmit = async (e) => {
    e.preventDefault();
    await courseAcademicConfigService.createDomain(domainForm);
    setDomainForm({ name: '', orderIndex: 0 });
    loadAllData();
  };

  const handleSubjectSubmit = async (e) => {
    e.preventDefault();
    await courseAcademicConfigService.createSubject(subjectForm);
    setSubjectForm({ name: '', domainId: '', subDomainId: '' });
    loadAllData();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in slide-in-from-bottom-4">
      
      {/* Sidebar de Navigation - Responsive: Horizontal sur mobile */}
      <div className="lg:col-span-3 flex lg:flex-col gap-2 overflow-x-auto pb-2 lg:pb-0">
        {[
          { id: 'domains', label: 'Domaines', icon: FolderTree },
          { id: 'subdomains', label: 'Sous-Domaines', icon: Tag },
          { id: 'subjects', label: 'Matières', icon: BookOpen },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveView(tab.id)}
            className={`flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm transition-all whitespace-nowrap flex-1 lg:flex-none ${
              activeView === tab.id ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-slate-500 hover:bg-slate-50'
            }`}
          >
            <tab.icon size={18} /> {tab.label}
          </button>
        ))}
      </div>

      {/* Zone de Contenu Principal */}
      <div className="lg:col-span-9 space-y-6">
        
        {/* Formulaire Dynamique */}
        <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
          <h3 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
            <Plus className="text-blue-500" /> Ajouter {activeView === 'domains' ? 'un Domaine' : activeView === 'subdomains' ? 'un Sous-Domaine' : 'une Matière'}
          </h3>
          
          <form className="grid grid-cols-1 md:grid-cols-3 gap-4" onSubmit={activeView === 'subjects' ? handleSubjectSubmit : handleDomainSubmit}>
            <input 
              placeholder="Nom..." 
              className="md:col-span-1 bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-bold"
              value={activeView === 'subjects' ? subjectForm.name : domainForm.name}
              onChange={(e) => activeView === 'subjects' ? setSubjectForm({...subjectForm, name: e.target.value}) : setDomainForm({...domainForm, name: e.target.value})}
              required
            />
            
            {activeView === 'subjects' && (
              <select 
                className="bg-slate-50 border-none rounded-xl px-4 py-3 text-sm font-bold"
                value={subjectForm.domainId}
                onChange={(e) => setSubjectForm({...subjectForm, domainId: e.target.value})}
                required
              >
                <option value="">Domaine...</option>
                {data.domains.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            )}

            <button className="bg-slate-900 text-white rounded-xl font-black text-sm hover:bg-blue-600 transition-all flex items-center justify-center gap-2 py-3">
              <Save size={18} /> Enregistrer
            </button>
          </form>
        </div>

        {/* Liste Responsive */}
        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-50 font-black text-slate-800 uppercase tracking-widest text-xs">
            Liste des {activeView}
          </div>
          <div className="divide-y divide-slate-50">
            {data[activeView === 'subdomains' ? 'subDomains' : activeView].map((item) => (
              <div key={item.id} className="p-4 hover:bg-slate-50 transition-colors flex justify-between items-center group">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-bold">
                    {item.id}
                  </div>
                  <div>
                    <div className="font-bold text-slate-700 text-sm">{item.name}</div>
                    {item.domainName && <div className="text-[10px] text-slate-400 font-bold uppercase">{item.domainName}</div>}
                  </div>
                </div>
                <button className="opacity-0 group-hover:opacity-100 p-2 text-red-400 hover:bg-red-50 rounded-lg transition-all">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default CourseCatalogueManager;