import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Plus, X, Save, Search, LayoutGrid, Copy, RefreshCcw, History, Printer, Eye, Download, GraduationCap } from 'lucide-react';
import academicService from '../../../services/academicYearService';
import courseAcademicConfigService from '../../../services/pedagogieService/courseAcademicConfigService';
import CourseGridDisplay from './CourseGridDisplay';

const CourseClassAssignmentBuilder = () => {
  const [activeYear, setActiveYear] = useState(null);
  const [allYears, setAllYears] = useState([]);
  const [availableClasses, setAvailableClasses] = useState([]);
  const [activeClass, setActiveClass] = useState(null);
  const [isBuildingClasses, setIsBuildingClasses] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [institutionInfo, setInstitutionInfo] = useState(null);
  
  // NOUVEAU : Liste des spécialités pour la configuration des domaines
  const [specialities, setSpecialities] = useState([]);

  const [sourceYearForImport, setSourceYearForImport] = useState("");
  const [hierarchyTree, setHierarchyTree] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [modal, setModal] = useState({ isOpen: false, type: '', data: null });
  const [showPrintPreview, setShowPrintPreview] = useState(false);

  const scrollContainerRef = useRef(null);
  const printRef = useRef(null);

  const sortClassesLogic = (classes) => {
    return [...classes].sort((a, b) => {
      const isBaseA = a.label.includes("7") || a.label.includes("8");
      const isBaseB = b.label.includes("7") || b.label.includes("8");
      if (isBaseA && !isBaseB) return -1;
      if (!isBaseA && isBaseB) return 1;
      if (isBaseA && isBaseB) {
        return a.label.localeCompare(b.label, undefined, { numeric: true });
      }
      const getDetails = (label) => {
        const parts = label.split(' ');
        const yearStr = parts[0]; 
        const sectionOption = parts.slice(1).join(' '); 
        const match = yearStr.match(/(\d+)/);
        const yearNum = match ? parseInt(match[1]) : 99;
        return { yearNum, sectionOption };
      };
      const infoA = getDetails(a.label);
      const infoB = getDetails(b.label);
      if (infoA.sectionOption !== infoB.sectionOption) {
        return infoA.sectionOption.localeCompare(infoB.sectionOption);
      }
      return infoA.yearNum - infoB.yearNum;
    });
  };

  useEffect(() => {
    const init = async () => {
      setIsBuildingClasses(true);
      try {
        const [yearRes, allYearsRes, levelsRes, instRes, specRes] = await Promise.all([
          academicService.getActiveYear(),
          academicService.getAllAcademicYears(),
          courseAcademicConfigService.getAllLevels(),
          courseAcademicConfigService.getInstitutionSettings().catch(() => ({ data: null })),
          // Appel au service pour récupérer les spécialités
          courseAcademicConfigService.getAllSpecialities().catch(() => ({ data: [] }))
        ]);
        
        setActiveYear(yearRes.data);
        setInstitutionInfo(instRes?.data);
        setSpecialities(specRes.data || []);

        const years = allYearsRes.data || [];
        setAllYears(years);
        
        if (yearRes.data && years.length > 0) {
            const otherYears = years.filter(y => y.id !== yearRes.data.id).sort((a, b) => b.id - a.id);
            if (otherYears.length > 0) setSourceYearForImport(otherYears[0].id);
        }
        
        const fetchedLevels = levelsRes.data || [];
        let generatedClasses = [];
        const baseLevels = fetchedLevels.filter(l => l.type === 'BASE' || l.name.includes("7") || l.name.includes("8"));
        const humaniteLevels = fetchedLevels.filter(l => l.type === 'OPTIONNEL' && !l.name.includes("7") && !l.name.includes("8"));

        baseLevels.forEach(lvl => {
          generatedClasses.push({
            uid: `base-${lvl.id}`,
            levelId: Number(lvl.id),
            sectionId: null,
            optionId: null,
            label: lvl.name 
          });
        });

        const combinationsPromises = humaniteLevels.map(async (lvl) => {
          let lvlClasses = [];
          try {
            const secRes = await courseAcademicConfigService.getSectionsByLevel(lvl.id);
            const sections = secRes.data || [];
            const sectionPromises = sections.map(async (sec) => {
              try {
                const optRes = await courseAcademicConfigService.getOptionsBySection(sec.id);
                const options = optRes.data || [];
                options.forEach(opt => {
                  lvlClasses.push({
                    uid: `hum-${lvl.id}-${sec.id}-${opt.id}`,
                    levelId: Number(lvl.id),
                    sectionId: Number(sec.id),
                    optionId: Number(opt.id),
                    label: `${lvl.name} ${sec.sectionName} ${opt.optionName}` 
                  });
                });
              } catch (e) { console.warn("Erreur options", sec.id); }
            });
            await Promise.all(sectionPromises);
          } catch (e) { console.warn("Erreur sections", lvl.id); }
          return lvlClasses;
        });

        const humaniteCombinations = await Promise.all(combinationsPromises);
        humaniteCombinations.forEach(comb => { generatedClasses = [...generatedClasses, ...comb]; });

        const sortedClasses = sortClassesLogic(generatedClasses);
        setAvailableClasses(sortedClasses);
        if (sortedClasses.length > 0) setActiveClass(sortedClasses[0]);
      } catch (e) {
        console.error("Erreur initialisation", e);
      } finally {
        setIsBuildingClasses(false);
      }
    };
    init();
  }, []);

  const filteredClasses = useMemo(() => {
    return availableClasses.filter(cls => 
      cls.label.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [availableClasses, searchTerm]);

  useEffect(() => {
    if (activeClass && activeYear) {
      loadEntireHierarchy();
    }
  }, [activeClass, activeYear]);

  const handleClassSelection = (cls, e) => {
    setActiveClass(cls);
    if (e && e.currentTarget) {
      e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  };

  const loadEntireHierarchy = async () => {
    if (!activeClass || !activeYear) return;
    setIsLoading(true);
    try {
      const [domainsRes, subDomainsRes, subjectsRes, assignmentsRes] = await Promise.all([
        courseAcademicConfigService.getDomainsByClass(activeClass.levelId, activeClass.sectionId, activeClass.optionId, activeYear.id),
        courseAcademicConfigService.getSubDomainsByClass(activeClass.levelId, activeClass.sectionId, activeClass.optionId, activeYear.id),
        courseAcademicConfigService.getSubjectsByClass(activeClass.levelId, activeClass.sectionId, activeClass.optionId, activeYear.id),
        courseAcademicConfigService.getCourseConfigurationFilter(activeClass.levelId, activeClass.sectionId, activeClass.optionId, activeYear.id)
      ]);

      const domains = domainsRes.data || [];
      const subDomains = subDomainsRes.data || [];
      const subjects = subjectsRes.data || [];
      const assignments = assignmentsRes.data || [];

      const tree = domains.map(d => {
        let dNode = { ...d, subDomains: [] };
        let sds = subDomains.filter(sd => Number(sd.domainId) === Number(d.id));
        sds.forEach(sd => {
          let sdNode = { ...sd, subjects: [], totals: { p1: 0, p2: 0, ex1: 0, s1: 0, p3: 0, p4: 0, ex2: 0, s2: 0, totalGen: 0 } };
          let subs = subjects.filter(s => Number(s.subDomainId) === Number(sd.id));
          subs.forEach(s => {
            let assign = assignments.find(a => Number(a.subject?.id || a.subjectId) === Number(s.id));
            let sNode = { ...s, assignment: assign || null };
            sdNode.subjects.push(sNode);
            if (assign) {
              sdNode.totals.p1 += Number(assign.maxP1 || 0); sdNode.totals.p2 += Number(assign.maxP2 || 0);
              sdNode.totals.ex1 += Number(assign.maxExam1 || 0); sdNode.totals.s1 += Number(assign.maxS1 || 0);
              sdNode.totals.p3 += Number(assign.maxP3 || 0); sdNode.totals.p4 += Number(assign.maxP4 || 0);
              sdNode.totals.ex2 += Number(assign.maxExam2 || 0); sdNode.totals.s2 += Number(assign.maxS2 || 0);
              sdNode.totals.totalGen += Number(assign.maxTotal || 0);
            }
          });
          dNode.subDomains.push(sdNode);
        });
        return dNode;
      });
      setHierarchyTree(tree);
    } catch (e) { console.error("Erreur structure", e); } finally { setIsLoading(false); }
  };

  const handleImportConfig = async () => {
    if (!activeClass || !activeYear || !sourceYearForImport) return;
    const sourceYearObj = allYears.find(y => y.id === Number(sourceYearForImport));
    if (!window.confirm(`Importer la configuration de l'année ${sourceYearObj?.name} pour ${activeClass.label} ?`)) return;
    setIsImporting(true);
    try {
      await courseAcademicConfigService.importPreviousYearConfig({
        sourceYearId: Number(sourceYearForImport),
        targetYearId: activeYear.id,
        levelId: activeClass.levelId,
        sectionId: activeClass.sectionId,
        optionId: activeClass.optionId
      });
      alert("Configuration importée avec succès !");
      loadEntireHierarchy();
    } catch (e) {
      alert("Erreur : " + (e.response?.data?.message || e.message));
    } finally { setIsImporting(false); }
  };

  const handleDelete = async (type, id) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cet élément ?")) return;
    try {
      if (type === 'DOMAIN') await courseAcademicConfigService.deleteDomain(id);
      if (type === 'SUBDOMAIN') await courseAcademicConfigService.deleteSubDomain(id);
      if (type === 'COURSE') await courseAcademicConfigService.deleteSubject(id);
      if (type === 'MAXIMA') await courseAcademicConfigService.deleteCourseAssignment(id);
      loadEntireHierarchy();
    } catch (e) { alert("Erreur lors de la suppression."); }
  };

  const submitModal = async (e) => {
    e.preventDefault();
    const { type, data } = modal;
    const ctx = {
      levelId: activeClass.levelId ? Number(activeClass.levelId) : null,
      sectionId: activeClass.sectionId ? Number(activeClass.sectionId) : null,
      optionId: activeClass.optionId ? Number(activeClass.optionId) : null,
      academicYearId: activeYear?.id ? Number(activeYear.id) : null
    };

    try {
      // Intégration de requiredSpecialityId pour la création et mise à jour des domaines
      if (type === 'AJOUTER_DOMAINE') {
        await courseAcademicConfigService.createDomain({ 
          name: data.name, 
          requiredSpecialityId: data.requiredSpecialityId ? Number(data.requiredSpecialityId) : null,
          ...ctx 
        });
      }
      else if (type === 'MODIFIER_DOMAINE') {
        await courseAcademicConfigService.updateDomain(data.id, { 
          name: data.name, 
          requiredSpecialityId: data.requiredSpecialityId ? Number(data.requiredSpecialityId) : null,
          ...ctx 
        });
      }
      else if (type === 'AJOUTER_SOUS_DOMAINE') await courseAcademicConfigService.createSubDomain({ name: data.name, domainId: Number(data.domainId), ...ctx });
      else if (type === 'MODIFIER_SOUS_DOMAINE') await courseAcademicConfigService.updateSubDomain(data.id, { name: data.name, domainId: Number(data.domainId), ...ctx });
      else if (type === 'AJOUTER_COURS') {
          await courseAcademicConfigService.createSubject({ 
            name: data.name, 
            subDomainId: data.subDomainId ? Number(data.subDomainId) : null, 
            domainId: data.domainId ? Number(data.domainId) : null,
            ...ctx 
          });
      }
      else if (type === 'MODIFIER_COURS') await courseAcademicConfigService.updateSubject(data.id, { name: data.name, subDomainId: data.subDomainId ? Number(data.subDomainId) : null, ...ctx });
      else if (type === 'CONFIGURER_MAXIMA') {
        const p = { subjectId: Number(data.subjectId), ...ctx, maxP1: Number(data.maxP1), maxP2: Number(data.maxP2), maxExam1: Number(data.maxExam1), maxP3: Number(data.maxP3), maxP4: Number(data.maxP4), maxExam2: Number(data.maxExam2) };
        if (data.assignmentId) await courseAcademicConfigService.updateCourseAssignment(data.assignmentId, p);
        else await courseAcademicConfigService.assignCourse(p);
      }
      setModal({ isOpen: false, type: '', data: null });
      loadEntireHierarchy();
    } catch (e) { alert("Erreur : " + (e.response?.data?.message || e.message)); }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <style>{`
        @media print {
          @page { size: A4 landscape; margin: 10mm; }
          body * { visibility: hidden; }
          #printable-area, #printable-area * { visibility: visible; }
          #printable-area { 
            position: absolute; 
            left: 0; 
            top: 0; 
            width: 100%; 
            background: white !important;
          }
          .no-print { display: none !important; }
        }
      `}</style>

      <div className="bg-white p-4 sm:p-6 rounded-[2rem] sm:rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col gap-6">
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
            <div className="w-full xl:w-auto">
              <h2 className="text-lg sm:text-xl font-black text-slate-800 flex items-center gap-2">
                <LayoutGrid className="text-blue-600 shrink-0" size={20}/> Structure Pédagogique
              </h2>
              <p className="text-xs font-semibold text-slate-400 mt-1">Année Scolaire Active : <span className="text-blue-600">{activeYear?.name || "..."}</span></p>
            </div>

            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 w-full xl:w-auto">
              <div className="flex flex-col gap-2">
                <div className="flex items-center bg-slate-50 rounded-2xl p-1 border border-slate-100">
                  <div className="flex items-center gap-2 px-3 text-slate-400">
                    <History size={14} />
                    <span className="text-[10px] font-black uppercase hidden sm:inline">Source:</span>
                  </div>
                  <select 
                    value={sourceYearForImport}
                    onChange={(e) => setSourceYearForImport(e.target.value)}
                    className="bg-transparent border-none text-xs font-bold text-slate-700 focus:ring-0 outline-none pr-8 py-2 cursor-pointer"
                  >
                    <option value="">Sélectionner l'année...</option>
                    {allYears.filter(y => y.id !== activeYear?.id).map(y => (
                      <option key={y.id} value={y.id}>{y.name}</option>
                    ))}
                  </select>
                  <button 
                    onClick={handleImportConfig}
                    disabled={isImporting || !activeClass || !sourceYearForImport}
                    className="px-4 py-2 bg-amber-500 text-white rounded-xl font-black text-[10px] uppercase hover:bg-slate-900 transition-all flex items-center gap-2 disabled:opacity-30 shadow-sm"
                  >
                    {isImporting ? <RefreshCcw size={14} className="animate-spin"/> : <Copy size={14}/>}
                    Réutiliser
                  </button>
                </div>
                <button 
                  onClick={() => setShowPrintPreview(true)}
                  disabled={hierarchyTree.length === 0}
                  className="w-full px-4 py-2 bg-white border-2 border-blue-100 text-blue-600 rounded-xl font-black text-[10px] uppercase hover:bg-blue-50 transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                >
                  <Printer size={14}/> Imprimer le Rapport
                </button>
              </div>

              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Rechercher une classe..." 
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-xs font-bold focus:ring-2 focus:ring-blue-100 outline-none" />
              </div>
              
              <button onClick={() => setModal({ isOpen: true, type: 'AJOUTER_DOMAINE', data: { name: '', requiredSpecialityId: '' }})} 
                    className="shrink-0 px-6 py-3 bg-slate-900 text-white rounded-2xl font-bold text-xs uppercase hover:bg-blue-600 transition-all flex items-center justify-center gap-2 shadow-lg">
                <Plus size={16}/>Domaine
              </button>
            </div>
        </div>

        <div className="w-full overflow-hidden">
            <div ref={scrollContainerRef} className="flex gap-2 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-slate-200 scroll-smooth w-full">
              {isBuildingClasses ? (
                <div className="text-[10px] font-black text-blue-500 animate-pulse uppercase px-2">Génération des parcours...</div>
              ) : filteredClasses.length > 0 ? (
                filteredClasses.map((cls) => (
                  <button key={cls.uid} onClick={(e) => handleClassSelection(cls, e)}
                    className={`shrink-0 px-4 sm:px-5 py-2.5 rounded-xl font-black text-[10px] sm:text-xs uppercase transition-all border-2 ${
                      activeClass?.uid === cls.uid ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-100' : 'bg-slate-50 text-slate-500 border-slate-50 hover:border-blue-200'
                    }`}>
                    {cls.label}
                  </button>
                ))
              ) : <div className="text-xs font-bold text-slate-400 px-2">Aucun résultat</div>}
            </div>
        </div>
      </div>

      <CourseGridDisplay 
        hierarchyTree={hierarchyTree} isLoading={isLoading}
        onAddDomain={() => setModal({ isOpen: true, type: 'AJOUTER_DOMAINE', data: { name: '', requiredSpecialityId: '' }})}
        onEditDomain={(d) => setModal({ isOpen: true, type: 'MODIFIER_DOMAINE', data: { ...d, requiredSpecialityId: d.requiredSpecialityId || '' }})}
        onDeleteDomain={(id) => handleDelete('DOMAIN', id)}
        onAddSubDomain={(d) => setModal({ isOpen: true, type: 'AJOUTER_SOUS_DOMAINE', data: { name: '', domainId: d.id }})}
        onEditSubDomain={(sd) => setModal({ isOpen: true, type: 'MODIFIER_SOUS_DOMAINE', data: { ...sd }})}
        onDeleteSubDomain={(id) => handleDelete('SUBDOMAIN', id)}
        onAddCourse={(d, sd) => setModal({ 
            isOpen: true, 
            type: 'AJOUTER_COURS', 
            data: { name: '', subDomainId: sd ? sd.id : null, domainId: d.id } 
        })}
        onEditCourse={(c, d, sd) => setModal({ isOpen: true, type: 'MODIFIER_COURS', data: { ...c, subDomainId: sd ? sd.id : null } })}
        onDeleteCourse={(id) => handleDelete('COURSE', id)}
        onConfigureMaxima={(c) => setModal({ isOpen: true, type: 'CONFIGURER_MAXIMA', data: { 
            subjectId: c.id, courseName: c.name, assignmentId: c.assignment?.id,
            maxP1: c.assignment?.maxP1 || 0, maxP2: c.assignment?.maxP2 || 0, maxExam1: c.assignment?.maxExam1 || 0,
            maxP3: c.assignment?.maxP3 || 0, maxP4: c.assignment?.maxP4 || 0, maxExam2: c.assignment?.maxExam2 || 0 
        }})}
      />

      {showPrintPreview && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-[1000] flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-6xl h-[95vh] shadow-2xl flex flex-col overflow-hidden">
            <div className="px-8 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="text-sm font-black uppercase text-slate-800">Prévisualisation du Rapport</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Classe : {activeClass?.label}</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setShowPrintPreview(false)} className="px-5 py-2.5 rounded-xl font-bold text-xs text-slate-500 hover:bg-slate-100 transition-all">
                  Annuler
                </button>
                <button onClick={handlePrint} className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-black text-xs uppercase shadow-lg shadow-blue-200 flex items-center gap-2 hover:bg-blue-700 transition-all">
                  <Printer size={16}/> Lancer l'impression
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-12 bg-slate-200/30">
               <div id="printable-area" ref={printRef} className="bg-white shadow-2xl mx-auto p-[15mm] min-h-screen" style={{ width: '297mm' }}>
                  <div className="flex justify-between items-start border-b-2 border-slate-900 pb-6 mb-8">
                    <div className="w-1/3">
                      {institutionInfo?.logoUrl && <img src={institutionInfo.logoUrl} alt="Logo" className="h-20 object-contain mb-2" />}
                      <h1 className="text-lg font-black uppercase leading-tight">{institutionInfo?.name || "Complexe Scolaire Musafa"}</h1>
                      <p className="text-[10px] font-bold text-slate-600 uppercase italic">{institutionInfo?.address || "Goma, Nord-Kivu, RD Congo"}</p>
                      <p className="text-[10px] font-bold text-slate-600">{institutionInfo?.phone || "+243 000 000 000"}</p>
                    </div>
                    <div className="text-right">
                      <h2 className="text-2xl font-black uppercase text-blue-600 mb-1">Grille des Maxima</h2>
                      <div className="bg-slate-900 text-white px-4 py-1 inline-block text-[10px] font-black uppercase mb-4 tracking-widest">
                        Année Scolaire : {activeYear?.name}
                      </div>
                      <p className="text-xs font-black uppercase">Classe : <span className="text-blue-600">{activeClass?.label}</span></p>
                      <p className="text-[9px] font-bold text-slate-400 mt-1 italic">Imprimé le {new Date().toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="print-grid-container">
                    <CourseGridDisplay hierarchyTree={hierarchyTree} isLoading={false} isPrinting={true} />
                  </div>

                  <div className="mt-12 grid grid-cols-2 gap-20">
                    <div className="text-center">
                      <p className="text-[10px] font-black uppercase mb-20 underline">Noms, Signature et Sceau Proviseur</p>
                     <p className="text-sm font-black uppercase">{institutionInfo?.academicProviseur}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] font-black capitalize mb-24">{institutionInfo?.city}</p>
                     
                     
                    </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      )}

      {modal.isOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl p-5 sm:p-8 max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-[11px] font-black uppercase text-slate-400 tracking-widest">{modal.type.replace(/_/g, ' ')}</h3>
                    <button onClick={() => setModal({ isOpen: false, type: '', data: null })} className="p-2 hover:bg-slate-100 rounded-full"><X size={20}/></button>
                </div>
                <div className="overflow-y-auto pr-2 pb-2 flex-1">
                    <form id="configForm" onSubmit={submitModal} className="space-y-6">
                        {(modal.type === 'AJOUTER_DOMAINE' || modal.type === 'MODIFIER_DOMAINE') ? (
                            <div className="space-y-6">
                                <div>
                                    <label className="text-[10px] font-black text-slate-500 uppercase block mb-3">Libellé du Domaine</label>
                                    <input type="text" required autoFocus value={modal.data?.name || ''} onChange={e => setModal({ ...modal, data: { ...modal.data, name: e.target.value }})}
                                        className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-sm font-bold focus:ring-2 focus:ring-blue-100 outline-none" />
                                </div>
                                
                                {/* NOUVEAU : Champ Spécialité Requise */}
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-500 uppercase flex items-center gap-2">
                                        <GraduationCap size={14} className="text-blue-500"/> Spécialité requise pour l'enseignant
                                    </label>
                                    <select 
                                        value={modal.data?.requiredSpecialityId || ''} 
                                        onChange={e => setModal({ ...modal, data: { ...modal.data, requiredSpecialityId: e.target.value }})}
                                        className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-sm font-bold focus:ring-2 focus:ring-blue-100 outline-none cursor-pointer"
                                    >
                                        <option value="">-- Aucune spécialité spécifique --</option>
                                        {specialities.map(spec => (
                                            <option key={spec.id} value={spec.id}>{spec.name}</option>
                                        ))}
                                    </select>
                                    <p className="text-[9px] text-slate-400 italic">
                                        Note: Cette spécialité sera utilisée pour filtrer les enseignants lors de l'affectation.
                                    </p>
                                </div>
                            </div>
                        ) : modal.type.includes('SOUS_DOMAINE') || modal.type.includes('COURS') ? (
                          <div>
                              <label className="text-[10px] font-black text-slate-500 uppercase block mb-3">Libellé</label>
                              <input type="text" required autoFocus value={modal.data?.name || ''} onChange={e => setModal({ ...modal, data: { ...modal.data, name: e.target.value }})}
                                  className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 text-sm font-bold focus:ring-2 focus:ring-blue-100 outline-none" />
                          </div>
                        ) : (
                            <div className="space-y-6">
                                <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
                                    <span className="text-[10px] font-black text-blue-400 block uppercase mb-1">Cours</span>
                                    <span className="text-sm font-black text-blue-900">{modal.data.courseName}</span>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase">P1</label>
                                        <input type="number" value={modal.data.maxP1} onChange={e => setModal({...modal, data: {...modal.data, maxP1: e.target.value, maxExam1: Number(e.target.value) + Number(modal.data.maxP2)}})} className="w-full bg-slate-50 border-none rounded-2xl p-4 font-black" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase">P2</label>
                                        <input type="number" value={modal.data.maxP2} onChange={e => setModal({...modal, data: {...modal.data, maxP2: e.target.value, maxExam1: Number(modal.data.maxP1) + Number(e.target.value)}})} className="w-full bg-slate-50 border-none rounded-2xl p-4 font-black" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase">Examen 1 (Calculé)</label>
                                    <input type="number" readOnly value={modal.data.maxExam1} className="w-full bg-slate-800 text-slate-400 rounded-2xl p-5 font-black outline-none" />
                                </div>
                                <div className="grid grid-cols-2 gap-4 border-t pt-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase">P3</label>
                                        <input type="number" value={modal.data.maxP3} onChange={e => setModal({...modal, data: {...modal.data, maxP3: e.target.value, maxExam2: Number(e.target.value) + Number(modal.data.maxP4)}})} className="w-full bg-slate-50 border-none rounded-2xl p-4 font-black" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase">P4</label>
                                        <input type="number" value={modal.data.maxP4} onChange={e => setModal({...modal, data: {...modal.data, maxP4: e.target.value, maxExam2: Number(modal.data.maxP3) + Number(e.target.value)}})} className="w-full bg-slate-50 border-none rounded-2xl p-4 font-black" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase">Examen 2 (Calculé)</label>
                                    <input type="number" readOnly value={modal.data.maxExam2} className="w-full bg-slate-800 text-slate-400 rounded-2xl p-5 font-black outline-none" />
                                </div>
                            </div>
                        )}
                    </form>
                </div>
                <div className="pt-6">
                    <button type="submit" form="configForm" className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl hover:bg-slate-900 transition-all flex items-center justify-center gap-2">
                        <Save size={18}/> Enregistrer
                    </button>
                </div>
            </div>
          </div>
      )}
    </div>
  );
};  

export default CourseClassAssignmentBuilder;