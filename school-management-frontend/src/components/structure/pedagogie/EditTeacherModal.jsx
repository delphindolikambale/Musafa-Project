import React, { useState, useEffect, useMemo } from 'react';
import { 
    X, Save, User, FileText, Upload, Shield, 
    Phone, MapPin, Calendar, Briefcase, GraduationCap,
    Plus, Trash2, Loader2, Mail, Fingerprint, BookOpen, ToggleLeft, ToggleRight, Check, AlertCircle
} from 'lucide-react';
import TeacherService, { getFileUrl, PEDAGOGICAL_DAYS_OPTIONS } from '../../../services/pedagogieService/TeacherService';
import courseAcademicConfigService from '../../../services/pedagogieService/courseAcademicConfigService';

const EditTeacherModal = ({ isOpen, onClose, teacher, onRefresh }) => {
    const [formData, setFormData] = useState({
        id: null,
        schoolRegistrationNumber: '',
        nationalRegistrationNumber: '',
        lastName: '', 
        middleName: '', 
        firstName: '', 
        gender: 'M',
        maritalStatus: 'Célibataire', 
        dateOfBirth: '', 
        placeOfBirth: '',
        phoneNumber: '', 
        email: '', 
        residentialAddress: '',
        domainSpecialityId: '',
        active: true,
        pedagogicalDays: [],
        academicTitles: [], 
        trainings: [],
        profilePicturePath: '',
        cvPath: ''
    });

    const [photoFile, setPhotoFile] = useState(null);
    const [cvFile, setCvFile] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [specialities, setSpecialities] = useState([]);
    const [limitWarning, setLimitWarning] = useState(false);

    useEffect(() => {
        if (isOpen) {
            const fetchSpecialities = async () => {
                try {
                    const response = await courseAcademicConfigService.getAllSpecialities();
                    setSpecialities(response.data || []);
                } catch (error) {
                    console.error("Erreur lors de la récupération des spécialités:", error);
                }
            };
            fetchSpecialities();
        }
    }, [isOpen]);

    useEffect(() => {
        if (teacher) {
            setFormData({ 
                ...teacher,
                dateOfBirth: teacher.dateOfBirth ? new Date(teacher.dateOfBirth).toISOString().split('T')[0] : '',
                domainSpecialityId: teacher.domainSpecialityId || '',
                active: teacher.active !== undefined ? teacher.active : true,
                pedagogicalDays: teacher.pedagogicalDays || [],
                academicTitles: teacher.academicTitles?.map(t => ({ ...t, documentFile: null })) || [],
                trainings: teacher.trainings?.map(t => ({ ...t, documentFile: null })) || []
            });
            setPhotoFile(null);
            setCvFile(null);
            setLimitWarning(false);
        }
    }, [teacher]);

    const profilePreview = useMemo(() => {
        if (photoFile) return URL.createObjectURL(photoFile);
        if (formData.profilePicturePath) return getFileUrl(formData.profilePicturePath);
        return null;
    }, [photoFile, formData.profilePicturePath]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const toggleStatus = () => {
        setFormData(prev => ({ ...prev, active: !prev.active }));
    };

    // ✅ RÈGLE DE SÉCURITÉ FRONTEND : Maximum 2 jours
    const handleTogglePedagogicalDay = (dayKey) => {
        setFormData(prev => {
            const currentDays = prev.pedagogicalDays || [];
            const isAlreadySelected = currentDays.includes(dayKey);

            if (!isAlreadySelected && currentDays.length >= 2) {
                setLimitWarning(true);
                setTimeout(() => setLimitWarning(false), 4000);
                return prev;
            }

            setLimitWarning(false);
            const updatedDays = isAlreadySelected
                ? currentDays.filter(d => d !== dayKey)
                : [...currentDays, dayKey];

            return { ...prev, pedagogicalDays: updatedDays };
        });
    };

    const handleAddTitle = () => {
        setFormData(prev => ({ 
            ...prev, 
            academicTitles: [...prev.academicTitles, { titleName: '', documentFile: null }] 
        }));
    };

    const handleTitleChange = (index, field, value) => {
        const newTitles = [...formData.academicTitles];
        newTitles[index][field] = value;
        setFormData(prev => ({ ...prev, academicTitles: newTitles }));
    };

    const handleAddTraining = () => {
        setFormData(prev => ({ 
            ...prev, 
            trainings: [...prev.trainings, { trainingName: '', documentFile: null }] 
        }));
    };

    const handleTrainingChange = (index, field, value) => {
        const newTrainings = [...formData.trainings];
        newTrainings[index][field] = value;
        setFormData(prev => ({ ...prev, trainings: newTrainings }));
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        
        if (formData.pedagogicalDays && formData.pedagogicalDays.length > 2) {
            alert("Sécurité : Vous ne pouvez pas attribuer plus de 2 journées pédagogiques.");
            return;
        }

        setIsSubmitting(true);

        try {
            const data = new FormData();
            
            const teacherDTO = { ...formData };
            teacherDTO.domainSpecialityId = formData.domainSpecialityId ? Number(formData.domainSpecialityId) : null;
            
            teacherDTO.academicTitles = formData.academicTitles.map(({ documentFile, ...rest }) => rest);
            teacherDTO.trainings = formData.trainings.map(({ documentFile, ...rest }) => rest);

            data.append("teacher", new Blob([JSON.stringify(teacherDTO)], { type: "application/json" }));
            
            if (photoFile) data.append("photo", photoFile); 
            if (cvFile) data.append("cv", cvFile);

            formData.academicTitles.forEach((title) => {
                if (title.documentFile) data.append("titleDocs", title.documentFile);
            });

            formData.trainings.forEach((training) => {
                if (training.documentFile) data.append("trainingDocs", training.documentFile);
            });
            
            await TeacherService.updateTeacher(teacher.id, data);
            onRefresh();
            onClose();
        } catch (error) {
            console.error("Erreur lors de la mise à jour:", error);
            alert(error.response?.data?.message || "Une erreur est survenue lors de la sauvegarde.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen || !teacher) return null;

    return (
        /* z-[9999] garantit que la modale passe devant la sidebar */
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md overflow-hidden animate-in fade-in duration-200">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-300">
                
                {/* HEADER - BLEU DE NUIT & ACCENTS BLEU ROI */}
                <div className="flex items-center justify-between p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800 bg-slate-900 text-white shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-slate-800 border-2 border-blue-500/30 flex items-center justify-center shadow-lg overflow-hidden shrink-0 group relative">
                            {profilePreview ? (
                                <img src={profilePreview} alt="Profil" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                            ) : (
                                <User size={28} className="text-blue-400" />
                            )}
                        </div>
                        <div>
                            <h2 className="text-lg sm:text-2xl font-black uppercase tracking-tight leading-none text-white">
                                Modifier le Profil Enseignant
                            </h2>
                            <div className="flex flex-wrap items-center gap-2 mt-2">
                                <span className="bg-blue-600 text-white px-2 py-0.5 rounded-md text-[10px] font-bold tracking-widest uppercase">
                                    ID: {formData.id}
                                </span>
                                <span className="text-slate-300 font-bold text-xs sm:text-sm uppercase">
                                    {formData.lastName} {formData.middleName} {formData.firstName}
                                </span>
                            </div>
                        </div>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="p-2.5 bg-slate-800/80 hover:bg-red-500/20 text-slate-300 hover:text-red-400 rounded-xl transition-all border border-slate-700"
                    >
                        <X size={22} />
                    </button>
                </div>

                {/* CORPS DE LA MODALE - SCROLLABLE ET ADAPTATION THEME */}
                <form id="edit-teacher-form" onSubmit={handleSubmit} className="overflow-y-auto p-5 sm:p-8 space-y-8 custom-scrollbar bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-100">
                    
                    {/* SECTION 1: ADMINISTRATIF */}
                    <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-3">
                            <h3 className="text-xs font-black uppercase text-blue-600 dark:text-blue-400 tracking-wider flex items-center gap-2">
                                <Shield size={16} /> Informations Administratives
                            </h3>
                            <div className="flex items-center gap-3 bg-white dark:bg-slate-800 px-4 py-2 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
                                <span className={`text-[10px] font-black uppercase tracking-widest ${formData.active ? 'text-emerald-500' : 'text-slate-400'}`}>
                                    {formData.active ? 'Compte Actif' : 'Compte Inactif'}
                                </span>
                                <button 
                                    type="button" 
                                    onClick={toggleStatus}
                                    className={`transition-colors duration-300 ${formData.active ? 'text-emerald-500' : 'text-slate-400'}`}
                                >
                                    {formData.active ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <InputField label="Matricule École" name="schoolRegistrationNumber" value={formData.schoolRegistrationNumber} onChange={handleChange} icon={<Fingerprint size={16}/>} />
                            <InputField label="Numéro National" name="nationalRegistrationNumber" value={formData.nationalRegistrationNumber} onChange={handleChange} icon={<Fingerprint size={16}/>} />
                            <SelectField label="État Civil" name="maritalStatus" value={formData.maritalStatus} onChange={handleChange} options={[{v:'Célibataire', l:'Célibataire'}, {v:'Marié(e)', l:'Marié(e)'}, {v:'Veuf/Veuve', l:'Veuf/Veuve'}, {v:'Divorcé(e)', l:'Divorcé(e)'}]} />
                            <SelectField 
                                label="Spécialité du Professeur" 
                                name="domainSpecialityId" 
                                value={formData.domainSpecialityId} 
                                onChange={handleChange} 
                                options={[{v: '', l: 'Sélectionner une spécialité...'}, ...specialities.map(s => ({ v: s.id, l: s.name }))]} 
                            />
                        </div>
                    </div>

                    {/* SECTION 2: JOURNÉES PÉDAGOGIQUES (SÉCURITÉ STRICTE DE 2 JOURS MAX) */}
                    <div className="space-y-4 bg-blue-50/50 dark:bg-blue-950/20 p-5 rounded-2xl border border-blue-200/60 dark:border-blue-900/40">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-blue-200/60 dark:border-blue-900/40 pb-3">
                            <h3 className="text-xs font-black uppercase text-blue-700 dark:text-blue-300 tracking-wider flex items-center gap-2">
                                <Calendar size={16} /> Journées Pédagogiques
                            </h3>
                            <div className="flex items-center gap-2">
                                <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider ${
                                    (formData.pedagogicalDays?.length || 0) === 2 
                                        ? 'bg-blue-600 text-white' 
                                        : 'bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200'
                                }`}>
                                    {formData.pedagogicalDays?.length || 0} / 2 autorisés
                                </span>
                            </div>
                        </div>

                        <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                            Sélectionnez au maximum <strong className="text-blue-600 dark:text-blue-400">2 jours par semaine</strong> réservés aux activités pédagogiques :
                        </p>

                        {limitWarning && (
                            <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 rounded-xl text-xs font-bold animate-in fade-in duration-200">
                                <AlertCircle size={16} className="shrink-0" />
                                <span>Sécurité : Un enseignant ne peut pas se voir attribuer plus de 2 journées pédagogiques.</span>
                            </div>
                        )}

                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 pt-1">
                            {PEDAGOGICAL_DAYS_OPTIONS.map((day) => {
                                const isSelected = formData.pedagogicalDays?.includes(day.value);
                                return (
                                    <button
                                        key={day.value}
                                        type="button"
                                        onClick={() => handleTogglePedagogicalDay(day.value)}
                                        className={`py-3 px-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-between border ${
                                            isSelected 
                                                ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20 scale-[1.02]' 
                                                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500'
                                        }`}
                                    >
                                        <span>{day.label}</span>
                                        {isSelected && <Check size={16} className="text-white shrink-0" />}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* SECTION 3: IDENTITÉ & NAISSANCE */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-black uppercase text-blue-600 dark:text-blue-400 tracking-wider flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
                            <User size={16} /> Identité & Naissance
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <InputField label="Nom" name="lastName" value={formData.lastName} onChange={handleChange} required />
                            <InputField label="Post-nom" name="middleName" value={formData.middleName} onChange={handleChange} />
                            <InputField label="Prénom" name="firstName" value={formData.firstName} onChange={handleChange} required />
                            <SelectField label="Genre" name="gender" value={formData.gender} onChange={handleChange} options={[{v:'M', l:'Masculin'}, {v:'F', l:'Féminin'}]} />
                            <InputField label="Date de Naissance" name="dateOfBirth" type="date" value={formData.dateOfBirth} onChange={handleChange} />
                            <InputField label="Lieu de Naissance" name="placeOfBirth" value={formData.placeOfBirth} onChange={handleChange} />
                        </div>
                    </div>

                    {/* SECTION 4: CONTACT & LOCALISATION */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-black uppercase text-blue-600 dark:text-blue-400 tracking-wider flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
                            <Phone size={16} /> Contact & Localisation
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <InputField label="Téléphone" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} icon={<Phone size={16}/>} />
                            <InputField label="Email Professionnel" name="email" type="email" value={formData.email} onChange={handleChange} icon={<Mail size={16}/>} />
                            <div className="md:col-span-3">
                                <InputField label="Adresse Résidentielle Complète" name="residentialAddress" value={formData.residentialAddress} onChange={handleChange} icon={<MapPin size={16}/>} />
                            </div>
                        </div>
                    </div>

                    {/* SECTION 5: MÉDIAS ET DOCUMENTS */}
                    <div className="space-y-4">
                        <h3 className="text-xs font-black uppercase text-blue-600 dark:text-blue-400 tracking-wider flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
                            <Upload size={16} /> Fichiers du Profil
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FilePicker 
                                label="Changer la Photo de Profil" 
                                accept="image/*" 
                                onChange={(file) => setPhotoFile(file)}
                                existingFile={formData.profilePicturePath}
                            />
                            <FilePicker 
                                label="Mettre à jour le CV (PDF)" 
                                accept=".pdf" 
                                onChange={(file) => setCvFile(file)}
                                existingFile={formData.cvPath}
                            />
                        </div>
                    </div>

                    {/* SECTION 6: TITRES ET FORMATIONS */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Titres Académiques */}
                        <div className="space-y-4 bg-white dark:bg-slate-800/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-700">
                            <SectionHeader title="Titres Académiques" icon={<GraduationCap size={18}/>} onAdd={handleAddTitle} />
                            <div className="space-y-3">
                                {formData.academicTitles.map((title, index) => (
                                    <DynamicItem 
                                        key={index}
                                        labelPlaceholder="Ex: Master en Pédagogie"
                                        value={title.titleName}
                                        onTextChange={(val) => handleTitleChange(index, 'titleName', val)}
                                        onFileChange={(file) => handleTitleChange(index, 'documentFile', file)}
                                        onRemove={() => setFormData(p => ({...p, academicTitles: p.academicTitles.filter((_,i) => i !== index)}))}
                                        existingFile={title.documentPath}
                                    />
                                ))}
                                {formData.academicTitles.length === 0 && (
                                    <p className="text-center py-4 text-xs text-slate-400 italic">Aucun titre académique renseigné.</p>
                                )}
                            </div>
                        </div>

                        {/* Formations */}
                        <div className="space-y-4 bg-white dark:bg-slate-800/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-700">
                            <SectionHeader title="Formations & Stages" icon={<Briefcase size={18}/>} onAdd={handleAddTraining} />
                            <div className="space-y-3">
                                {formData.trainings.map((training, index) => (
                                    <DynamicItem 
                                        key={index}
                                        labelPlaceholder="Ex: Séminaire Didactique 2025"
                                        value={training.trainingName}
                                        onTextChange={(val) => handleTrainingChange(index, 'trainingName', val)}
                                        onFileChange={(file) => handleTrainingChange(index, 'documentFile', file)}
                                        onRemove={() => setFormData(p => ({...p, trainings: p.trainings.filter((_,i) => i !== index)}))}
                                        existingFile={training.documentPath}
                                    />
                                ))}
                                {formData.trainings.length === 0 && (
                                    <p className="text-center py-4 text-xs text-slate-400 italic">Aucune formation renseignée.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </form>

                {/* FOOTER ACTIONS */}
                <div className="p-4 sm:p-6 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
                    <button 
                        type="submit" form="edit-teacher-form" disabled={isSubmitting}
                        className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-3 active:scale-[0.99]"
                    >
                        {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                        {isSubmitting ? "Mise à jour en cours..." : "Enregistrer les modifications"}
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- SOUS-COMPOSANTS ---

const InputField = ({ label, value, onChange, name, type = "text", required = false, icon }) => (
    <div className="space-y-1.5">
        <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
            {icon} {label}
        </label>
        <input 
            type={type} name={name} value={value || ''} onChange={onChange} required={required} 
            className="w-full p-3.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-xs text-slate-800 dark:text-slate-100 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
        />
    </div>
);

const SelectField = ({ label, value, onChange, name, options }) => (
    <div className="space-y-1.5">
        <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest block">{label}</label>
        <div className="relative">
            <select 
                name={name} value={value} onChange={onChange} 
                className="w-full p-3.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-xs text-slate-800 dark:text-slate-100 outline-none focus:border-blue-500 transition-all appearance-none cursor-pointer"
            >
                {options.map(o => <option key={o.v} value={o.v} className="dark:bg-slate-800 dark:text-white">{o.l}</option>)}
            </select>
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <BookOpen size={16} />
            </div>
        </div>
    </div>
);

const FilePicker = ({ label, accept, onChange, existingFile }) => {
    const fileName = existingFile ? existingFile.split(/[\\/]/).pop() : null;
    return (
        <div className="p-4 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-800 hover:border-blue-500 transition-all">
            <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest block mb-2">{label}</label>
            <input 
                type="file" accept={accept} onChange={(e) => onChange(e.target.files[0])} 
                className="text-xs text-slate-500 dark:text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-blue-50 dark:file:bg-slate-700 file:text-blue-600 dark:file:text-blue-300 file:font-bold file:text-[10px] cursor-pointer" 
            />
            {fileName && (
                <div className="mt-2 text-[10px] font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5 bg-slate-100 dark:bg-slate-700/50 p-2 rounded-lg truncate">
                    <FileText size={14} className="text-blue-500 shrink-0" /> 
                    Fichier : <span className="underline italic truncate">{fileName}</span>
                </div>
            )}
        </div>
    );
};

const SectionHeader = ({ title, icon, onAdd }) => (
    <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-3">
        <h3 className="text-xs font-black uppercase text-slate-700 dark:text-slate-200 flex items-center gap-2">
            <span className="text-blue-500">{icon}</span> {title}
        </h3>
        <button 
            type="button" onClick={onAdd} 
            className="p-1.5 bg-blue-50 dark:bg-slate-700 text-blue-600 dark:text-blue-400 hover:bg-blue-600 hover:text-white rounded-lg transition-all"
        >
            <Plus size={18} />
        </button>
    </div>
);

const DynamicItem = ({ value, onTextChange, onFileChange, onRemove, existingFile, labelPlaceholder }) => {
    const fileName = existingFile ? existingFile.split(/[\\/]/).pop() : null;
    return (
        <div className="p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl space-y-2 relative group">
            <button 
                type="button" onClick={onRemove} 
                className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md hover:scale-110"
            >
                <Trash2 size={12} />
            </button>
            <input 
                type="text" value={value} onChange={(e) => onTextChange(e.target.value)} 
                placeholder={labelPlaceholder} 
                className="w-full bg-white dark:bg-slate-900 p-2.5 rounded-lg font-bold text-xs text-slate-800 dark:text-slate-100 outline-none border border-slate-200 dark:border-slate-700 focus:border-blue-500"
            />
            <div className="flex flex-col gap-1.5">
                <input 
                    type="file" onChange={(e) => onFileChange(e.target.files[0])} 
                    className="text-[10px] file:text-[9px] file:px-2 file:py-1 file:bg-slate-200 dark:file:bg-slate-700 file:border-0 file:rounded-md file:font-bold cursor-pointer text-slate-500 dark:text-slate-400" 
                />
                {fileName && (
                    <div className="flex items-center gap-1 text-[9px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/40 px-2 py-1 rounded-md w-fit truncate max-w-full">
                        <FileText size={10} /> {fileName}
                    </div>
                )}
            </div>
        </div>
    );
};

export default EditTeacherModal;