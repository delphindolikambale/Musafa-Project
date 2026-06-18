import React, { useState, useEffect } from 'react';
import { Calendar, ShieldCheck, RefreshCw, CreditCard, Smartphone, Banknote, Search, AlertCircle, CheckCircle2, Key } from 'lucide-react';
import SuperAdminSystemService from '../../../services/multitenantService/SuperAdminSystemService';

const Abonnement = () => {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showRenewModal, setShowRenewModal] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState(null);
  
  const [renewForm, setRenewForm] = useState({
    months: 12,
    paymentMethod: "CASH",
    amountPaid: 0,
    referenceNumber: ""
  });

  useEffect(() => {
    loadSchoolsData();
  }, []);

  const loadSchoolsData = async () => {
    try {
      setLoading(true);
      const data = await SuperAdminSystemService.getAllSchools();
      setSchools(data);
    } catch (error) {
      console.error("Erreur abonnements:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenRenew = (school) => {
    setSelectedSchool(school);
    setRenewForm({
      months: 12,
      paymentMethod: "CASH",
      amountPaid: 0,
      referenceNumber: ""
    });
    setShowRenewModal(true);
  };

  const handleRenewSubmit = async (e) => {
    e.preventDefault();
    try {
      // Étape 1 : Prolongation de l'abonnement sur le backend
      const updated = await SuperAdminSystemService.renewSchoolSubscription(selectedSchool.id, renewForm.months);
      
      // Mise à jour de l'état local
      setSchools(schools.map(s => s.id === selectedSchool.id ? updated : s));
      setShowRenewModal(false);
      alert(`Abonnement mis à jour avec succès pour ${selectedSchool.name}. Un token d'activation a été assigné.`);
    } catch (error) {
      alert("Erreur lors du renouvellement : " + (error.message || error));
    }
  };

  const filteredSchools = schools.filter(s => 
    s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in text-slate-800 dark:text-white">
      {/* En-tête */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 text-orange-600 rounded-xl flex items-center justify-center">
            <Calendar size={24} />
          </div>
          <div>
            <h2 className="text-xl font-black">Gestion des Abonnements</h2>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Suivi des licences d'exploitation et renouvellement des passerelles de paiement.</p>
          </div>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text" 
            placeholder="Filtrer par école..." 
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:border-orange-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Grille des Écoles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-12 text-slate-500 font-medium">Analyse des abonnements en cours...</div>
        ) : filteredSchools.length === 0 ? (
          <div className="col-span-full text-center py-12 text-slate-500 font-medium">Aucun établissement trouvé.</div>
        ) : (
          filteredSchools.map((school) => {
            const isExpired = school.currentSubscriptionStatus !== 'ACTIF';
            return (
              <div key={school.id} className={`bg-white dark:bg-slate-900 rounded-2xl border ${isExpired ? 'border-red-200 dark:border-red-950 shadow-red-500/5' : 'border-slate-200 dark:border-slate-800'} p-5 shadow-sm relative overflow-hidden flex flex-col justify-between`}>
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-black text-xs text-slate-500 tracking-wider mb-1 inline-block">
                        {school.code}
                      </span>
                      <h3 className="font-bold text-lg leading-tight line-clamp-1">{school.name}</h3>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-black ${!isExpired ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                      {school.currentSubscriptionStatus || (school.active ? 'ACTIF' : 'EXPIRED')}
                    </span>
                  </div>

                  <div className="space-y-2.5 my-4 border-t border-b border-slate-100 dark:border-slate-800 py-3 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-medium">Échéance licence :</span>
                      <span className="font-bold">
                        {school.subscriptionEndDate ? new Date(school.subscriptionEndDate).toLocaleDateString('fr-FR') : 'Aucune date'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-medium">Quota Élèves :</span>
                      <span className="font-bold text-slate-600 dark:text-slate-300">{school.maxStudentsAllowed || 1000} maximum</span>
                    </div>
                    {school.activationCode && (
                      <div className="mt-2 p-2 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200/40 text-amber-800 dark:text-amber-400 font-mono flex items-center justify-between">
                        <span className="flex items-center gap-1"><Key size={12}/> Sec-Token:</span>
                        <span className="font-black tracking-wider">{school.activationCode}</span>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handleOpenRenew(school)}
                  className={`w-full mt-2 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${isExpired ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-slate-100 dark:bg-slate-800 hover:bg-orange-500 hover:text-white dark:hover:bg-orange-600 text-slate-700 dark:text-slate-300'}`}
                >
                  <RefreshCw size={14} />
                  Réactiver / Prolonger l'abonnement
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* MODAL DE CONFIGURATION DE L'ABONNEMENT */}
      {showRenewModal && selectedSchool && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md p-6 rounded-2xl shadow-xl animate-scale-up">
            <h3 className="text-lg font-black flex items-center gap-2 mb-1">
              <ShieldCheck className="text-orange-500" size={22} /> Paramétrer la Licence SaaS
            </h3>
            <p className="text-xs text-slate-500 mb-4">Établissement cible : <span className="font-bold">{selectedSchool.name}</span></p>

            <form onSubmit={handleRenewSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Durée contractuelle</label>
                <select 
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-orange-500 text-sm font-semibold"
                  value={renewForm.months}
                  onChange={e => setRenewForm({...renewForm, months: parseInt(e.target.value)})}
                >
                  <option value={1}>1 Mois (Formule Mensuelle)</option>
                  <option value={3}>3 Mois (Formule Trimestrielle)</option>
                  <option value={6}>6 Mois (Formule Semestrielle)</option>
                  <option value={12}>12 Mois (Année Scolaire Entière)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Méthode de Paiement Imposée</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'CASH', label: 'Cash', icon: <Banknote size={16} /> },
                    { id: 'CREDIT_CARD', label: 'Carte Bancaire', icon: <CreditCard size={16} /> },
                    { id: 'AIRTEL_MONEY', label: 'Airtel Money', icon: <Smartphone size={16} /> }
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setRenewForm({...renewForm, paymentMethod: m.id})}
                      className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 font-bold text-[11px] transition-all ${renewForm.paymentMethod === m.id ? 'border-orange-500 bg-orange-500/10 text-orange-500' : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
                    >
                      {m.icon}
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Montant Perçu ($)</label>
                  <input type="number" required min={0} className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:border-orange-500 font-bold" value={renewForm.amountPaid} onChange={e => setRenewForm({...renewForm, amountPaid: parseFloat(e.target.value) || 0})} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Numéro Référence / Reçu</label>
                  <input type="text" placeholder="Ex: TX-90872" className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:border-orange-500 font-medium" value={renewForm.referenceNumber} onChange={e => setRenewForm({...renewForm, referenceNumber: e.target.value})} />
                </div>
              </div>

              <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 text-[11px] text-blue-700 dark:text-blue-400 rounded-xl font-medium flex gap-2">
                <AlertCircle size={18} className="shrink-0" />
                <span>La validation générera une mise à jour immédiate du statut de l'école. Si celle-ci était bloquée, ses accès seront instantanément rétablis.</span>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowRenewModal(false)} className="px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800">Annuler</button>
                <button type="submit" className="px-5 py-2 bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-xl text-sm font-bold shadow-md">Valider & Débloquer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Abonnement;