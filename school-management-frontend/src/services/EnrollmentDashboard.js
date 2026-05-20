import React, { useState, useEffect } from 'react';
import { enrollmentService } from '../../services/enrollmentService';

const EnrollmentDashboard = ({ students, onBack }) => {
    const [step, setStep] = useState(1); // 1: Stats & List, 2: Selection Student, 3: Finalize
    const [activeYear, setActiveYear] = useState(null);
    const [classrooms, setClassrooms] = useState([]);
    const [selectedClass, setSelectedClass] = useState(null);
    
    // Form Data conforme à l'entité Java
    const [enrollmentData, setEnrollmentData] = useState({
        studentId: null,
        classroomId: null,
        enrollmentType: 'INSCRIPTION',
        documentsPresented: [],
        enrollmentDate: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        loadInitialData();
    }, []);

    const loadInitialData = async () => {
        const [year, classes] = await Promise.all([
            enrollmentService.getActiveYear(),
            enrollmentService.getClassrooms()
        ]);
        setActiveYear(year);
        setClassrooms(classes);
    };

    const handleStudentSelect = (student) => {
        // Logique intelligente : si l'élève a déjà une inscription passée -> REINSCRIPTION
        const isOldStudent = student.matricule && student.matricule !== '---';
        setEnrollmentData({
            ...enrollmentData,
            studentId: student.id,
            enrollmentType: isOldStudent ? 'REINSCRIPTION' : 'INSCRIPTION'
        });
        setStep(3);
    };

    const toggleDocument = (doc) => {
        const docs = enrollmentData.documentsPresented.includes(doc)
            ? enrollmentData.documentsPresented.filter(d => d !== doc)
            : [...enrollmentData.documentsPresented, doc];
        setEnrollmentData({...enrollmentData, documentsPresented: docs});
    };

    return (
        <div className="min-h-screen bg-slate-50 animate-in fade-in duration-500">
            {/* Header de Luxe */}
            <div className="bg-blue-900 text-white p-8 rounded-b-[3rem] shadow-2xl mb-8">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div>
                        <h1 className="text-4xl font-black italic tracking-tighter">MUSAFA <span className="text-blue-400">ENROLLMENT</span></h1>
                        <p className="text-blue-200 font-bold uppercase text-[10px] tracking-[0.3em]">
                            Session Académique : {activeYear?.label || 'Chargement...'}
                        </p>
                    </div>
                    <button onClick={onBack} className="bg-white/10 hover:bg-white/20 p-4 rounded-2xl backdrop-blur-md transition-all font-bold">
                        ✕ FERMER L'INTERFACE
                    </button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6">
                {step === 1 && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Statistiques par classe */}
                        <div className="lg:col-span-1 space-y-4">
                            <h2 className="text-xl font-black text-slate-800 mb-6">ÉTAT DES EFFECTIFS</h2>
                            {classrooms.map(c => (
                                <div key={c.id} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex justify-between items-center hover:shadow-md transition-all cursor-pointer">
                                    <div>
                                        <p className="font-black text-blue-900">{c.name}</p>
                                        <p className="text-[10px] text-slate-400 uppercase font-bold">{c.section}</p>
                                    </div>
                                    <span className="bg-blue-50 text-blue-600 px-4 py-2 rounded-xl font-black">12/40</span>
                                </div>
                            ))}
                        </div>

                        {/* Action Principale */}
                        <div className="lg:col-span-2">
                            <div className="bg-gradient-to-br from-blue-600 to-indigo-800 rounded-[3rem] p-12 text-white shadow-xl relative overflow-hidden group">
                                <div className="relative z-10">
                                    <h2 className="text-5xl font-black mb-4">Nouvelle Inscription</h2>
                                    <p className="text-blue-100 mb-8 max-w-md font-medium">Lancez le processus d'affectation d'un élève à une classe pour l'année {activeYear?.label}.</p>
                                    <button onClick={() => setStep(2)} className="bg-white text-blue-900 px-10 py-5 rounded-2xl font-black uppercase tracking-widest hover:scale-105 transition-transform shadow-2xl">
                                        Démarrer le Workflow →
                                    </button>
                                </div>
                                <div className="absolute right-0 bottom-0 opacity-10 text-[15rem] font-black translate-y-20 translate-x-10 group-hover:-translate-y-5 transition-all duration-700">🎓</div>
                            </div>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="animate-in slide-in-from-bottom-10 duration-500">
                        <button onClick={() => setStep(1)} className="mb-6 font-black text-blue-600 uppercase text-xs">← Retour</button>
                        <h2 className="text-3xl font-black text-slate-900 mb-8 text-center uppercase">Sélectionner l'Apprenant</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {students.map(s => (
                                <div key={s.id} onClick={() => handleStudentSelect(s)} className="bg-white p-6 rounded-[2.5rem] border-2 border-transparent hover:border-blue-500 cursor-pointer transition-all shadow-sm hover:shadow-xl flex items-center gap-4">
                                    <div className="h-14 w-14 rounded-2xl bg-slate-100 overflow-hidden">
                                        {s.photoUrl ? <img src={s.photoUrl} alt="" className="h-full w-full object-cover"/> : <div className="h-full w-full flex items-center justify-center">👤</div>}
                                    </div>
                                    <div>
                                        <p className="font-black text-slate-900 uppercase text-sm leading-tight">{s.lastName} {s.firstName}</p>
                                        <p className="text-[10px] font-bold text-blue-500">{s.matricule || 'NOUVEL ÉLÈVE'}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="max-w-4xl mx-auto bg-white rounded-[3.5rem] shadow-2xl overflow-hidden border border-slate-100">
                        <div className="grid grid-cols-1 md:grid-cols-2">
                            {/* Recap Gauche */}
                            <div className="bg-slate-900 p-12 text-white">
                                <div className={`inline-block px-4 py-1 rounded-full text-[10px] font-black mb-6 ${enrollmentData.enrollmentType === 'REINSCRIPTION' ? 'bg-amber-400 text-black' : 'bg-emerald-500 text-white'}`}>
                                    {enrollmentData.enrollmentType} AUTOMATIQUE
                                </div>
                                <h3 className="text-4xl font-black uppercase mb-2">Finalisation</h3>
                                <p className="text-slate-400 text-sm mb-12 italic">Veuillez vérifier les documents et assigner la classe de destination.</p>
                                
                                <div className="space-y-6">
                                    <h4 className="text-[10px] font-black tracking-widest text-blue-400 uppercase">Documents requis</h4>
                                    {['Bulletin Année Précédente', 'Attestation de Naissance', 'Photos Passeport (2)', 'Fiche Médicale'].map(doc => (
                                        <label key={doc} className="flex items-center gap-4 cursor-pointer group">
                                            <input 
                                                type="checkbox" 
                                                className="w-6 h-6 rounded-lg bg-slate-800 border-none checked:bg-blue-500 transition-all"
                                                onChange={() => toggleDocument(doc)}
                                            />
                                            <span className="text-sm font-bold group-hover:text-blue-400 transition-colors">{doc}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Formulaire Droite */}
                            <div className="p-12">
                                <div className="mb-10">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4">Classe de destination</label>
                                    <select 
                                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-bold text-slate-800 outline-none focus:border-blue-600 transition-all appearance-none"
                                        onChange={(e) => setEnrollmentData({...enrollmentData, classroomId: e.target.value})}
                                    >
                                        <option>Choisir une salle...</option>
                                        {classrooms.map(c => <option key={c.id} value={c.id}>{c.name} - {c.section}</option>)}
                                    </select>
                                </div>

                                <div className="mb-10">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4">Date d'inscription</label>
                                    <input 
                                        type="date" 
                                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl p-4 font-bold text-slate-800"
                                        value={enrollmentData.enrollmentDate}
                                        onChange={(e) => setEnrollmentData({...enrollmentData, enrollmentDate: e.target.value})}
                                    />
                                </div>

                                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 rounded-3xl font-black uppercase tracking-[0.2em] shadow-xl hover:shadow-blue-200 transition-all transform hover:-translate-y-1">
                                    Confirmer l'Inscription
                                </button>
                                <button onClick={() => setStep(2)} className="w-full mt-4 text-slate-400 font-bold text-xs uppercase hover:text-red-500 transition-colors">
                                    Annuler et changer d'élève
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EnrollmentDashboard;