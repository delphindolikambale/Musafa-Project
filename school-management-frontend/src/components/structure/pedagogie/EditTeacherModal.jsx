import React, { useState, useEffect, useMemo } from 'react';
import { 
    X, Save, User, FileText, Upload, Shield, 
    Phone, MapPin, Calendar, Briefcase, GraduationCap,
    Plus, Trash2, Image as ImageIcon, Loader2, Mail, Fingerprint, BookOpen, ToggleLeft, ToggleRight
} from 'lucide-react';
import TeacherService, { getFileUrl } from '../../../services/pedagogieService/TeacherService';
import courseAcademicConfigService from '../../../services/pedagogieService/courseAcademicConfigService';

const EditTeacherModal = ({ isOpen, onClose, teacher, onRefresh }) => {
    // --- ÉTATS DES DONNÉES ---
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
        domainSpecialityId: '', // Modifié : specialityDomainId -> domainSpecialityId
        active: true, // Ajout du statut actif
        academicTitles: [], 
        trainings: [],
        profilePicturePath: '',
        cvPath: ''
    });

    const [photoFile, setPhotoFile] = useState(null);
    const [cvFile, setCvFile] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [specialities, setSpecialities] = useState([]); // Modifié : domains -> specialities

    // Récupération des spécialités au montage (Référentiel des compétences)
    useEffect(() => {
        if (isOpen) {
            const fetchSpecialities = async () => {
                try {
                    // Utilisation de getAllSpecialities pour lister les compétences profs
                    const response = await courseAcademicConfigService.getAllSpecialities();
                    setSpecialities(response.data || []);
                } catch (error) {
                    console.error("Erreur lors de la récupération des spécialités:", error);
                }
            };
            fetchSpecialities();
        }
    }, [isOpen]);

    // --- SYNCHRONISATION AVEC LES DONNÉES DE L'ENSEIGNANT ---
    useEffect(() => {
        if (teacher) {
            setFormData({ 
                ...teacher,
                dateOfBirth: teacher.dateOfBirth ? new Date(teacher.dateOfBirth).toISOString().split('T')[0] : '',
                // Mapping correct depuis le DTO backend
                domainSpecialityId: teacher.domainSpecialityId || '',
                active: teacher.active !== undefined ? teacher.active : true, // Synchronisation de l'état actif
                academicTitles: teacher.academicTitles?.map(t => ({ ...t, documentFile: null })) || [],
                trainings: teacher.trainings?.map(t => ({ ...t, documentFile: null })) || []
            });
            setPhotoFile(null);
            setCvFile(null);
        }
    }, [teacher]);

    // Prévisualisation de la photo (Nouvelle ou Existante)
    const profilePreview = useMemo(() => {
        if (photoFile) return URL.createObjectURL(photoFile);
        if (formData.profilePicturePath) return getFileUrl(formData.profilePicturePath);
        return null;
    }, [photoFile, formData.profilePicturePath]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // --- GESTION DE LA BASCULE DE STATUT ---
    const toggleStatus = () => {
        setFormData(prev => ({ ...prev, active: !prev.active }));
    };

    // --- GESTION DES TITRES ACADÉMIQUES ---
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

    // --- GESTION DES FORMATIONS ---
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

    // --- SOUMISSION DES DONNÉES (Multipart/Form-data) ---
    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        setIsSubmitting(true);

        try {
            const data = new FormData();
            
            const teacherDTO = { ...formData };
            // Conversion de l'ID pour le backend
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
            alert("Une erreur est survenue lors de la sauvegarde.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen || !teacher) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-6xl rounded-[1.5rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[95vh] animate-in zoom-in-95 duration-300">
                
                {/* HEADER */}
                <div className="flex items-center justify-between p-5 sm:p-8 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white shrink-0">
                    <div className="flex items-center gap-3 sm:gap-5">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-white flex items-center justify-center border-2 border-amber-200 shadow-xl overflow-hidden shrink-0 group relative">
                            {profilePreview ? (
                                <img src={profilePreview} alt="Profil" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                            ) : (
                                <User size={32} className="text-amber-400" />
                            )}
                        </div>
                        <div>
                            <h2 className="text-xl sm:text-3xl font-black text-slate-800 uppercase tracking-tight leading-none">
                                Modifier le Profil
                            </h2>
                            <div className="flex flex-wrap items-center gap-2 mt-2">
                                <span className="bg-amber-500 text-white px-2 py-0.5 rounded text-[10px] font-bold tracking-widest uppercase">ID: {formData.id}</span>
                                <span className="text-slate-500 font-black text-xs sm:text-sm uppercase">
                                    {formData.lastName} {formData.middleName} {formData.firstName}
                                </span>
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-full transition-all">
                        <X size={28} />
                    </button>
                </div>

                <form id="edit-teacher-form" onSubmit={handleSubmit} className="overflow-y-auto p-5 sm:p-10 space-y-10 custom-scrollbar">
                    
                    {/* SECTION 1: ADMINISTRATIF */}
                    <div className="space-y-6">
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-100 pb-2">
                            <h3 className="text-xs font-black uppercase text-amber-500 tracking-[0.2em] flex items-center gap-3">
                                <Shield size={16} /> Informations Administratives
                            </h3>
                            {/* Sélecteur de statut Actif/Inactif */}
                            <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-200">
                                <span className={`text-[10px] font-black uppercase tracking-widest ${formData.active ? 'text-emerald-600' : 'text-slate-400'}`}>
                                    {formData.active ? 'Compte Actif' : 'Compte Inactif'}
                                </span>
                                <button 
                                    type="button" 
                                    onClick={toggleStatus}
                                    className={`transition-colors duration-300 ${formData.active ? 'text-emerald-500' : 'text-slate-300'}`}
                                >
                                    {formData.active ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
                                </button>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-4">
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

                    {/* SECTION 2: IDENTITÉ */}
                    <div className="space-y-6">
                        <h3 className="text-xs font-black uppercase text-blue-500 tracking-[0.2em] flex items-center gap-3">
                            <User size={16} /> Identité & Naissance
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <InputField label="Nom" name="lastName" value={formData.lastName} onChange={handleChange} required />
                            <InputField label="Post-nom" name="middleName" value={formData.middleName} onChange={handleChange} />
                            <InputField label="Prénom" name="firstName" value={formData.firstName} onChange={handleChange} required />
                            <SelectField label="Genre" name="gender" value={formData.gender} onChange={handleChange} options={[{v:'M', l:'Masculin'}, {v:'F', l:'Féminin'}]} />
                            <InputField label="Date de Naissance" name="dateOfBirth" type="date" value={formData.dateOfBirth} onChange={handleChange} />
                            <InputField label="Lieu de Naissance" name="placeOfBirth" value={formData.placeOfBirth} onChange={handleChange} />
                        </div>
                    </div>

                    {/* SECTION 3: CONTACT */}
                    <div className="space-y-6">
                        <h3 className="text-xs font-black uppercase text-emerald-500 tracking-[0.2em] flex items-center gap-3">
                            <Phone size={16} /> Contact & Localisation
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <InputField label="Téléphone" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} icon={<Phone size={16}/>} />
                            <InputField label="Email Professionnel" name="email" type="email" value={formData.email} onChange={handleChange} icon={<Mail size={16}/>} />
                            <div className="md:col-span-3">
                                <InputField label="Adresse Résidentielle Complète" name="residentialAddress" value={formData.residentialAddress} onChange={handleChange} icon={<MapPin size={16}/>} />
                            </div>
                        </div>
                    </div>

                    {/* SECTION 4: MÉDIAS PRINCIPAUX */}
                    <div className="space-y-6">
                        <h3 className="text-xs font-black uppercase text-purple-500 tracking-[0.2em] flex items-center gap-3">
                            <Upload size={16} /> Fichiers du Profil
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FilePicker 
                                label="Changer la Photo de Profil" 
                                accept="image/*" 
                                color="amber"
                                onChange={(file) => setPhotoFile(file)}
                                existingFile={formData.profilePicturePath}
                            />
                            <FilePicker 
                                label="Mettre à jour le CV (PDF)" 
                                accept=".pdf" 
                                color="emerald"
                                onChange={(file) => setCvFile(file)}
                                existingFile={formData.cvPath}
                            />
                        </div>
                    </div>

                    {/* SECTION 5: PARCOURS ACADÉMIQUE DYNAMIQUE */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                        {/* Titres */}
                        <div className="space-y-6 bg-slate-50/50 p-6 rounded-3xl border border-slate-100">
                            <SectionHeader title="Titres Académiques" icon={<GraduationCap size={18}/>} color="blue" onAdd={handleAddTitle} />
                            <div className="space-y-4">
                                {formData.academicTitles.map((title, index) => (
                                    <DynamicItem 
                                        key={index}
                                        labelPlaceholder="Ex: Master en Architecture"
                                        value={title.titleName}
                                        onTextChange={(val) => handleTitleChange(index, 'titleName', val)}
                                        onFileChange={(file) => handleTitleChange(index, 'documentFile', file)}
                                        onRemove={() => setFormData(p => ({...p, academicTitles: p.academicTitles.filter((_,i) => i !== index)}))}
                                        existingFile={title.documentPath}
                                    />
                                ))}
                                {formData.academicTitles.length === 0 && (
                                    <p className="text-center py-4 text-xs text-slate-400 italic">Aucun titre ajouté.</p>
                                )}
                            </div>
                        </div>

                        {/* Formations */}
                        <div className="space-y-6 bg-slate-50/50 p-6 rounded-3xl border border-slate-100">
                            <SectionHeader title="Formations & Stages" icon={<Briefcase size={18}/>} color="emerald" onAdd={handleAddTraining} />
                            <div className="space-y-4">
                                {formData.trainings.map((training, index) => (
                                    <DynamicItem 
                                        key={index}
                                        labelPlaceholder="Ex: Certificat en Pédagogie Numérique"
                                        value={training.trainingName}
                                        onTextChange={(val) => handleTrainingChange(index, 'trainingName', val)}
                                        onFileChange={(file) => handleTrainingChange(index, 'documentFile', file)}
                                        onRemove={() => setFormData(p => ({...p, trainings: p.trainings.filter((_,i) => i !== index)}))}
                                        existingFile={training.documentPath}
                                    />
                                ))}
                                {formData.trainings.length === 0 && (
                                    <p className="text-center py-4 text-xs text-slate-400 italic">Aucune formation ajoutée.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </form>

                {/* FOOTER ACTIONS */}
                <div className="p-6 sm:p-8 border-t border-slate-100 bg-white shrink-0">
                    <button 
                        type="submit" form="edit-teacher-form" disabled={isSubmitting}
                        className="w-full py-5 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-300 text-white rounded-2xl sm:rounded-3xl font-black uppercase tracking-[0.2em] shadow-xl shadow-amber-200 transition-all flex items-center justify-center gap-4 hover:-translate-y-1 active:scale-[0.98]"
                    >
                        {isSubmitting ? <Loader2 className="animate-spin" size={24} /> : <Save size={24} />}
                        {isSubmitting ? "Mise à jour en cours..." : "Enregistrer les modifications"}
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- SOUS-COMPOSANTS INTERNES ---

const InputField = ({ label, value, onChange, name, type = "text", required = false, icon }) => (
    <div className="space-y-2">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2">
            {icon} {label}
        </label>
        <input 
            type={type} name={name} value={value || ''} onChange={onChange} required={required} 
            className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-700 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 outline-none transition-all placeholder:text-slate-300"
        />
    </div>
);

const SelectField = ({ label, value, onChange, name, options }) => (
    <div className="space-y-2">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
        <div className="relative">
            <select 
                name={name} value={value} onChange={onChange} 
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold text-slate-700 outline-none focus:border-amber-500 transition-all appearance-none cursor-pointer"
            >
                {options.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <BookOpen size={16} />
            </div>
        </div>
    </div>
);

const FilePicker = ({ label, accept, color, onChange, existingFile }) => {
    const fileName = existingFile ? existingFile.split(/[\\/]/).pop() : null;
    return (
        <div className="group relative p-5 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50 hover:bg-white hover:border-amber-400 transition-all">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-3">{label}</label>
            <input 
                type="file" accept={accept} onChange={(e) => onChange(e.target.files[0])} 
                className="text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:bg-slate-200 file:text-slate-700 file:font-black file:uppercase file:text-[10px] cursor-pointer" 
            />
            {fileName && (
                <div className={`mt-3 text-[10px] font-bold text-slate-600 flex items-center gap-2 bg-slate-100 p-2 rounded-xl border border-slate-200`}>
                    <FileText size={14} className="text-amber-500" /> 
                    Fichier actuel : <span className="underline italic truncate">{fileName}</span>
                </div>
            )}
        </div>
    );
};

const SectionHeader = ({ title, icon, color, onAdd }) => (
    <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
        <h3 className={`text-sm font-black uppercase text-slate-700 flex items-center gap-3`}>
            <span className={`text-${color}-500`}>{icon}</span> {title}
        </h3>
        <button 
            type="button" onClick={onAdd} 
            className="p-2 bg-white text-slate-600 hover:text-amber-500 shadow-sm hover:shadow-md rounded-xl transition-all border border-slate-100 active:scale-90"
        >
            <Plus size={20} />
        </button>
    </div>
);

const DynamicItem = ({ value, onTextChange, onFileChange, onRemove, existingFile, labelPlaceholder }) => {
    const fileName = existingFile ? existingFile.split(/[\\/]/).pop() : null;
    return (
        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-3 relative group transition-all hover:border-amber-200 hover:shadow-md">
            <button 
                type="button" onClick={onRemove} 
                className="absolute -top-2 -right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:scale-110"
            >
                <Trash2 size={12} />
            </button>
            <input 
                type="text" value={value} onChange={(e) => onTextChange(e.target.value)} 
                placeholder={labelPlaceholder} 
                className="w-full bg-slate-50 p-3 rounded-xl font-bold text-xs outline-none border border-transparent focus:border-amber-200"
            />
            <div className="flex flex-col gap-2">
                <input 
                    type="file" onChange={(e) => onFileChange(e.target.files[0])} 
                    className="text-[10px] file:text-[9px] file:px-2 file:py-1 file:bg-slate-100 file:border-0 file:rounded-lg file:font-bold cursor-pointer" 
                />
                {fileName && (
                    <div className="flex items-center gap-2 text-[9px] font-black text-blue-500 bg-blue-50 px-2 py-1 rounded-md w-fit italic truncate max-w-full border border-blue-100">
                        <FileText size={10} /> {fileName}
                    </div>
                )}
            </div>
        </div>
    );
};

export default EditTeacherModal;