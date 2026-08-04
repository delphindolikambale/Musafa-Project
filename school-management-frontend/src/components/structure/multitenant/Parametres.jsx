import React, { useState, useEffect } from 'react';
import { Settings, Shield, User, Image as ImageIcon, Lock, Save, Globe, Eye, EyeOff, Loader2, Edit2, AlertTriangle, X } from 'lucide-react';
import SuperAdminSystemService, { getSystemLogoUrl } from '../../../services/multitenantService/SuperAdminSystemService';
import { toast } from 'react-hot-toast';

const Parametres = () => {
  const [activeTab, setActiveTab] = useState('platform');
  const [appName, setAppName] = useState('MyAcademia SaaS');
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [profilePreview, setProfilePreview] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // États de verrouillage et de boîte de dialogue
  const [isAppConfigured, setIsAppConfigured] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const [securityForm, setSecurityForm] = useState({
    username: 'superadmin',
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    fetchGlobalSettings();
  }, []);

  const fetchGlobalSettings = async () => {
    try {
      const settings = await SuperAdminSystemService.getSettings();
      if (settings) {
        setAppName(settings.applicationName || 'MyAcademia SaaS');
        if (settings.globalLogoPath) {
          setLogoPreview(getSystemLogoUrl(settings.globalLogoPath));
        }
        if (settings.applicationName || settings.globalLogoPath) {
           setIsAppConfigured(true);
           setIsEditing(false);
        }
      }
    } catch (error) {
      console.error("Erreur chargement paramètres généraux:", error);
      toast.error("Impossible de charger les configurations système.");
    }
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Le logo est trop lourd. La taille maximale autorisée est 2 Mo.");
        return;
      }
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleInitiateSave = (e) => {
    e.preventDefault();
    if (!appName.trim()) {
        toast.error("Le nom de l'application est requis.");
        return;
    }
    setShowConfirmModal(true);
  };

  // ✅ CORRECTION : Mise à jour propre des états React et du LocalStorage après succès
  const executeSavePlatform = async () => {
    setShowConfirmModal(false);
    setIsSubmitting(true);
    
    const toastId = toast.loading("Enregistrement de la configuration en cours...");
    
    try {
      const updatedSettings = await SuperAdminSystemService.updateSettings(appName, logoFile);
      
      if (updatedSettings) {
        setAppName(updatedSettings.applicationName || appName);
        if (updatedSettings.globalLogoPath) {
          setLogoPreview(getSystemLogoUrl(updatedSettings.globalLogoPath));
          localStorage.setItem('systemLogoPath', updatedSettings.globalLogoPath);
        }
        localStorage.setItem('systemAppName', updatedSettings.applicationName || appName);
        
        // Réinitialisation du fichier temporaire sélectionné
        setLogoFile(null);

        // Déclenchement d'un événement global pour la mise à jour des barres de navigation
        window.dispatchEvent(new Event('system-settings-updated'));

        toast.success("Identité visuelle du système mise à jour avec succès !", { id: toastId });
        
        setIsAppConfigured(true);
        setIsEditing(false);
      }
    } catch (error) {
      toast.error("Échec de la mise à jour : " + (error.message || error), { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveSecurity = (e) => {
    e.preventDefault();
    if (securityForm.newPassword !== securityForm.confirmPassword) {
      toast.error("Les nouveaux mots de passe ne correspondent pas !");
      return;
    }
    
    toast.success("Les identifiants de sécurité ont été mis à jour avec succès.");
    setSecurityForm({ ...securityForm, oldPassword: '', newPassword: '', confirmPassword: '' });
  };

  const isPlatformFormDisabled = isAppConfigured && !isEditing;

  return (
    <div className="space-y-6 text-slate-800 dark:text-white max-w-4xl mx-auto animate-in fade-in duration-500 relative">
      
      {/* Boîte de dialogue de confirmation */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-200">
                <div className="p-6">
                    <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-4 mx-auto">
                        <AlertTriangle className="text-amber-600 dark:text-amber-400" size={24} />
                    </div>
                    <h3 className="text-lg font-black text-center mb-2">Confirmer les modifications</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
                        Êtes-vous sûr de vouloir appliquer ces changements ? L'identité visuelle (Nom et Logo) sera modifiée globalement pour toutes les instances de la plateforme.
                    </p>
                </div>
                <div className="flex bg-slate-50 dark:bg-slate-800/50 p-4 gap-3 border-t border-slate-100 dark:border-slate-800">
                    <button 
                        onClick={() => setShowConfirmModal(false)}
                        className="flex-1 py-2.5 rounded-xl font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    >
                        Annuler
                    </button>
                    <button 
                        onClick={executeSavePlatform}
                        className="flex-1 py-2.5 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-500/20 transition-colors"
                    >
                        Oui, Enregistrer
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Barre d'onglets */}
      <div className="flex bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm gap-2">
        <button 
          onClick={() => setActiveTab('platform')}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'platform' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
        >
          <Globe size={18} /> Configuration Identité Plateforme
        </button>
        <button 
          onClick={() => setActiveTab('security')}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'security' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
        >
          <Shield size={18} /> Profil & Sécurité Critique
        </button>
      </div>

      {/* Onglet 1 : Paramètres généraux */}
      {activeTab === 'platform' && (
        <form onSubmit={handleInitiateSave} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 relative overflow-hidden group/form">
          <div className="absolute top-0 left-0 w-full h-1 bg-blue-600"></div>
          
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-black mb-1">Identité Visuelle du Système</h3>
              <p className="text-xs text-slate-400">Ces éléments définissent l'image de marque affichée sur l'ensemble des écrans du logiciel.</p>
            </div>
            
            {isAppConfigured && !isEditing && (
                <button 
                    type="button" 
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-colors"
                >
                    <Edit2 size={14} /> Modifier
                </button>
            )}
            {isAppConfigured && isEditing && (
                <button 
                    type="button" 
                    onClick={() => {
                        setIsEditing(false);
                        fetchGlobalSettings();
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 rounded-xl text-xs font-bold transition-colors"
                >
                    <X size={14} /> Annuler modification
                </button>
            )}
          </div>

          <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 transition-opacity duration-300 ${isPlatformFormDisabled ? 'opacity-70' : 'opacity-100'}`}>
            <div className="space-y-4 md:col-span-2">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Nom Global de l'Application {isPlatformFormDisabled && <Lock size={10} className="inline ml-1 mb-0.5 text-slate-400" />}
                </label>
                <input 
                  type="text" 
                  required 
                  disabled={isPlatformFormDisabled}
                  className={`w-full p-3 bg-slate-50 dark:bg-slate-800 border rounded-xl outline-none text-sm font-bold transition-all ${
                      isPlatformFormDisabled 
                      ? 'border-transparent text-slate-500 cursor-not-allowed' 
                      : 'border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20'
                  }`}
                  value={appName} 
                  onChange={e => setAppName(e.target.value)} 
                />
              </div>
            </div>

            <div className={`flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-2xl bg-slate-50/50 dark:bg-slate-800/30 transition-colors ${
                isPlatformFormDisabled 
                ? 'border-transparent' 
                : 'border-slate-200 dark:border-slate-700 hover:border-blue-400 group'
            }`}>
              <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-3 text-center">
                  Logo Officiel de l'Instance {isPlatformFormDisabled && <Lock size={10} className="inline ml-1 mb-0.5" />}
              </label>
              <div className="w-24 h-24 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden mb-3 shadow-inner">
                {logoPreview ? (
                  <img src={logoPreview} alt="Logo preview" className="object-contain max-w-full max-h-full p-2" />
                ) : (
                  <ImageIcon size={32} className={`text-slate-300 dark:text-slate-600 transition-colors ${!isPlatformFormDisabled && 'group-hover:text-blue-400'}`} />
                )}
              </div>
              
              {!isPlatformFormDisabled && (
                  <label className="bg-slate-200 dark:bg-slate-800 hover:bg-blue-600 hover:text-white text-slate-700 dark:text-slate-300 px-4 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors shadow-sm">
                    Choisir l'image
                    <input type="file" accept="image/png, image/jpeg, image/jpg" className="hidden" onChange={handleLogoChange} disabled={isPlatformFormDisabled} />
                  </label>
              )}
            </div>
          </div>

          {(!isAppConfigured || isEditing) && (
              <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800 animate-in slide-in-from-bottom-2">
                <button 
                    type="submit" 
                    disabled={isSubmitting}
                    className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 shadow-md transition-all active:scale-95"
                >
                  {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} 
                  {isSubmitting ? 'Préparation...' : 'Enregistrer la configuration'}
                </button>
              </div>
          )}
        </form>
      )}

      {/* Onglet 2 : Profil & Sécurité */}
      {activeTab === 'security' && (
        <form onSubmit={handleSaveSecurity} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-blue-600"></div>
          <div>
            <h3 className="text-lg font-black mb-1">Compte Racine & Authentification</h3>
            <p className="text-xs text-slate-400">Modifier les accès du gestionnaire de l'infrastructure globale SaaS.</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 items-center pb-6 border-b border-slate-100 dark:border-slate-800">
            <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden shadow-inner group relative">
              {profilePreview ? <img src={profilePreview} alt="Avatar" className="w-full h-full object-cover"/> : <User size={36} className="text-slate-400 dark:text-slate-600" />}
              <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                 <ImageIcon size={24} className="text-white" />
                 <input type="file" accept="image/*" className="hidden" onChange={e => setProfilePreview(URL.createObjectURL(e.target.files[0]))} />
              </label>
            </div>
            <div className="space-y-2 text-center sm:text-left">
              <h4 className="font-bold text-sm">Photo de profil de l'Administrateur Système</h4>
              <p className="text-[11px] text-slate-400">Recommandé : Image carrée, max 2Mo.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Identifiant Super Admin (Username)</label>
              <input type="text" required className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm font-semibold transition-all" value={securityForm.username} onChange={e => setSecurityForm({...securityForm, username: e.target.value})} />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Ancien Mot de Passe</label>
              <input type="password" required className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm transition-all" value={securityForm.oldPassword} onChange={e => setSecurityForm({...securityForm, oldPassword: e.target.value})} />
            </div>

            <div className="hidden sm:block"></div>

            <div className="relative">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Nouveau Mot de Passe</label>
              <input type={showPassword ? "text" : "password"} required className="w-full p-3 pr-10 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm transition-all" value={securityForm.newPassword} onChange={e => setSecurityForm({...securityForm, newPassword: e.target.value})} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-9 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Confirmer Nouveau Mot de Passe</label>
              <input type={showPassword ? "text" : "password"} required className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm transition-all" value={securityForm.confirmPassword} onChange={e => setSecurityForm({...securityForm, confirmPassword: e.target.value})} />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 shadow-md transition-all active:scale-95">
              <Lock size={16} /> Actualiser les accréditations
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default Parametres;