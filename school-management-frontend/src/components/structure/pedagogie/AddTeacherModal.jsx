// src/components/structure/pedagogie/AddTeacherModal.jsx
import React, { useState, useEffect } from 'react';
import { 
    X, Save, Plus, Trash2, User, BookOpen, MapPin, Phone, Mail, 
    Briefcase, RefreshCw, Camera, Upload, FileText, CheckCircle2, 
    ToggleLeft, ToggleRight, Calendar, AlertCircle, Copy, Check
} from 'lucide-react';
import TeacherService, { PEDAGOGICAL_DAYS_OPTIONS } from '../../../services/pedagogieService/TeacherService';
import courseAcademicConfigService from '../../../services/pedagogieService/courseAcademicConfigService';

const AddTeacherModal = ({ isOpen, onClose, onRefresh }) => {
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
        pedagogicalDays: [], 
        profilePicture: null,
        cv: null,
        academicTitles: [],
        trainings: []
    });

    const [previewImage, setPreviewImage] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [specialities, setSpecialities] = useState([]); 
    
    const [isAddingNewDomain, setIsAddingNewDomain] = useState(false);
    const [newDomainName, setNewDomainName] = useState('');

    // NOUVEAU: États pour gérer l'affichage du compte créé
    const [createdAccountData, setCreatedAccountData] = useState(null);
    const [isCopied, setIsCopied] = useState(false);

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
            // Réinitialiser l'état du succès si on réouvre la modale
            setCreatedAccountData(null);
            setIsCopied(false);
        }
    }, [isOpen]);

    useEffect(() => {
        return () => {
            if (previewImage) URL.revokeObjectURL(previewImage);
        };
    }, [previewImage]);

    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const toggleStatus = () => {
        setFormData({ ...formData, active: !formData.active });
    };

    const handlePedagogicalDayToggle = (dayValue) => {
        setFormData((prev) => {
            const currentDays = prev.pedagogicalDays || [];
            if (currentDays.includes(dayValue)) {
                return { ...prev, pedagogicalDays: currentDays.filter((day) => day !== dayValue) };
            }
            if (currentDays.length >= 2) return prev;
            return { ...prev, pedagogicalDays: [...currentDays, dayValue] };
        });
    };

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

    const handleCvUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({ ...formData, cv: file });
        }
    };

    const addAcademicTitle = () => setFormData({ ...formData, academicTitles: [...formData.academicTitles, { titleName: '', documentFile: null }] });
    const removeAcademicTitle = (index) => setFormData({ ...formData, academicTitles: formData.academicTitles.filter((_, i) => i !== index) });
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

    const addTraining = () => setFormData({ ...formData, trainings: [...formData.trainings, { trainingName: '', documentFile: null }] });
    const removeTraining = (index) => setFormData({ ...formData, trainings: formData.trainings.filter((_, i) => i !== index) });
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

    const handleSubmit = async (e) => {
        e.preventDefault();

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

            data.append('teacher', new Blob([JSON.stringify(teacherDTO)], { type: 'application/json' }));

            if (formData.profilePicture) data.append('photo', formData.profilePicture);
            if (formData.cv) data.append('cv', formData.cv);

            formData.academicTitles.forEach(title => { if (title.documentFile) data.append('titleDocs', title.documentFile); });
            formData.trainings.forEach(training => { if (training.documentFile) data.append('trainingDocs', training.documentFile); });
            
            // On récupère la réponse du Backend
            const response = await TeacherService.createTeacher(data);
            
            // On met à jour l'interface avec les données de compte générées
            setCreatedAccountData({
                username: response.username,
                email: response.email,
                defaultPassword: "Prof2026!", // Défini dans votre Backend
                fullName: `${response.firstName} ${response.lastName}`
            });

            onRefresh(); // On rafraîchit la liste en arrière-plan
            // Note: On ne fait plus onClose() ici, l'utilisateur le fera après avoir vu les identifiants.

        } catch (err) {
            console.error("Erreur lors de la création de l'enseignant:", err);
            alert("Une erreur est survenue lors de l'archivage du dossier.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const copyCredentials = () => {
        if (!createdAccountData) return;
        const textToCopy = `Identifiants Enseignant - ${createdAccountData.fullName}\nNom d'utilisateur: ${createdAccountData.username}\nEmail: ${createdAccountData.email}\nMot de passe provisoire: ${createdAccountData.defaultPassword}\n(Il vous sera demandé de modifier ce mot de passe à la première connexion.)`;
        navigator.clipboard.writeText(textToCopy);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 3000);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-slate-900/70 dark:bg-slate-950/80 backdrop-blur-md">
            <div className="bg-white dark:bg-slate-900 w-full max-w-5xl max-h-[95vh] flex flex-col rounded-[2.5rem] shadow-2xl border border-slate-200/60 dark:border-slate-800 animate-in zoom-in-95 duration-300 overflow-hidden transition-colors">  
                
                {/* Header Modal */}
                <div className="shrink-0 bg-gradient-to-r from-slate-900 via-blue-900 to-blue-800 dark:from-slate-900 dark:via-blue-950 dark:to-slate-800 p-6 md:p-8 rounded-t-[2.5rem] flex justify-between items-center text-white shadow-lg relative z-10 transition-colors">
                    <div className="min-w-0 flex items-center gap-4">
                        <div className="relative shrink-0">
                            {previewImage && !createdAccountData ? (
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
                
                {/* Corps de formulaire OU Écran de succès */}
                <div className="flex-1 overflow-y-auto p-4 md:p-10 bg-slate-50/50 dark:bg-slate-950 transition-colors">
                    
                    {/* ÉCRAN DE SUCCÈS - S'affiche uniquement si la création est réussie */}
                    {createdAccountData ? (
                        <div className="flex flex-col items-center justify-center h-full max-w-2xl mx-auto space-y-8 animate-in slide-in-from-bottom-8 duration-500 pb-10">
                            <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center shadow-inner shadow-emerald-200 dark:shadow-emerald-900/50">
                                <CheckCircle2 size={50} strokeWidth={2.5} />
                            </div>
                            
                            <div className="text-center space-y-2">
                                <h2 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight">Dossier Validé !</h2>
                                <p className="text-slate-500 dark:text-slate-400 font-medium">Le dossier de <strong className="text-slate-800 dark:text-slate-200">{createdAccountData.fullName}</strong> a été enregistré. Un compte utilisateur sécurisé a été généré automatiquement avec les accès suivants :</p>
                            </div>

                            <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-sm space-y-6 relative overflow-hidden">
                                {/* Décoration d'arrière-plan */}
                                <div className="absolute -top-10 -right-10 opacity-5 dark:opacity-10 pointer-events-none">
                                    <User size={150} />
                                </div>

                                <div className="space-y-5 relative z-10">
                                    <div>
                                        <p className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest mb-1">Nom d'utilisateur (Username)</p>
                                        <div className="font-mono text-lg font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-xl border border-blue-100 dark:border-blue-900/50">
                                            {createdAccountData.username}
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest mb-1">Adresse Email</p>
                                        <div className="font-mono text-base font-bold text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                                            {createdAccountData.email}
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase text-slate-400 dark:text-slate-500 tracking-widest mb-1">Mot de passe provisoire</p>
                                        <div className="flex items-center justify-between font-mono text-base font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-xl border border-amber-100 dark:border-amber-900/50">
                                            <span>{createdAccountData.defaultPassword}</span>
                                            <span className="text-[10px] bg-amber-200/50 dark:bg-amber-800/50 px-2 py-1 rounded-md text-amber-800 dark:text-amber-200">À modifier</span>
                                        </div>
                                    </div>
                                </div>

                                <button 
                                    onClick={copyCredentials}
                                    className="w-full flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 py-4 rounded-xl font-black uppercase text-sm tracking-widest transition-colors border border-slate-200 dark:border-slate-700"
                                >
                                    {isCopied ? <><Check size={18} className="text-emerald-500"/> Copié avec succès !</> : <><Copy size={18}/> Copier les identifiants</>}
                                </button>
                            </div>
                        </div>
                    ) : (
                        /* FORMULAIRE CLASSIQUE */
                        <form id="teacherForm" onSubmit={handleSubmit} className="space-y-8 md:space-y-10">
                            
                            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-5 rounded-[2rem] flex flex-col sm:flex-row gap-4 items-start shadow-sm">
                                <div className="bg-blue-500/20 dark:bg-blue-500/30 p-3 rounded-2xl shrink-0">
                                    <CheckCircle2 size={24} className="text-blue-700 dark:text-blue-400" />
                                </div>
                                <div>
                                    <h3 className="text-sm md:text-base font-black text-blue-900 dark:text-blue-300 uppercase tracking-tight">
                                        Génération Automatique de Comptes
                                    </h3>
                                    <p className="text-xs md:text-sm text-blue-800/80 dark:text-blue-400/80 mt-1.5 font-medium leading-relaxed">
                                        L'enregistrement de cet enseignant déclenchera la création immédiate d'un <strong>compte utilisateur système</strong>. Les identifiants (Username et Mot de passe) s'afficheront à l'étape suivante.
                                    </p>
                                </div>
                            </div>

                            {/* SECTION 1 : Identité & Spécialité */}
                            <div className="bg-white dark:bg-slate-900 p-5 md:p-8 rounded-[2rem] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6 transition-colors">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
                                    <h3 className="text-sm font-black text-blue-900 dark:text-blue-400 uppercase tracking-widest flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-500"></span> Identité & Spécialité
                                    </h3>
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

                            {/* SECTION SÉCURISÉE : Journées Pédagogiques */}
                            <div className="bg-white dark:bg-slate-900 p-5 md:p-8 rounded-[2rem] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5 transition-colors">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                                    <div className="flex items-center gap-2">
                                        <Calendar size={18} className="text-blue-600 dark:text-blue-400 shrink-0" />
                                        <h3 className="text-sm font-black text-blue-900 dark:text-blue-400 uppercase tracking-widest">
                                            Journées Pédagogiques (Jours de repos)
                                        </h3>
                                    </div>
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
                                                    isSelected ? 'bg-white' : isMaxReached ? 'bg-slate-300 dark:bg-slate-700' : 'bg-slate-300 dark:bg-slate-600'
                                                }`} />
                                                {dayOption.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* SECTION 2 : État Civil & Contact */}
                            <div className="bg-white dark:bg-slate-900 p-5 md:p-8 rounded-[2rem] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6 transition-colors">
                                <h3 className="text-sm font-black text-blue-900 dark:text-blue-400 uppercase tracking-widest flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
                                    <span className="w-2 h-2 rounded-full bg-orange-500 dark:bg-orange-400"></span> État Civil & Contact
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
                                        <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 text-sm font-bold text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-500 outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500" />
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mt-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase text-slate-500 dark:text-slate-400 ml-2 flex items-center gap-2">
                                            <Phone size={14}/> Téléphone
                                        </label>
                                        <input type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} placeholder="+243..." className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 text-sm font-bold text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-500 outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase text-slate-500 dark:text-slate-400 ml-2 flex items-center gap-2">
                                            <Mail size={14}/> Email (Facultatif)
                                        </label>
                                        <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="enseignant@ecole.cd" className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 text-sm font-bold text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-500 outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500" />
                                    </div>
                                    <div className="space-y-2 lg:col-span-1 sm:col-span-2">
                                        <label className="text-xs font-black uppercase text-slate-500 dark:text-slate-400 ml-2 flex items-center gap-2">
                                            <MapPin size={14}/> Adresse Résidentielle
                                        </label>
                                        <input type="text" name="residentialAddress" value={formData.residentialAddress} onChange={handleChange} placeholder="Quartier, Commune, Ville..." className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 text-sm font-bold text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-500 outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500" />
                                    </div>
                                </div>
                            </div>

                            {/* SECTION 3 : Documents, Titres & Formations */}
                            <div className="bg-white dark:bg-slate-900 p-5 md:p-8 rounded-[2rem] border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6 transition-colors">
                                <h3 className="text-sm font-black text-blue-900 dark:text-blue-400 uppercase tracking-widest flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
                                    <span className="w-2 h-2 rounded-full bg-purple-500 dark:bg-purple-400"></span> Documents & Qualifications
                                </h3>
                                
                                <div className="space-y-3">
                                    <label className="text-xs font-black uppercase text-slate-500 dark:text-slate-400 ml-2 flex items-center gap-2">
                                        <FileText size={14}/> Curriculum Vitae (CV)
                                    </label>
                                    <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
                                        <input type="file" accept=".pdf,.doc,.docx" onChange={handleCvUpload} className="w-full text-sm text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-black file:uppercase file:tracking-wider file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200 dark:file:bg-blue-900/50 dark:file:text-blue-400 cursor-pointer" />
                                    </div>
                                </div>

                                <hr className="border-slate-100 dark:border-slate-800 my-6" />

                                {/* Titres Académiques */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <label className="text-xs font-black uppercase text-slate-500 dark:text-slate-400 flex items-center gap-2">
                                            <BookOpen size={14}/> Titres Académiques
                                        </label>
                                        <button type="button" onClick={addAcademicTitle} className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/10 hover:bg-purple-100 dark:hover:bg-purple-500/20 px-3 py-1.5 rounded-lg transition-colors">
                                            <Plus size={14} /> Ajouter un titre
                                        </button>
                                    </div>
                                    {formData.academicTitles.map((title, index) => (
                                        <div key={index} className="flex flex-col sm:flex-row gap-4 items-end bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/50 animate-in slide-in-from-top-2">
                                            <div className="flex-1 w-full space-y-2">
                                                <label className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400">Intitulé du diplôme/titre *</label>
                                                <input required type="text" value={title.titleName} onChange={(e) => handleTitleChange(index, 'titleName', e.target.value)} placeholder="Ex: Licence en Pédagogie Appliquée" className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm font-bold text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-purple-500 outline-none" />
                                            </div>
                                            <div className="flex-1 w-full space-y-2">
                                                <label className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400">Document Preuve (PDF/Img)</label>
                                                <input type="file" onChange={(e) => handleTitleFileChange(index, e)} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-sm file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:uppercase file:bg-slate-100 file:text-slate-600 hover:file:bg-slate-200 dark:file:bg-slate-800 dark:file:text-slate-300" />
                                            </div>
                                            <button type="button" onClick={() => removeAcademicTitle(index)} className="p-3 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 rounded-xl transition-colors">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                <hr className="border-slate-100 dark:border-slate-800 my-6" />

                                {/* Formations */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <label className="text-xs font-black uppercase text-slate-500 dark:text-slate-400 flex items-center gap-2">
                                            <Briefcase size={14}/> Formations & Certifications
                                        </label>
                                        <button type="button" onClick={addTraining} className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 px-3 py-1.5 rounded-lg transition-colors">
                                            <Plus size={14} /> Ajouter une formation
                                        </button>
                                    </div>
                                    {formData.trainings.map((training, index) => (
                                        <div key={index} className="flex flex-col sm:flex-row gap-4 items-end bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-700/50 animate-in slide-in-from-top-2">
                                            <div className="flex-1 w-full space-y-2">
                                                <label className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400">Intitulé de la formation *</label>
                                                <input required type="text" value={training.trainingName} onChange={(e) => handleTrainingChange(index, 'trainingName', e.target.value)} placeholder="Ex: Formation en secourisme" className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm font-bold text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 outline-none" />
                                            </div>
                                            <div className="flex-1 w-full space-y-2">
                                                <label className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400">Certificat (PDF/Img)</label>
                                                <input type="file" onChange={(e) => handleTrainingFileChange(index, e)} className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-sm file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-[10px] file:font-bold file:uppercase file:bg-slate-100 file:text-slate-600 hover:file:bg-slate-200 dark:file:bg-slate-800 dark:file:text-slate-300" />
                                            </div>
                                            <button type="button" onClick={() => removeTraining(index)} className="p-3 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-500/20 rounded-xl transition-colors">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </form>
                    )}
                </div>

                {/* Footer Modal - Actions */}
                <div className="shrink-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-4 md:p-6 rounded-b-[2.5rem] flex flex-col sm:flex-row justify-end items-center gap-4 transition-colors">
                    
                    {/* Bonton d'action adapté selon l'état (formulaire vs succès) */}
                    {!createdAccountData ? (
                        <>
                            <button 
                                type="button" 
                                onClick={onClose} 
                                disabled={isSubmitting}
                                className="w-full sm:w-auto px-6 py-3.5 rounded-2xl text-sm font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
                            >
                                Annuler
                            </button>
                            <button 
                                form="teacherForm" 
                                type="submit" 
                                disabled={isSubmitting}
                                className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl text-sm font-black uppercase tracking-widest text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 shadow-lg shadow-blue-500/30 transition-all disabled:opacity-70 disabled:cursor-wait"
                            >
                                {isSubmitting ? (
                                    <><RefreshCw size={18} className="animate-spin" /> Traitement...</>
                                ) : (
                                    <><Save size={18} /> Enregistrer le dossier</>
                                )}
                            </button>
                        </>
                    ) : (
                        <button 
                            type="button" 
                            onClick={onClose} 
                            className="w-full sm:w-auto px-10 py-3.5 rounded-2xl text-sm font-black uppercase tracking-widest text-white bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-500/30 transition-all"
                        >
                            Terminer et Fermer
                        </button>
                    )}
                </div>

            </div>
        </div>
    );
};

export default AddTeacherModal;