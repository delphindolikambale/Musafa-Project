import React, { useState, useEffect } from 'react';
import { Save, Loader2, Image as ImageIcon, UploadCloud } from 'lucide-react';
import { toast } from 'react-hot-toast';
import BulletinHeaderService from "../../../services/admin/bulletinHeaderService";
import { BACKEND_BASE } from "../../../services/api";

const BulletinHeaderForm = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Données textuelles
    const [formData, setFormData] = useState({
        country: '',
        ministry: '',
        educationalProvince: '',
        city: '',
        communeTerritory: '',
        schoolName: '',
        schoolCode: ''
    });

    // Fichiers sélectionnés pour l'upload
    const [files, setFiles] = useState({
        flagImage: null,
        ministryLogo: null,
        watermarkLogo: null
    });

    // URLs de prévisualisation (anciennes images du backend ou nouvelles choisies)
    const [previews, setPreviews] = useState({
        flagImage: null,
        ministryLogo: null,
        watermarkLogo: null
    });

    useEffect(() => {
        loadHeaderData();
    }, []);

    const loadHeaderData = async () => {
        try {
            setLoading(true);
            const data = await BulletinHeaderService.getHeader();
            if (data) {
                setFormData({
                    country: data.country || '',
                    ministry: data.ministry || '',
                    educationalProvince: data.educationalProvince || '',
                    city: data.city || '',
                    communeTerritory: data.communeTerritory || '',
                    schoolName: data.schoolName || '',
                    schoolCode: data.schoolCode || ''
                });

                // Construction des URLs pour les images existantes
                setPreviews({
                    flagImage: data.flagImagePath ? `${BACKEND_BASE}/${data.flagImagePath}` : null,
                    ministryLogo: data.ministryLogoPath ? `${BACKEND_BASE}/${data.ministryLogoPath}` : null,
                    watermarkLogo: data.watermarkLogoPath ? `${BACKEND_BASE}/${data.watermarkLogoPath}` : null
                });
            }
        } catch (error) {
            console.error("Erreur de chargement de l'en-tête:", error);
            toast.error("Impossible de charger la configuration actuelle.");
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e, fieldName) => {
        const file = e.target.files[0];
        if (file) {
            setFiles(prev => ({ ...prev, [fieldName]: file }));
            setPreviews(prev => ({ ...prev, [fieldName]: URL.createObjectURL(file) }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await BulletinHeaderService.saveOrUpdateHeader(
                formData,
                files.flagImage,
                files.ministryLogo,
                files.watermarkLogo
            );
            toast.success("En-tête du bulletin configuré avec succès !");
            // Réinitialiser les objets File pour ne pas les renvoyer inutilement au prochain save
            setFiles({ flagImage: null, ministryLogo: null, watermarkLogo: null });
        } catch (error) {
            console.error("Erreur de sauvegarde:", error);
            toast.error("Erreur lors de la sauvegarde de la configuration.");
        } finally {
            setSaving(false);
        }
    };

    const renderImageUpload = (title, fieldName, previewUrl) => (
        <div className="flex flex-col space-y-2">
            <label className="text-xs font-black uppercase text-slate-500 dark:text-slate-400">{title}</label>
            <div className="relative group flex items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors overflow-hidden cursor-pointer">
                {previewUrl ? (
                    <img src={previewUrl} alt={title} className="object-contain w-full h-full p-2" />
                ) : (
                    <div className="flex flex-col items-center justify-center text-slate-400 dark:text-slate-500">
                        <ImageIcon size={32} className="mb-2 opacity-50" />
                        <span className="text-xs font-bold">Aucune image</span>
                    </div>
                )}
                <div className="absolute inset-0 bg-slate-900/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                    <div className="text-white flex items-center gap-2 text-xs font-black uppercase tracking-wider">
                        <UploadCloud size={16} /> Modifier
                    </div>
                </div>
                <input 
                    type="file" 
                    accept="image/*" 
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={(e) => handleFileChange(e, fieldName)}
                />
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
                <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-xs">Chargement de la configuration...</p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in duration-500">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] shadow-sm p-6 sm:p-8">
                <h3 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tight mb-6 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">1</span>
                    Textes Administratifs
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1.5">
                        <label className="text-xs font-black uppercase text-slate-500 dark:text-slate-400 ml-1">Pays</label>
                        <input 
                            type="text" name="country" value={formData.country} onChange={handleInputChange} required
                            placeholder="Ex: REPUBLIQUE DEMOCRATIQUE DU CONGO"
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-black uppercase text-slate-500 dark:text-slate-400 ml-1">Ministère</label>
                        <input 
                            type="text" name="ministry" value={formData.ministry} onChange={handleInputChange} required
                            placeholder="Ex: MINISTERE DE L'EDUCATION NATIONALE..."
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-black uppercase text-slate-500 dark:text-slate-400 ml-1">Province Éducationnelle</label>
                        <input 
                            type="text" name="educationalProvince" value={formData.educationalProvince} onChange={handleInputChange} required
                            placeholder="Ex: NORD-KIVU 1"
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-black uppercase text-slate-500 dark:text-slate-400 ml-1">Ville</label>
                        <input 
                            type="text" name="city" value={formData.city} onChange={handleInputChange} required
                            placeholder="Ex: GOMA"
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-black uppercase text-slate-500 dark:text-slate-400 ml-1">Commune / Territoire</label>
                        <input 
                            type="text" name="communeTerritory" value={formData.communeTerritory} onChange={handleInputChange} required
                            placeholder="Ex: KARISIMBI"
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-black uppercase text-slate-500 dark:text-slate-400 ml-1">Nom de l'École</label>
                        <input 
                            type="text" name="schoolName" value={formData.schoolName} onChange={handleInputChange} required
                            placeholder="Ex: C.S MUSAFA"
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                    </div>
                    <div className="space-y-1.5 md:col-span-2">
                        <label className="text-xs font-black uppercase text-slate-500 dark:text-slate-400 ml-1">Code de l'École</label>
                        <input 
                            type="text" name="schoolCode" value={formData.schoolCode} onChange={handleInputChange}
                            placeholder="Ex: 6100021"
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all md:w-1/2"
                        />
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] shadow-sm p-6 sm:p-8">
                <h3 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tight mb-6 flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">2</span>
                    Identité Visuelle
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    {renderImageUpload("Drapeau du Pays", "flagImage", previews.flagImage)}
                    {renderImageUpload("Sceau du Ministère", "ministryLogo", previews.ministryLogo)}
                    {renderImageUpload("Filigrane (Fond)", "watermarkLogo", previews.watermarkLogo)}
                </div>
            </div>

            <div className="flex justify-end pt-4">
                <button 
                    type="submit" 
                    disabled={saving}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-2xl font-black uppercase tracking-wider text-xs flex items-center gap-2 transition-all shadow-lg shadow-blue-500/30 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                    Enregistrer la configuration
                </button>
            </div>
        </form>
    );
};

export default BulletinHeaderForm;