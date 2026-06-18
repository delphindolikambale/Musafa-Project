import React, { useState, useEffect } from 'react';
import { Settings, Shield, User, Image, Lock, Save, Globe, Eye, EyeOff } from 'lucide-react';
import SuperAdminSystemService from '../../../services/multitenantService/SuperAdminSystemService';

const Parametres = () => {
  const [activeTab, setActiveTab] = useState('platform');
  const [appName, setAppName] = useState('MyAcademia SaaS');
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [profilePreview, setProfilePreview] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

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
        if (settings.logoPath) setLogoPreview(settings.logoPath);
      }
    } catch (error) {
      console.error("Erreur chargement paramètres généraux:", error);
    }
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleSavePlatform = async (e) => {
    e.preventDefault();
    try {
      await SuperAdminSystemService.updateSettings(appName, logoFile);
      alert("Configuration de la plateforme enregistrée avec succès.");
    } catch (error) {
      alert("Erreur lors de la mise à jour : " + error);
    }
  };

  const handleSaveSecurity = (e) => {
    e.preventDefault();
    if (securityForm.newPassword !== securityForm.confirmPassword) {
      alert("Les nouveaux mots de passe ne correspondent pas.");
      return;
    }
    alert("Identifiants de sécurité mis à jour.");
    setSecurityForm({ ...securityForm, oldPassword: '', newPassword: '', confirmPassword: '' });
  };

  return (
    <div className="space-y-6 text-slate-800 dark:text-white max-w-4xl mx-auto">
      {/* Barre d'onglets */}
      <div className="flex bg-white dark:bg-slate-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm gap-2">
        <button 
          onClick={() => setActiveTab('platform')}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'platform' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
        >
          <Globe size={18} /> Configuration Identité Platforme
        </button>
        <button 
          onClick={() => setActiveTab('security')}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'security' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
        >
          <Shield size={18} /> Profil & Sécurité Critique
        </button>
      </div>

      {/* Contenu Onglet 1 : Paramètres généraux */}
      {activeTab === 'platform' && (
        <form onSubmit={handleSavePlatform} className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-blue-600"></div>
          <div>
            <h3 className="text-lg font-black mb-1">Identité Visuelle du Système</h3>
            <p className="text-xs text-slate-400">Ces éléments définissent l'image de marque affichée sur les portails de connexion des écoles.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4 md:col-span-2">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Nom Global de l'Application</label>
                <input 
                  type="text" 
                  required 
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-500 text-sm font-bold" 
                  value={appName} 
                  onChange={e => setAppName(e.target.value)} 
                />
              </div>
            </div>

            <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-950/20">
              <label className="block text-xs font-black text-slate-400 uppercase tracking-wider mb-3 text-center">Logo Officiel de l'Instance</label>
              <div className="w-24 h-24 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden mb-3 shadow-inner">
                {logoPreview ? (
                  <img src={logoPreview} alt="Logo preview" className="object-contain max-w-full max-h-full p-2" />
                ) : (
                  <Image size={32} className="text-slate-300" />
                )}
              </div>
              <label className="bg-slate-200 dark:bg-slate-800 hover:bg-blue-600 hover:text-white text-slate-700 dark:text-slate-300 px-4 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors">
                Choisir l'image
                <input type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
              </label>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
            <button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 shadow-md">
              <Save size={16} /> Enregistrer la configuration
            </button>
          </div>
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
            <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden shadow-inner">
              {profilePreview ? <img src={profilePreview} alt="Avatar" className="w-full h-full object-cover"/> : <User size={36} className="text-slate-400" />}
            </div>
            <div className="space-y-2 text-center sm:text-left">
              <h4 className="font-bold text-sm">Photo de profil de l'Administrateur Système</h4>
              <label className="inline-block bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer hover:bg-slate-200">
                Changer l'image
                <input type="file" accept="image/*" className="hidden" onChange={e => setProfilePreview(URL.createObjectURL(e.target.files[0]))} />
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Identifiant Super Admin (Username)</label>
              <input type="text" required className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-500 text-sm font-semibold" value={securityForm.username} onChange={e => setSecurityForm({...securityForm, username: e.target.value})} />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Ancien Mot de Passe</label>
              <input type="password" required className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-500 text-sm" value={securityForm.oldPassword} onChange={e => setSecurityForm({...securityForm, oldPassword: e.target.value})} />
            </div>

            <div className="hidden sm:block"></div>

            <div className="relative">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Nouveau Mot de Passe</label>
              <input type={showPassword ? "text" : "password"} required className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-500 text-sm" value={securityForm.newPassword} onChange={e => setSecurityForm({...securityForm, newPassword: e.target.value})} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-9 text-slate-400 hover:text-slate-600">
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Confirmer Nouveau Mot de Passe</label>
              <input type={showPassword ? "text" : "password"} required className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-blue-500 text-sm" value={securityForm.confirmPassword} onChange={e => setSecurityForm({...securityForm, confirmPassword: e.target.value})} />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 shadow-md">
              <Lock size={16} /> Actualiser les accréditations
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default Parametres;