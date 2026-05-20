import React, { useState, useEffect } from 'react';
import { X, Save, Plus, Trash2, User, BookOpen, MapPin, Phone, Mail, Briefcase, RefreshCw, Camera, Upload, FileText, CheckCircle2, ToggleLeft, ToggleRight } from 'lucide-react';
import TeacherService from '../../../services/pedagogieService/TeacherService';
import courseAcademicConfigService from '../../../services/pedagogieService/courseAcademicConfigService';

const AddTeacherModal = ({ isOpen, onClose, onRefresh }) => {
    // État initial complet incluant le nouveau champ 'active'
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
        active: true, // NOUVEAU : Statut actif par défaut
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

    // Récupération des spécialités (compétences) depuis le Backend
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

    // Nettoyage de l'URL d'aperçu
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

    // --- Gestion de la bascule de statut ---
    const toggleStatus = () => {
        setFormData({ ...formData, active: !formData.active });
    };

    // --- Gestion de la Photo de Profil ---
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

    // --- Gestion du CV ---
    const handleCvUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({ ...formData, cv: file });
        }
    };

    // --- Gestion Dynamique des Listes ---
    const addAcademicTitle = () => {
        setFormData({ ...formData, academicTitles: [...formData.academicTitles, { titleName: '', documentFile: null }] });
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

    const addTraining = () => {
        setFormData({ ...formData, trainings: [...formData.trainings, { trainingName: '', documentFile: null }] });
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

    // --- Soumission adaptée ---
    const handleSubmit = async (e) => {
        e.preventDefault();
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
                active: formData.active, // Inclusion du statut dans le DTO
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-slate-900/70 backdrop-blur-md">
            <div className="bg-white w-full max-w-5xl max-h-[95vh] flex flex-col rounded-[2.5rem] shadow-2xl border border-white/20 animate-in zoom-in-95 duration-300 overflow-hidden">  
                {/* Header */}
                <div className="shrink-0 bg-gradient-to-r from-slate-900 via-blue-900 to-blue-800 p-6 md:p-8 rounded-t-[2.5rem] flex justify-between items-center text-white shadow-lg relative z-10">
                    <div className="min-w-0 flex items-center gap-4">
                        <div className="relative shrink-0">
                            {previewImage ? (
                                <img 
                                    src={previewImage} 
                                    alt="Aperçu" 
                                    className="w-12 h-12 md:w-14 md:h-14 rounded-2xl object-cover border-2 border-blue-300/50 shadow-inner shadow-blue-900"
                                />
                            ) : (
                                <div className="p-2 md:p-3 bg-blue-500/20 rounded-2xl border border-blue-400/30 backdrop-blur-sm">
                                    <User size={28} className="text-blue-300 shrink-0" /> 
                                </div>
                            )}
                        </div>
                        <div className="min-w-0">
                            <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight truncate">
                                Dossier Enseignant
                            </h2>
                            <p className="text-blue-200 text-xs md:text-sm font-medium mt-0.5 truncate">Archivage automatique dans les dossiers scolaires.</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 md:p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors backdrop-blur-sm border border-white/20">
                        <X size={24} className="text-white" />
                    </button>
                </div>
                
                {/* Corps de formulaire */}
                <div className="flex-1 overflow-y-auto p-4 md:p-10 bg-slate-50/50">
                    <form id="teacherForm" onSubmit={handleSubmit} className="space-y-8 md:space-y-10">
                        
                        {/* SECTION 1 : Identité & Statut */}
                        <div className="bg-white p-5 md:p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-6">
                            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                                <h3 className="text-sm font-black text-blue-900 uppercase tracking-widest flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-blue-600"></span> Identité & Spécialité
                                </h3>
                                {/* NOUVEAU : Sélecteur de statut Actif/Inactif */}
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
                            <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
                                <div className="flex flex-col items-center gap-3 shrink-0">
                                    <div className="relative w-32 h-32 rounded-[2rem] border-2 border-dashed border-slate-300 bg-slate-50 flex items-center justify-center overflow-hidden group shadow-sm transition-all hover:border-blue-400">
                                        {previewImage ? (
                                            <img src={previewImage} alt="Profil" className="w-full h-full object-cover" />
                                        ) : (
                                            <Camera size={32} className="text-slate-400 group-hover:text-blue-500 transition-colors" />
                                        )}
                                        <label className="absolute inset-0 bg-slate-900/40 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity backdrop-blur-[2px]">
                                            <Upload size={24} className="text-white" />
                                            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                                        </label>
                                    </div>
                                    <span className="text-[10px] font-black uppercase text-slate-500">Photo d'identité</span>
                                </div>

                                <div className="flex-1 w-full space-y-6">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase text-slate-500 ml-2">Nom *</label>
                                            <input required type="text" name="lastName" value={formData.lastName} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase text-slate-500 ml-2">Post-nom</label>
                                            <input type="text" name="middleName" value={formData.middleName} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase text-slate-500 ml-2">Prénom *</label>
                                            <input required type="text" name="firstName" value={formData.firstName} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                                        <div className="space-y-2">
                                            <label className="text-xs font-black uppercase text-slate-500 ml-2">Numéro National (Optionnel)</label>
                                            <input type="text" name="nationalRegistrationNumber" value={formData.nationalRegistrationNumber} onChange={handleChange} placeholder="Référence administrative" className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all" />
                                        </div>
                                        
                                        <div className="space-y-2">
                                            <div className="flex justify-between items-center ml-2 mb-1">
                                                <label className="text-xs font-black uppercase text-slate-500 flex items-center gap-2">
                                                    <BookOpen size={14} className="text-blue-500"/> Domaine de Spécialité *
                                                </label>
                                                <button 
                                                    type="button" 
                                                    onClick={() => {
                                                        setIsAddingNewDomain(!isAddingNewDomain);
                                                        if (isAddingNewDomain) setNewDomainName('');
                                                    }}
                                                    className="text-[10px] font-black text-blue-600 hover:text-blue-800 transition-colors uppercase tracking-widest bg-blue-50 px-2 py-1 rounded-md"
                                                >
                                                    {isAddingNewDomain ? "Choisir existant" : "+ Nouveau"}
                                                </button>
                                            </div>           
                                            {!isAddingNewDomain ? (
                                                <select required name="domainSpecialityId" value={formData.domainSpecialityId} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all appearance-none cursor-pointer">
                                                    <option value="">Sélectionner une spécialité...</option>
                                                    {specialities.map(spec => (
                                                        <option key={spec.id} value={spec.id}>{spec.name}</option>
                                                    ))}
                                                </select>
                                            ) : (
                                                <input required type="text" placeholder="Saisir la nouvelle spécialité..." value={newDomainName} onChange={(e) => setNewDomainName(e.target.value)} className="w-full bg-blue-50/50 border border-blue-200 rounded-2xl p-4 text-sm font-bold text-blue-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all animate-in fade-in" autoFocus />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* SECTION 2 : État Civil */}
                        <div className="bg-white p-5 md:p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-6">
                            <h3 className="text-sm font-black text-blue-900 uppercase tracking-widest flex items-center gap-2 border-b border-slate-100 pb-4">
                                <span className="w-2 h-2 rounded-full bg-orange-500"></span> État Civil & Naissance
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase text-slate-500 ml-2">Sexe</label>
                                    <select name="gender" value={formData.gender} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none">
                                        <option value="M">Masculin</option>
                                        <option value="F">Féminin</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase text-slate-500 ml-2">État Civil</label>
                                    <select name="maritalStatus" value={formData.maritalStatus} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none">
                                        <option value="Célibataire">Célibataire</option>
                                        <option value="Marié(e)">Marié(e)</option>
                                        <option value="Veuf/Veuve">Veuf/Veuve</option>
                                        <option value="Divorcé(e)">Divorcé(e)</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase text-slate-500 ml-2">Lieu de naissance</label>
                                    <input type="text" name="placeOfBirth" value={formData.placeOfBirth} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase text-slate-500 ml-2">Date de naissance</label>
                                    <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 outline-none" />
                                </div>
                            </div>
                        </div>

                        {/* SECTION 3 : Contact */}
                        <div className="bg-white p-5 md:p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-6">
                            <h3 className="text-sm font-black text-blue-900 uppercase tracking-widest flex items-center gap-2 border-b border-slate-100 pb-4">
                                <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Coordonnées de Contact
                            </h3>
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
                                <div className="flex items-center gap-4 bg-slate-50 border border-slate-200 p-4 rounded-2xl focus-within:ring-2 focus-within:ring-blue-500 transition-all">
                                    <Phone className="text-blue-500 shrink-0" size={20} />
                                    <input type="text" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} placeholder="Téléphone" className="bg-transparent border-none focus:ring-0 w-full font-bold text-sm outline-none text-slate-800" />
                                </div>
                                <div className="flex items-center gap-4 bg-slate-50 border border-slate-200 p-4 rounded-2xl focus-within:ring-2 focus-within:ring-blue-500 transition-all">
                                    <Mail className="text-orange-500 shrink-0" size={20} />
                                    <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="Adresse Email" className="bg-transparent border-none focus:ring-0 w-full font-bold text-sm outline-none text-slate-800" />
                                </div>
                                <div className="flex items-center gap-4 bg-slate-50 border border-slate-200 p-4 rounded-2xl focus-within:ring-2 focus-within:ring-blue-500 transition-all">
                                    <MapPin className="text-emerald-500 shrink-0" size={20} />
                                    <input type="text" name="residentialAddress" value={formData.residentialAddress} onChange={handleChange} placeholder="Adresse Résidentielle" className="bg-transparent border-none focus:ring-0 w-full font-bold text-sm outline-none text-slate-800" />
                                </div>
                            </div>
                        </div>

                        {/* SECTION 4 : Documents Numérisés */}
                        <div className="bg-white p-5 md:p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-6">
                            <h3 className="text-sm font-black text-blue-900 uppercase tracking-widest flex items-center gap-2 border-b border-slate-100 pb-4">
                                <span className="w-2 h-2 rounded-full bg-purple-500"></span> Documents & Certifications
                            </h3>

                            <div className="w-full">
                                <label className="text-xs font-black uppercase text-slate-500 ml-2 mb-2 block">Curriculum Vitae (CV)</label>
                                <div className={`relative w-full border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center transition-all ${formData.cv ? 'border-purple-400 bg-purple-50/50' : 'border-slate-300 bg-slate-50 hover:border-purple-400 group'}`}>
                                    {formData.cv ? (
                                        <div className="flex items-center gap-3 text-purple-700">
                                            <CheckCircle2 size={24} className="text-purple-500" />
                                            <span className="font-bold text-sm">{formData.cv.name}</span>
                                        </div>
                                    ) : (
                                        <>
                                            <FileText size={32} className="text-slate-400 group-hover:text-purple-500 mb-2 transition-colors" />
                                            <span className="text-sm font-bold text-slate-600">Cliquez pour ajouter le CV</span>
                                            <span className="text-xs font-medium text-slate-400 mt-1">Format PDF recommandé</span>
                                        </>
                                    )}
                                    <input type="file" accept=".pdf,.doc,.docx" onChange={handleCvUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4">
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                                        <h3 className="text-sm font-black text-blue-900 uppercase tracking-widest flex items-center gap-2">
                                            <BookOpen size={16} className="text-blue-500"/> Titres Académiques
                                        </h3>
                                        <button type="button" onClick={addAcademicTitle} className="text-xs font-black bg-blue-50 text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-100 flex items-center gap-1 transition-all">
                                            <Plus size={14}/> Ajouter
                                        </button>
                                    </div>
                                    
                                    <div className="space-y-3">
                                        {formData.academicTitles.map((title, index) => (
                                            <div key={index} className="space-y-2 animate-in fade-in slide-in-from-top-1">
                                                <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                                                    <input type="text" placeholder="Ex: Licencié en..." value={title.titleName} onChange={(e) => handleTitleChange(index, 'titleName', e.target.value)} className="flex-1 bg-transparent border-none text-sm font-bold focus:ring-0 outline-none" required />
                                                    <label className="cursor-pointer p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors relative">
                                                        <Upload size={16} />
                                                        <input type="file" className="hidden" onChange={(e) => handleTitleFileChange(index, e)} accept=".pdf,.jpg,.jpeg,.png" />
                                                    </label>
                                                    <button type="button" onClick={() => removeAcademicTitle(index)} className="p-2 text-red-400 hover:text-red-600 transition-colors"><Trash2 size={16} /></button>
                                                </div>
                                                {title.documentFile && (
                                                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600 ml-2 truncate">
                                                        <FileText size={12} className="shrink-0" /> {title.documentFile.name}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                        {formData.academicTitles.length === 0 && <p className="text-xs text-slate-400 font-medium italic">Aucun titre académique répertorié.</p>}
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                                        <h3 className="text-sm font-black text-blue-900 uppercase tracking-widest flex items-center gap-2">
                                            <Briefcase size={16} className="text-orange-500"/> Formations / Brevets
                                        </h3>
                                        <button type="button" onClick={addTraining} className="text-xs font-black bg-orange-50 text-orange-600 px-3 py-1.5 rounded-lg hover:bg-orange-100 flex items-center gap-1 transition-all">
                                            <Plus size={14}/> Ajouter
                                        </button>
                                    </div>
                                    
                                    <div className="space-y-3">
                                        {formData.trainings.map((training, index) => (
                                            <div key={index} className="space-y-2 animate-in fade-in slide-in-from-top-1">
                                                <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                                                    <input type="text" placeholder="Ex: Certificat CISCO..." value={training.trainingName} onChange={(e) => handleTrainingChange(index, 'trainingName', e.target.value)} className="flex-1 bg-transparent border-none text-sm font-bold focus:ring-0 outline-none" required />
                                                    <label className="cursor-pointer p-2 text-slate-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors relative">
                                                        <Upload size={16} />
                                                        <input type="file" className="hidden" onChange={(e) => handleTrainingFileChange(index, e)} accept=".pdf,.jpg,.jpeg,.png" />
                                                    </label>
                                                    <button type="button" onClick={() => removeTraining(index)} className="p-2 text-red-400 hover:text-red-600 transition-colors"><Trash2 size={16} /></button>
                                                </div>
                                                {training.documentFile && (
                                                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-orange-600 ml-2 truncate">
                                                        <FileText size={12} className="shrink-0" /> {training.documentFile.name}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                        {formData.trainings.length === 0 && <p className="text-xs text-slate-400 font-medium italic">Aucune formation supplémentaire.</p>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Footer Action */}
                <div className="shrink-0 bg-white p-6 md:p-8 border-t border-slate-100 rounded-b-[2.5rem] flex flex-col sm:flex-row gap-4 justify-end items-center relative z-10 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)]">
                    <button type="button" onClick={onClose} disabled={isSubmitting} className="w-full sm:w-auto px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs text-slate-500 bg-slate-100 hover:bg-slate-200 transition-all disabled:opacity-50">
                        Annuler
                    </button>
                    <button type="submit" form="teacherForm" disabled={isSubmitting} className="w-full sm:w-auto px-10 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-slate-900 text-white font-black uppercase tracking-widest text-xs shadow-xl shadow-blue-200 flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-70 disabled:cursor-not-allowed">
                        {isSubmitting ? (
                            <span className="flex items-center gap-2"><RefreshCw size={18} className="animate-spin" /> Archivage en cours...</span>
                        ) : (
                            <><Save size={18} /> Créer le Dossier</>
                        )}
                    </button>
                </div>

            </div>
        </div>
    );
};

export default AddTeacherModal;