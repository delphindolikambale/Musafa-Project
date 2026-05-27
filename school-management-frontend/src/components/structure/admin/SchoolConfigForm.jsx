import React, { useState, useEffect } from 'react';
import schoolConfigService from '../../../services/admin/schoolConfigService';
import { toast } from 'react-toastify'; 
import { useSchool } from '../../../context/SchoolContext'; // IMPORT DU CONTEXTE

const SchoolConfigForm = () => {
    // Récupération de la fonction de mise à jour globale
    const { updateSchoolConfig: refreshGlobalSchoolConfig } = useSchool();

    const [config, setConfig] = useState({
        id: null,
        schoolName: '',
        slogan: '',
        logoBase64: '',
        address: '',
        phone: '',
        email: '',
        website: '',
        province: '',
        city: '',
        subdivision: '',
        decreeOfCreation: '',
        headmasterName: '',
        academicProviseur: '',
        defaultCashierName: ''
    });

    const [isReadOnly, setIsReadOnly] = useState(true);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadConfig();
    }, []);

    const loadConfig = async () => {
        try {
            setLoading(true);
            const data = await schoolConfigService.getSchoolConfig();
            
            // Si des données valides avec un ID existent
            if (data && data.id) {
                setConfig(data);
                setIsReadOnly(true);
            } else {
                setIsReadOnly(false);
            }
        } catch (error) {
            console.error("Erreur lors du chargement de la configuration :", error);
            
            // Si le backend répond avec un code 409 ou s'il y a déjà une config existante cachée
            if (error.response && error.response.status === 409) {
                toast.warn("Une configuration existe déjà sur le serveur. Veuillez rafraîchir la page.");
            }
            
            // On laisse la possibilité d'éditer si aucune config n'a pu être chargée
            setIsReadOnly(false);
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        if (isReadOnly) return;
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onloadend = () => {
            setConfig({ ...config, logoBase64: reader.result });
        };
        if (file) reader.readAsDataURL(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            let updatedData;
            
            // Sécurité : Si l'id est absent mais qu'on a reçu une erreur 409 précédemment,
            // On s'assure d'exécuter la bonne méthode ou d'avertir l'utilisateur
            if (config.id) {
                updatedData = await schoolConfigService.updateSchoolConfig(config);
            } else {
                updatedData = await schoolConfigService.createSchoolConfig(config);
            }
            
            setConfig(updatedData);
            
            // ACTION CRUCIALE : On met à jour le contexte global
            await refreshGlobalSchoolConfig(); 
            
            setIsReadOnly(true); 
            toast.success("Configuration institutionnelle sauvegardée avec succès !");
        } catch (error) {
            console.error("Erreur lors de la sauvegarde :", error);
            
            if (error.response && error.response.status === 409) {
                toast.error("Conflit : Cette configuration existe déjà dans la base de données. Utilisez la mise à jour (PUT).");
            } else {
                toast.error("Erreur lors de la sauvegarde des paramètres.");
            }
        }
    };

    const getInputClasses = (readOnly) => `
        w-full p-3 rounded-xl border transition-all duration-300 outline-none text-sm md:text-base
        ${readOnly 
            ? "bg-slate-800/30 text-slate-400 border-transparent cursor-not-allowed shadow-none" 
            : "bg-slate-800/60 text-slate-100 border-slate-700/50 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 shadow-inner"
        }
    `;

    if (loading) return <div className="text-center p-10 text-slate-400 font-bold italic animate-pulse">Chargement des paramètres...</div>;

    return (
        <div className="p-5 md:p-8 bg-gradient-to-br from-slate-900 via-[#0a1128] to-[#081a3a] text-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-blue-900/30 relative overflow-hidden">
            
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="relative z-10">
                <div className="mb-8 border-b border-slate-700/50 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3">
                            <h2 className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-slate-400">
                                Paramètres de l'Institution
                            </h2>
                            {isReadOnly && config.id && (
                                <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-black px-2 py-1 rounded-full border border-emerald-500/20 uppercase tracking-tighter animate-pulse">
                                    ✓ Validé
                                </span>
                            )}
                        </div>
                        <p className="text-slate-400 text-xs md:text-sm mt-1">Identité officielle utilisée pour les documents administratifs.</p>
                    </div>

                    {isReadOnly && (
                        <button 
                            type="button"
                            onClick={() => setIsReadOnly(false)}
                            className="bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 border border-blue-500/30 px-5 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2"
                        >
                            <span>⚙️</span> Modifier les infos
                        </button>
                    )}
                </div>
                
                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-10">
                    
                    <div className={`space-y-5 p-5 rounded-2xl border transition-all duration-500 ${isReadOnly ? 'bg-slate-900/40 border-slate-800' : 'bg-slate-800/20 border-slate-700/30'}`}>
                        <h3 className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-200 font-bold uppercase tracking-wider text-sm flex items-center gap-2">
                            <span className="text-blue-400">🏫</span> Identité Visuelle
                        </h3>
                        <input 
                            className={getInputClasses(isReadOnly)}
                            placeholder="Nom officiel de l'établissement" 
                            value={config.schoolName || ''}
                            onChange={(e) => setConfig({...config, schoolName: e.target.value})}
                            required
                            readOnly={isReadOnly}
                        />
                        <input 
                            className={getInputClasses(isReadOnly)}
                            placeholder="Slogan ou Devise" 
                            value={config.slogan || ''}
                            onChange={(e) => setConfig({...config, slogan: e.target.value})}
                            readOnly={isReadOnly}
                        />
                        <div className={`flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl border ${isReadOnly ? 'bg-transparent border-slate-800' : 'bg-slate-800/40 border-slate-700/50'}`}>
                            {config.logoBase64 ? (
                                <img src={config.logoBase64} alt="Logo" className="w-16 h-16 md:w-20 md:h-20 object-contain bg-white rounded-lg p-1 shadow-md" />
                            ) : (
                                <div className="w-16 h-16 md:w-20 md:h-20 bg-slate-700 rounded-lg flex items-center justify-center text-xs text-slate-400 border border-dashed border-slate-500">Logo</div>
                            )}
                            <div className="flex-1">
                                <label className="block text-xs text-slate-400 mb-2">Logo de l'institution</label>
                                {!isReadOnly && (
                                    <input 
                                        type="file" 
                                        accept="image/*"
                                        onChange={handleFileChange} 
                                        className="text-sm w-full file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600/20 file:text-blue-400 hover:file:bg-blue-600/30 transition-all cursor-pointer text-slate-300" 
                                    />
                                )}
                                {isReadOnly && <p className="text-[10px] text-slate-500 font-italic italic">Logo enregistré et sécurisé.</p>}
                            </div>
                        </div>
                    </div>

                    <div className={`space-y-5 p-5 rounded-2xl border transition-all duration-500 ${isReadOnly ? 'bg-slate-900/40 border-slate-800' : 'bg-slate-800/20 border-slate-700/30'}`}>
                        <h3 className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-200 font-bold uppercase tracking-wider text-sm flex items-center gap-2">
                            <span className="text-emerald-400">🌍</span> Localisation & Légal
                        </h3>
                        <input 
                            className={getInputClasses(isReadOnly)}
                            placeholder="Province" 
                            value={config.province || ''}
                            onChange={(e) => setConfig({...config, province: e.target.value})}
                            readOnly={isReadOnly}
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input 
                                className={getInputClasses(isReadOnly)}
                                placeholder="Ville / Territoire" 
                                value={config.city || ''}
                                onChange={(e) => setConfig({...config, city: e.target.value})}
                                readOnly={isReadOnly}
                            />
                            <input 
                                className={getInputClasses(isReadOnly)}
                                placeholder="Sous-Division" 
                                value={config.subdivision || ''}
                                onChange={(e) => setConfig({...config, subdivision: e.target.value})}
                                readOnly={isReadOnly}
                            />
                        </div>
                        <input 
                            className={getInputClasses(isReadOnly)}
                            placeholder="Arrêté Ministériel" 
                            value={config.decreeOfCreation || ''}
                            onChange={(e) => setConfig({...config, decreeOfCreation: e.target.value})}
                            readOnly={isReadOnly}
                        />
                    </div>

                    <div className={`space-y-5 p-5 rounded-2xl border transition-all duration-500 ${isReadOnly ? 'bg-slate-900/40 border-slate-800' : 'bg-slate-800/20 border-slate-700/30'}`}>
                        <h3 className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-200 font-bold uppercase tracking-wider text-sm flex items-center gap-2">
                            <span className="text-orange-400">✍️</span> Autorités Signataires
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] uppercase font-bold text-slate-500 ml-1 mb-1 block">Préfet</label>
                                <input 
                                    className={getInputClasses(isReadOnly)}
                                    value={config.headmasterName || ''}
                                    onChange={(e) => setConfig({...config, headmasterName: e.target.value})}
                                    readOnly={isReadOnly}
                                />
                            </div>
                            <div>
                                <label className="text-[10px] uppercase font-bold text-slate-500 ml-1 mb-1 block">Proviseur</label>
                                <input 
                                    className={getInputClasses(isReadOnly)}
                                    value={config.academicProviseur || ''}
                                    onChange={(e) => setConfig({...config, academicProviseur: e.target.value})}
                                    readOnly={isReadOnly}
                                />
                            </div>
                            <div>
                                <label className="text-[10px] uppercase font-bold text-slate-500 ml-1 mb-1 block">Caissier</label>
                                <input 
                                    className={getInputClasses(isReadOnly)}
                                    value={config.defaultCashierName || ''}
                                    onChange={(e) => setConfig({...config, defaultCashierName: e.target.value})}
                                    readOnly={isReadOnly}
                                />
                            </div>
                        </div>
                    </div>

                    <div className={`space-y-5 p-5 rounded-2xl border transition-all duration-500 ${isReadOnly ? 'bg-slate-900/40 border-slate-800' : 'bg-slate-800/20 border-slate-700/30'}`}>
                        <h3 className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-200 font-bold uppercase tracking-wider text-sm flex items-center gap-2">
                            <span className="text-purple-400">📞</span> Contact Officiel
                        </h3>
                        <input 
                            className={getInputClasses(isReadOnly)}
                            placeholder="Adresse physique" 
                            value={config.address || ''}
                            onChange={(e) => setConfig({...config, address: e.target.value})}
                            readOnly={isReadOnly}
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input 
                                className={getInputClasses(isReadOnly)}
                                placeholder="Téléphone" 
                                value={config.phone || ''}
                                onChange={(e) => setConfig({...config, phone: e.target.value})}
                                readOnly={isReadOnly}
                            />
                            <input 
                                className={getInputClasses(isReadOnly)}
                                type="email"
                                placeholder="Email" 
                                value={config.email || ''}
                                onChange={(e) => setConfig({...config, email: e.target.value})}
                                readOnly={isReadOnly}
                            />
                        </div>
                        <input 
                            className={getInputClasses(isReadOnly)}
                            placeholder="Site Web" 
                            value={config.website || ''}
                            onChange={(e) => setConfig({...config, website: e.target.value})}
                            readOnly={isReadOnly}
                        />
                    </div>

                    {!isReadOnly && (
                        <div className="lg:col-span-2 mt-4 pt-6 border-t border-slate-700/50 flex flex-col md:flex-row justify-end gap-4">
                            <button 
                                type="button"
                                onClick={() => loadConfig()} 
                                className="w-full md:w-auto bg-slate-700 hover:bg-slate-600 text-white font-bold py-4 px-10 rounded-xl transition-all uppercase tracking-wider text-sm"
                            >
                                Annuler
                            </button>
                            <button 
                                type="submit" 
                                className="w-full md:w-auto bg-gradient-to-r from-blue-600 via-blue-500 to-emerald-500 hover:from-blue-500 hover:to-emerald-400 text-white font-black py-4 px-10 rounded-xl transition-all duration-300 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] hover:-translate-y-1 transform uppercase tracking-wider text-sm"
                            >
                                {config.id ? "Enregistrer les modifications" : "Sauvegarder l'Identité"}
                            </button>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};

export default SchoolConfigForm;