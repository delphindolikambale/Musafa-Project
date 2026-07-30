import React, { useState, useEffect } from 'react';
import { 
    X, Save, Plus, Trash2, User, BookOpen, MapPin, Phone, Mail, 
    Briefcase, RefreshCw, Camera, Upload, FileText, CheckCircle2, 
    ToggleLeft, ToggleRight, Calendar, AlertCircle 
} from 'lucide-react';
import TeacherService, { PEDAGOGICAL_DAYS_OPTIONS } from '../../../services/pedagogieService/TeacherService';
import courseAcademicConfigService from '../../../services/pedagogieService/courseAcademicConfigService';

const AddTeacherModal = ({ isOpen, onClose, onRefresh }) => {
    // État initial complet incluant le statut 'active' et les 'pedagogicalDays'
    const [formData, setFormData] = useState({
        nationalRegistrationNumber: '',
        lastName: '',
        middleName: '',
        firstName: '',
        gender: 'M',
        maritalStatus: 'Célibataire',
        placeOfBirth: '',
        dateOfBirth: '',
        phoneNumber: '',
        email: '',
        residentialAddress: '',
        domainSpecialityId: '',
        active: true,
        pedagogicalDays: [], // Tableau des jours pédagogiques (ex: ["LUNDI", "MARDI"]) - Max 2
        profilePicture: null,
        cv: null,
        academicTitles: [],
        trainings: []
    });

    const [previewImage, setPreviewImage] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [specialities, setSpecialities] = useState([]); 
    
    // États pour gérer la création de spécialité à la volée
    const [isAddingNewDomain, setIsAddingNewDomain] = useState(false);
    const [newDomainName, setNewDomainName] = useState('');

    // Récupération des spécialités depuis le Backend
    useEffect(() => {
        if (isOpen) {
            const fetchSpecialities = async () => {
                try {
                    const response = await courseAcademicConfigService.getAllSpecialities();
                    setSpecialities(response.data || []);
                } catch (error) {
                    console.error("Erreur lors de la récupération des spécialités :", error);
                }
            };
            fetchSpecialities();
        }
    }, [isOpen]);

    // Nettoyage de l'URL d'aperçu d'image
    useEffect(() => {
        return () => {
            if (previewImage) URL.revokeObjectURL(previewImage);
        };
    }, [previewImage]);

    if (!isOpen) return null;

    // --- Gestion des champs standards ---
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    // --- Bascule de statut actif/inactif ---
    const toggleStatus = () => {
        setFormData({ ...formData, active: !formData.active });
    };

    // --- HAUTE SÉCURITÉ : Sélection limitée à 2 JOURS MAXIMUM ---
    const handlePedagogicalDayToggle = (dayValue) => {
        setFormData((prev) => {
            const currentDays = prev.pedagogicalDays || [];
            
            // Si le jour est déjà sélectionné, on le retire (toujours autorisé)
            if (currentDays.includes(dayValue)) {
                return {
                    ...prev,
                    pedagogicalDays: currentDays.filter((day) => day !== dayValue)
                };
            }
            
            // SÉCURITÉ : Si la limite de 2 jours est atteinte, on interdit l'ajout d'un 3ème jour
            if (currentDays.length >= 2) {
                return prev;
            }

            // Sinon on ajoute le jour
            return {
                ...prev,
                pedagogicalDays: [...currentDays, dayValue]
            };
        });
    };

    // --- Gestion Photo de Profil ---
    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) {
                alert("La photo est trop lourde (max 2Mo)");
                return;
            }
            setFormData({ ...formData, profilePicture: file });
            if (previewImage) URL.revokeObjectURL(previewImage);
            setPreviewImage(URL.createObjectURL(file));
        }
    };

    // --- Gestion CV ---
    const handleCvUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({ ...formData, cv: file });
        }
    };

    // --- Titres Académiques ---
    const addAcademicTitle = () => {
        setFormData({ 
            ...formData, 
            academicTitles: [...formData.academicTitles, { titleName: '', documentFile: null }] 
        });
    };

    const removeAcademicTitle = (index) => {
        const newTitles = formData.academicTitles.filter((_, i) => i !== index);
        setFormData({ ...formData, academicTitles: newTitles });
    };

    const handleTitleChange = (index, field, value) => {
        const newTitles = [...formData.academicTitles];
        newTitles[index][field] = value;
        setFormData({ ...formData, academicTitles: newTitles });
    };

    const handleTitleFileChange = (index, e) => {
        const file = e.target.files[0];
        if (file) {
            const newTitles = [...formData.academicTitles];
            newTitles[index].documentFile = file;
            setFormData({ ...formData, academicTitles: newTitles });
        }
    };

    // --- Formations ---
    const addTraining = () => {
        setFormData({ 
            ...formData, 
            trainings: [...formData.trainings, { trainingName: '', documentFile: null }] 
        });
    };

    const removeTraining = (index) => {
        const newTrainings = formData.trainings.filter((_, i) => i !== index);
        setFormData({ ...formData, trainings: newTrainings });
    };

    const handleTrainingChange = (index, field, value) => {
        const newTrainings = [...formData.trainings];
        newTrainings[index][field] = value;
        setFormData({ ...formData, trainings: newTrainings });
    };

    const handleTrainingFileChange = (index, e) => {
        const file = e.target.files[0];
        if (file) {
            const newTrainings = [...formData.trainings];
            newTrainings[index].documentFile = file;
            setFormData({ ...formData, trainings: newTrainings });
        }
    };

    // --- Soumission ---
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation de sécurité supplémentaire avant envoi
        if (formData.pedagogicalDays.length > 2) {
            alert("Sécurité : Vous ne pouvez pas sélectionner plus de 2 journées pédagogiques.");
            return;
        }

        setIsSubmitting(true);
        try {
            const data = new FormData();
            
            const teacherDTO = {
                nationalRegistrationNumber: formData.nationalRegistrationNumber,
                lastName: formData.lastName,
                middleName: formData.middleName,
                firstName: formData.firstName,
                gender: formData.gender,
                maritalStatus: formData.maritalStatus,
                placeOfBirth: formData.placeOfBirth,
                dateOfBirth: formData.dateOfBirth,
                phoneNumber: formData.phoneNumber,
                email: formData.email,
                residentialAddress: formData.residentialAddress,
                active: formData.active,
                pedagogicalDays: formData.pedagogicalDays,
                domainSpecialityId: (!isAddingNewDomain && formData.domainSpecialityId) ? Number(formData.domainSpecialityId) : null,
                newSpecialityName: (isAddingNewDomain && newDomainName.trim() !== '') ? newDomainName.trim() : null,
                academicTitles: formData.academicTitles.map(t => ({ titleName: t.titleName })),
                trainings: formData.trainings.map(t => ({ trainingName: t.trainingName }))
            };

            data.append('teacher', new Blob([JSON.stringify(teacherDTO)], {
                type: 'application/json'
            }));

            if (formData.profilePicture) {
                data.append('photo', formData.profilePicture);
            }
            if (formData.cv) {
                data.append('cv', formData.cv);
            }

            formData.academicTitles.forEach((title) => {
                if (title.documentFile) {
                    data.append('titleDocs', title.documentFile);
                }
            });
            formData.trainings.forEach((training) => {
                if (training.documentFile) {
                    data.append('trainingDocs', training.documentFile);
                }
            });
            
            await TeacherService.createTeacher(data);
            onRefresh(); 
            onClose();   
        } catch (err) {
            console.error("Erreur lors de la création de l'enseignant:", err);
            alert("Une erreur est survenue lors de l'archivage du dossier.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-slate-900/70 dark:bg-slate-950/80 backdrop-blur-md">
            <div className="bg-white dark:bg-slate-900 w-full max-w-5xl max-h-[95vh] flex flex-col rounded-[2.5rem] shadow-2xl border border-slate-200/60 dark:border-slate-800 animate-in zoom-in-95 duration-300 overflow-hidden transition-colors">  
                
                {/* Header Modal */}
                <div className="shrink-0 bg-gradient-to-r from-slate-900 via-blue-900 to-blue-800 dark:from-slate-900 dark:via-blue-950 dark:to-slate-800 p-6 md:p-8 rounded-t-[2.5rem] flex justify-between items-center text-white shadow-lg relative z-10 transition-colors">
                    <div className="min-w-0 flex items-center gap-4">
                        <div className="relative shrink-0">
                            {previewImage ? (
                                <img 
                                    src={previewImage} 
                                    alt="Aperçu" 
                                    className="w-12 h-12 md:w-14 md:h-14 rounded-2xl object-cover border-2 border-blue-300/50 dark:border-blue-500/50 shadow-inner shadow-blue-900 dark:shadow-black"
                                />
                            ) : (
                                <div className="p-2 md:p-3 bg-blue-500/20 dark:bg-blue-600/20 rounded-2xl border border-blue-400/30 dark:border-blue-500/30 backdrop-blur-sm">
                                    <User size={28} className="text-blue-300 dark:text-blue-400 shrink-0" /> 
                                </div>
                            )}
                        </div>
                        <div className="min-w-0">
                            <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight truncate">
                                Dossier Enseignant
                            </h2>
                            <p className="text-blue-200 dark:text-blue-300/80 text-xs md:text-sm font-medium mt-0.5 truncate">
                                Archivage automatique dans les dossiers scolaires.
                            </p>
                        </div>
                    </div>
                    <button 
                        type="button" 
                        onClick={onClose} 
                        className="p-2 md:p-3 bg-white/10 hover:bg-white/20 dark:bg-slate-700/50 dark:hover:bg-slate-700 rounded-full transition-colors backdrop-blur-sm border border-white/20 dark:border-slate-600"
                    >
                        <X size={24} className="text-white" />
                    </button>
                </div>
                
                {/* Corps de formulaire */}
                <div className="flex-1 overflow-y-auto p-4 md:p-10 bg-slate-50/50 dark:bg-slate-950 transition-colors space-y-8 md:space-y-10">
                    <form id="teacherForm" onSubmit={handleSubmit} className="space-y-8 md:space-y-10">
                        
                        {/* SECTION 1 : Identité & Spécialité */}
                        <div className="bg-white dark:bg-slate-900 p-5 md:p-8 rounded-[2rem] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6 transition-colors">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                                <h3 className="text-sm font-black text-blue-900 dark:text-blue-400 uppercase tracking-widest flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-500"></span> Identité & Spécialité
                                </h3>
                                {/* Sélecteur de statut Actif/Inactif */}
                                <div className="flex items-center justify-between sm:justify-start gap-3 bg-slate-50 dark:bg-slate-800/60 px-4 py-2 rounded-2xl border border-slate-200 dark:border-slate-700">
                                    <span className={`text-[10px] font-black uppercase tracking-widest ${formData.active ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}`}>
                                        {formData.active ? 'Compte Actif' : 'Compte Inactif'}
                                    </span>
                                    <button 
                                        type="button" 
                                        onClick={toggleStatus}
                                        className={`transition-colors duration-300 ${formData.active ? 'text-emerald-500 dark:text-emerald-400' : 'text-slate-300 dark:text-slate-600'}`}
                                    >
                                        {formData.active ? <ToggleRight size={32} /> : <ToggleLeft size={32} />}
                                    </button>
                                </div>
                            </div>      
                            
                            <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
                                <div className="flex flex-col items-center gap-3 shrink-0">
                                    <div className="relative w-32 h-32 rounded-[2rem] border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center overflow-hidden group shadow-sm transition-all hover:border-blue-400 dark:hover:border-blue-500">
                                        {previewImage ? (
                                            <img src={previewImage} alt="Profil" className="w-full h-full object-cover" />
                                        ) : (
                                            <Camera size={32} className="text-slate-400 dark:text-slate-500 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors" />
                                        )}
                                        <label className="absolute inset-0 bg-slate-900/40 dark:bg-slate-900/60 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity backdrop-blur-[2px]">
                                            <Upload size={24} className="text-white" />
                                            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                                        </label>
                                    </div>
                                    <span className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400">Photo d'identité</span>
                                </div>

                                <div className="flex-1 w-full space-y-6">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase text-slate-500 dark:text-slate-400 ml-2">Nom *</label>
                                            <input required type="text" name="lastName" value={formData.lastName} onChange={handleChange} className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 text-sm font-bold text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-500 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase text-slate-500 dark:text-slate-400 ml-2">Post-nom</label>
                                            <input type="text" name="middleName" value={formData.middleName} onChange={handleChange} className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 text-sm font-bold text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-500 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase text-slate-500 dark:text-slate-400 ml-2">Prénom *</label>
                                            <input required type="text" name="firstName" value={formData.firstName} onChange={handleChange} className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 text-sm font-bold text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-500 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase text-slate-500 dark:text-slate-400 ml-2">Numéro National (Optionnel)</label>
                                            <input type="text" name="nationalRegistrationNumber" value={formData.nationalRegistrationNumber} onChange={handleChange} placeholder="Référence administrative" className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 text-sm font-bold text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-500 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500" />
                                        </div>
                                        
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center ml-2 mb-1">
                                                <label className="text-xs font-black uppercase text-slate-500 dark:text-slate-400 flex items-center gap-2">
                                                    <BookOpen size={14} className="text-blue-500 dark:text-blue-400"/> Domaine de Spécialité *
                                                </label>
                                                <button 
                                                    type="button" 
                                                    onClick={() => {
                                                        setIsAddingNewDomain(!isAddingNewDomain);
                                                        if (isAddingNewDomain) setNewDomainName('');
                                                    }}
                                                    className="text-[10px] font-black text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors uppercase tracking-widest bg-blue-50 dark:bg-blue-500/10 px-2 py-1 rounded-md"
                                                >
                                                    {isAddingNewDomain ? "Choisir existant" : "+ Nouveau"}
                                                </button>
                                            </div>           
                                            {!isAddingNewDomain ? (
                                                <select required name="domainSpecialityId" value={formData.domainSpecialityId} onChange={handleChange} className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 text-sm font-bold text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-500 outline-none transition-all appearance-none cursor-pointer">
                                                    <option value="" className="text-slate-500">Sélectionner une spécialité...</option>
                                                    {specialities.map(spec => (
                                                        <option key={spec.id} value={spec.id}>{spec.name}</option>
                                                    ))}
                                                </select>
                                            ) : (
                                                <input required type="text" placeholder="Saisir la nouvelle spécialité..." value={newDomainName} onChange={(e) => setNewDomainName(e.target.value)} className="w-full bg-blue-50/50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-4 text-sm font-bold text-blue-900 dark:text-blue-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-500 outline-none transition-all animate-in fade-in placeholder:text-blue-400 dark:placeholder:text-blue-500/70" autoFocus />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* SECTION SÉCURISÉE : Journées Pédagogiques (Jours de repos - MAX 2 JOURS) */}
                        <div className="bg-white dark:bg-slate-900 p-5 md:p-8 rounded-[2rem] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5 transition-colors">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                                <div className="flex items-center gap-2">
                                    <Calendar size={18} className="text-blue-600 dark:text-blue-400 shrink-0" />
                                    <h3 className="text-sm font-black text-blue-900 dark:text-blue-400 uppercase tracking-widest">
                                        Journées Pédagogiques (Jours de repos)
                                    </h3>
                                </div>
                                
                                {/* Badge dynamique montrant le nombre de jours sélectionnés */}
                                <div className="flex items-center gap-2 self-start sm:self-auto">
                                    <span className={`text-[11px] font-black px-3.5 py-1.5 rounded-full uppercase tracking-wider transition-all ${
                                        formData.pedagogicalDays.length === 2 
                                            ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-300/80 dark:border-amber-800' 
                                            : formData.pedagogicalDays.length === 1
                                                ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                                                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                                    }`}>
                                        {formData.pedagogicalDays.length} / 2 autorisés
                                    </span>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
                                    Sélectionnez jusqu'à <strong className="text-slate-900 dark:text-slate-200 font-extrabold">2 jours maximum</strong> autorisés pour les travaux pédagogiques :
                                </p>
                                
                                {formData.pedagogicalDays.length >= 2 && (
                                    <span className="text-[11px] font-black text-amber-600 dark:text-amber-400 flex items-center gap-1.5 animate-in fade-in">
                                        <AlertCircle size={14} />
                                        Limite maximale atteinte (2/2)
                                    </span>
                                )}
                            </div>

                            {/* Puces dynamiques des jours de la semaine */}
                            <div className="flex flex-wrap gap-2.5 pt-2">
                                {PEDAGOGICAL_DAYS_OPTIONS.map((dayOption) => {
                                    const isSelected = formData.pedagogicalDays.includes(dayOption.value);
                                    const isMaxReached = formData.pedagogicalDays.length >= 2 && !isSelected;

                                    return (
                                        <button
                                            key={dayOption.value}
                                            type="button"
                                            disabled={isMaxReached}
                                            onClick={() => handlePedagogicalDayToggle(dayOption.value)}
                                            className={`px-5 py-3 rounded-2xl text-xs font-extrabold transition-all duration-200 border flex items-center gap-2.5 select-none ${
                                                isSelected
                                                    ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/25 dark:bg-blue-500 dark:border-blue-500'
                                                    : isMaxReached
                                                        ? 'bg-slate-100 dark:bg-slate-800/30 text-slate-300 dark:text-slate-600 border-slate-200 dark:border-slate-800/60 opacity-50 cursor-not-allowed'
                                                        : 'bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-slate-800 cursor-pointer'
                                            }`}
                                        >
                                            <div className={`w-2.5 h-2.5 rounded-full transition-colors ${
                                                isSelected 
                                                    ? 'bg-white' 
                                                    : isMaxReached 
                                                        ? 'bg-slate-300 dark:bg-slate-700' 
                                                        : 'bg-slate-300 dark:bg-slate-600'
                                            }`} />
                                            {dayOption.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* SECTION 2 : État Civil */}
                        <div className="bg-white dark:bg-slate-900 p-5 md:p-8 rounded-[2rem] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6 transition-colors">
                            <h3 className="text-sm font-black text-blue-900 dark:text-blue-400 uppercase tracking-widest flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
                                <span className="w-2 h-2 rounded-full bg-orange-500 dark:bg-orange-400"></span> État Civil & Naissance
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase text-slate-500 dark:text-slate-400 ml-2">Sexe</label>
                                    <select name="gender" value={formData.gender} onChange={handleChange} className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 text-sm font-bold text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-500 outline-none appearance-none cursor-pointer">
                                        <option value="M">Masculin</option>
                                        <option value="F">Féminin</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase text-slate-500 dark:text-slate-400 ml-2">État Civil</label>
                                    <select name="maritalStatus" value={formData.maritalStatus} onChange={handleChange} className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 text-sm font-bold text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-500 outline-none appearance-none cursor-pointer">
                                        <option value="Célibataire">Célibataire</option>
                                        <option value="Marié(e)">Marié(e)</option>
                                        <option value="Veuf/Veuve">Veuf/Veuve</option>
                                        <option value="Divorcé(e)">Divorcé(e)</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase text-slate-500 dark:text-slate-400 ml-2">Lieu de naissance</label>
                                    <input type="text" name="placeOfBirth" value={formData.placeOfBirth} onChange={handleChange} className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 text-sm font-bold text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-500 outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase text-slate-500 dark:text-slate-400 ml-2">Date de naissance</label>
                                    <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 text-sm font-bold text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-500 outline-none [color-scheme:light] dark:[color-scheme:dark]" />
                                </div>
                            </div>
                        </div>

                        {/* SECTION 3 : Contact */}
                        <div className="bg-white dark:bg-slate-900 p-5 md:p-8 rounded-[2rem] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6 transition-colors">
                            <h3 className="text-sm font-black text-blue-900 dark:text-blue-400 uppercase tracking-widest flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400"></span> Coordonnées de Contact
                            </h3>
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
                                <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 p-4 rounded-2xl focus-within:ring-2 focus-within:ring-blue-500 dark:focus-within:ring-blue-500 transition-all">
                                    <Phone className="text-blue-500 dark:text-blue-400 shrink-0" size={20} />
                                    <input type="text" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} placeholder="Téléphone" className="bg-transparent border-none focus:ring-0 w-full font-bold text-sm outline-none text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500" />
                                </div>
                                <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 p-4 rounded-2xl focus-within:ring-2 focus-within:ring-blue-500 dark:focus-within:ring-blue-500 transition-all">
                                    <Mail className="text-orange-500 dark:text-orange-400 shrink-0" size={20} />
                                    <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Adresse Email" className="bg-transparent border-none focus:ring-0 w-full font-bold text-sm outline-none text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500" />
                                </div>
                                <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 p-4 rounded-2xl focus-within:ring-2 focus-within:ring-blue-500 dark:focus-within:ring-blue-500 transition-all">
                                    <MapPin className="text-emerald-500 dark:text-emerald-400 shrink-0" size={20} />
                                    <input type="text" name="residentialAddress" value={formData.residentialAddress} onChange={handleChange} placeholder="Adresse Résidentielle" className="bg-transparent border-none focus:ring-0 w-full font-bold text-sm outline-none text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500" />
                                </div>
                            </div>
                        </div>

                        {/* SECTION 4 : Documents Numérisés */}
                        <div className="bg-white dark:bg-slate-900 p-5 md:p-8 rounded-[2rem] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6 transition-colors">
                            <h3 className="text-sm font-black text-blue-900 dark:text-blue-400 uppercase tracking-widest flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
                                <span className="w-2 h-2 rounded-full bg-purple-500 dark:bg-purple-400"></span> Documents & Certifications
                            </h3>

                            <div className="w-full">
                                <label className="text-xs font-black uppercase text-slate-500 dark:text-slate-400 ml-2 mb-2 block">Curriculum Vitae (CV)</label>
                                <div className={`relative w-full border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center transition-all ${formData.cv ? 'border-purple-400 dark:border-purple-500 bg-purple-50/50 dark:bg-purple-500/10' : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 hover:border-purple-400 dark:hover:border-purple-500 group'}`}>
                                    {formData.cv ? (
                                        <div className="flex items-center gap-3 text-purple-700 dark:text-purple-300">
                                            <CheckCircle2 size={24} className="text-purple-500 dark:text-purple-400" />
                                            <span className="font-bold text-sm">{formData.cv.name}</span>
                                        </div>
                                    ) : (
                                        <>
                                            <FileText size={32} className="text-slate-400 dark:text-slate-500 group-hover:text-purple-500 dark:group-hover:text-purple-400 mb-2 transition-colors" />
                                            <span className="text-sm font-bold text-slate-600 dark:text-slate-300">Cliquez pour ajouter le CV</span>
                                            <span className="text-xs font-medium text-slate-400 dark:text-slate-500 mt-1">Format PDF ou DOC recommandé</span>
                                        </>
                                    )}
                                    <input type="file" accept=".pdf,.doc,.docx" onChange={handleCvUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4">
                                {/* Titres Académiques */}
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-4">
                                        <h3 className="text-sm font-black text-blue-900 dark:text-blue-400 uppercase tracking-widest flex items-center gap-2">
                                            <BookOpen size={16} className="text-blue-500 dark:text-blue-400"/> Titres Académiques
                                        </h3>
                                        <button type="button" onClick={addAcademicTitle} className="text-xs font-black bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 px-3 py-1.5 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-500/20 flex items-center gap-1 transition-all">
                                            <Plus size={14}/> Ajouter
                                        </button>
                                    </div>
                                    
                                    <div className="space-y-3">
                                        {formData.academicTitles.map((title, index) => (
                                            <div key={index} className="space-y-2 animate-in fade-in slide-in-from-top-1">
                                                <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/80 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 transition-colors">
                                                    <input 
                                                        type="text" 
                                                        placeholder="Ex: Master en Informatique" 
                                                        value={title.titleName} 
                                                        onChange={(e) => handleTitleChange(index, 'titleName', e.target.value)} 
                                                        required 
                                                        className="flex-1 bg-transparent border-none text-sm font-bold focus:ring-0 outline-none text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
                                                    />
                                                    
                                                    <div className="relative flex items-center justify-center p-2 rounded-xl bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-800/60 cursor-pointer transition-colors">
                                                        {title.documentFile ? <CheckCircle2 size={18} className="text-emerald-500" /> : <Upload size={18} />}
                                                        <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => handleTitleFileChange(index, e)} className="absolute inset-0 opacity-0 cursor-pointer" />
                                                    </div>
                                                    
                                                    <button type="button" onClick={() => removeAcademicTitle(index)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl transition-colors">
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                                {title.documentFile && (
                                                    <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold ml-2 truncate">
                                                        Document joint : {title.documentFile.name}
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                        {formData.academicTitles.length === 0 && (
                                            <div className="text-center p-6 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400 text-sm font-medium">
                                                Aucun titre académique ajouté.
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Formations & Certificats */}
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-4">
                                        <h3 className="text-sm font-black text-orange-900 dark:text-orange-400 uppercase tracking-widest flex items-center gap-2">
                                            <Briefcase size={16} className="text-orange-500 dark:text-orange-400"/> Formations & Certificats
                                        </h3>
                                        <button type="button" onClick={addTraining} className="text-xs font-black bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 px-3 py-1.5 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-500/20 flex items-center gap-1 transition-all">
                                            <Plus size={14}/> Ajouter
                                        </button>
                                    </div>
                                    
                                    <div className="space-y-3">
                                        {formData.trainings.map((training, index) => (
                                            <div key={index} className="space-y-2 animate-in fade-in slide-in-from-top-1">
                                                <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/80 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 transition-colors">
                                                    <input 
                                                        type="text" 
                                                        placeholder="Ex: Certificat CISCO" 
                                                        value={training.trainingName} 
                                                        onChange={(e) => handleTrainingChange(index, 'trainingName', e.target.value)} 
                                                        required 
                                                        className="flex-1 bg-transparent border-none text-sm font-bold focus:ring-0 outline-none text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
                                                    />
                                                    
                                                    <div className="relative flex items-center justify-center p-2 rounded-xl bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400 hover:bg-orange-200 dark:hover:bg-orange-800/60 cursor-pointer transition-colors">
                                                        {training.documentFile ? <CheckCircle2 size={18} className="text-emerald-500" /> : <Upload size={18} />}
                                                        <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => handleTrainingFileChange(index, e)} className="absolute inset-0 opacity-0 cursor-pointer" />
                                                    </div>
                                                    
                                                    <button type="button" onClick={() => removeTraining(index)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl transition-colors">
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                                {training.documentFile && (
                                                    <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold ml-2 truncate">
                                                        Document joint : {training.documentFile.name}
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                        {formData.trainings.length === 0 && (
                                            <div className="text-center p-6 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400 text-sm font-medium">
                                                Aucune formation ajoutée.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                    </form>
                </div>

                {/* Footer / Boutons d'action */}
                <div className="shrink-0 border-t border-slate-200/80 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md p-5 md:p-6 flex flex-col sm:flex-row justify-end items-center gap-4 transition-colors">
                    <button 
                        type="button" 
                        onClick={onClose} 
                        disabled={isSubmitting}
                        className="w-full sm:w-auto px-6 py-3 rounded-2xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
                    >
                        Annuler
                    </button>
                    <button 
                        type="submit" 
                        form="teacherForm"
                        disabled={isSubmitting}
                        className="w-full sm:w-auto px-8 py-3 rounded-2xl text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 shadow-lg shadow-blue-500/30 dark:shadow-blue-900/40 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />}
                        {isSubmitting ? 'Enregistrement en cours...' : 'Enregistrer le dossier'}
                    </button>
                </div>

            </div>
        </div>
    );
};

export default AddTeacherModal;