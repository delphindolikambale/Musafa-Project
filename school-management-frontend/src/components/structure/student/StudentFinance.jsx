import React, { useState, useEffect } from 'react';
import MyStudentFinanceService from '../../../services/pedagogieService/MyStudentFinanceService';

const StudentFinance = () => {
  const [financialData, setFinancialData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFinancialStatus = async () => {
      try {
        setLoading(true);
        const data = await MyStudentFinanceService.getMyCurrentFinancialStatus();
        setFinancialData(data);
        setError(null);
      } catch (err) {
        console.error("Erreur lors de la récupération des données financières", err);
        setError("Impossible de charger votre situation financière. Veuillez réessayer ultérieurement.");
      } finally {
        setLoading(false);
      }
    };

    fetchFinancialStatus();
  }, []);

  // Formateur de devises dynamique
  const formatCurrency = (amount, currencyCode) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currencyCode || 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  // Formateur de date standardisé
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Chargement de votre situation financière...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 mx-auto max-w-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40 rounded-2xl text-center">
        <p className="text-sm font-semibold text-red-800 dark:text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-2 sm:p-6 max-w-7xl mx-auto">
      
      {/* 🌟 BANNIÈRE D'ENTÊTE - Dégradé Vert & Bleu de nuit */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-500 via-slate-900 to-slate-950 p-6 sm:p-8 text-white shadow-lg">
        <div className="relative z-10 space-y-2">
          <span className="inline-block px-3 py-1 text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 rounded-full border border-emerald-500/30">
            Espace Élève
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Ma Situation Financière
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            Retrouvez ici l'état global de vos frais scolaires, vos soldes en cours ainsi que l'historique complet de vos versements comptabilisés.
          </p>
        </div>
        {/* Motif décoratif en arrière-plan */}
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none translate-x-10 translate-y-10">
          <svg width="300" height="300" fill="currentColor" viewBox="0 0 24 24">
            <path d="M21 18v1c0 1.1-.9 2-2 2H5c-1.11 0-2-.9-2-2V5c0-1.1.89-2 2-2h14c1.1 0 2 .9 2 2v1h-9c-1.11 0-2 .9-2 2v8c0 1.1.89 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
          </svg>
        </div>
      </div>

      {/* 📋 BARRE D'INFORMATIONS DE COMPTE */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-xs sm:text-sm">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-400">
            <span className="font-bold">N° Compte :</span>
          </div>
          <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{financialData?.accountNumber || '-'}</span>
        </div>
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-400">
            <span className="font-bold">Classe :</span>
          </div>
          <span className="font-semibold text-slate-800 dark:text-slate-200">{financialData?.className || '-'}</span>
        </div>
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-400">
            <span className="font-bold">Année Académique :</span>
          </div>
          <span className="font-semibold text-slate-800 dark:text-slate-200">{financialData?.academicYear || '-'}</span>
        </div>
      </div>

      {/* 📊 CARTES DE STATISTIQUES FINANCIÈRES */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Carte : Total Attendu */}
        <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Total Frais Fixés</p>
            <span className="p-2 bg-blue-50 dark:bg-blue-950/40 text-blue-500 dark:text-blue-400 rounded-2xl text-xs font-bold">Fixé</span>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black text-slate-800 dark:text-white">
              {formatCurrency(financialData?.totalAmountDue, financialData?.currency)}
            </h3>
            <p className="text-[11px] text-slate-400 mt-1">Montant global requis pour l'année</p>
          </div>
        </div>

        {/* Carte : Total Payé - Dégradé Vert */}
        <div className="p-6 bg-gradient-to-br from-emerald-500 to-teal-700 rounded-3xl text-white shadow-md flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-200">Total Versements</p>
            <span className="p-2 bg-white/20 text-white rounded-2xl text-xs font-bold">Payé</span>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-black">
              {formatCurrency(financialData?.totalAmountPaid, financialData?.currency)}
            </h3>
            <p className="text-[11px] text-emerald-100 mt-1">Cumul de tous vos reçus validés</p>
          </div>
        </div>

        {/* Carte : Solde Restant - Dégradé Bleu & Orange */}
        <div className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="flex justify-between items-start z-10 relative">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Solde Restant</p>
            <span className={`p-2 rounded-2xl text-xs font-bold ${
              (financialData?.balance > 0) 
                ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400' 
                : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
            }`}>
              {(financialData?.balance > 0) ? 'Reste à payer' : 'En ordre'}
            </span>
          </div>
          <div className="mt-4 z-10 relative">
            <h3 className={`text-2xl font-black ${financialData?.balance > 0 ? 'text-orange-500' : 'text-slate-800 dark:text-white'}`}>
              {formatCurrency(financialData?.balance, financialData?.currency)}
            </h3>
            <p className="text-[11px] text-slate-400 mt-1">Montant net restant à régulariser</p>
          </div>
          {/* Ligne d'accentuation en dégradé Bleu & Orange tout en bas de la carte de solde */}
          <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 to-orange-500"></div>
        </div>

      </div>

      {/* 📈 ÉVOLUTION DES PAIEMENTS PAR TRANCHE */}
      {financialData?.installments && financialData.installments.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl text-emerald-600 dark:text-emerald-400">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Suivi de progression par Tranche
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {financialData.installments.map((installment) => {
              // Calcul du pourcentage d'avancement
              const percent = installment.amountRequired > 0 
                ? Math.min(100, Math.round((installment.amountPaid / installment.amountRequired) * 100)) 
                : 100;

              return (
                <div key={installment.installmentId} className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 rounded-2xl space-y-4 hover:border-slate-200 dark:hover:border-slate-700 transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-sm font-black text-slate-800 dark:text-slate-200">
                        Tranche {installment.installmentNumber}
                      </h4>
                      <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                        Échéance : <span className="font-semibold text-slate-700 dark:text-slate-300">{formatDate(installment.dueDate)}</span>
                      </p>
                    </div>
                    
                    <div className="text-right">
                      {installment.fullyPaid ? (
                        <span className="inline-flex items-center px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold uppercase rounded">
                          <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                          Soldé
                        </span>
                      ) : (
                        <span className="inline-block px-2 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-[10px] font-bold uppercase rounded">
                          Reste: {formatCurrency(installment.remainingAmount, financialData.currency)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Détail montants et barre de progression */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(installment.amountPaid, financialData.currency)} payé
                      </span>
                      <span className="text-slate-400 font-medium">
                        sur {formatCurrency(installment.amountRequired, financialData.currency)}
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden">
                      <div 
                        className={`h-2.5 rounded-full transition-all duration-1000 ease-out ${
                          installment.fullyPaid 
                            ? 'bg-emerald-500' 
                            : 'bg-gradient-to-r from-blue-500 to-emerald-400'
                        }`}
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 🗓️ TABLEAU DES TRANSACTIONS / HISTORIQUE */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Historique Chronologique des Paiements
          </h2>
          <span className="px-2.5 py-1 text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full">
            {financialData?.paymentHistory?.length || 0} transaction(s)
          </span>
        </div>

        {/* Gestion responsive du tableau */}
        <div className="overflow-x-auto w-full">
          {!financialData?.paymentHistory || financialData.paymentHistory.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <div className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-slate-400 dark:text-slate-500">Aucun paiement n'a été enregistré pour le moment.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-emerald-600 dark:bg-emerald-700 text-white text-[11px] font-bold uppercase tracking-wider">
                  <th className="py-3 px-4 rounded-tl-none">N° Reçu</th>
                  <th className="py-3 px-4">Intitulé / Motif de paiement</th>
                  <th className="py-3 px-4">Date de Versement</th>
                  <th className="py-3 px-4">Méthode</th>
                  <th className="py-3 px-4 text-right rounded-tr-none">Montant Versé</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs text-slate-700 dark:text-slate-300">
                {/* 🟢 TRI EFFECTUÉ ICI : Création d'une copie du tableau et tri par date décroissante */}
                {[...financialData.paymentHistory]
                  .sort((a, b) => new Date(b.paymentDate) - new Date(a.paymentDate))
                  .map((payment, index) => (
                  <tr 
                    key={payment.paymentId || index}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    {/* Numéro de reçu */}
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-slate-200">
                      {payment.receiptNumber || `REC-${payment.paymentId}`}
                    </td>
                    
                    {/* Libellé / Motif principal */}
                    <td className="py-3.5 px-4 font-semibold">
                      {payment.mainPurpose}
                    </td>
                    
                    {/* Date formatée */}
                    <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">
                      {formatDate(payment.paymentDate)}
                    </td>
                    
                    {/* Méthode de paiement sous forme de badge discret */}
                    <td className="py-3.5 px-4">
                      <span className="inline-block px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium text-[10px] uppercase">
                        {payment.paymentMethod || 'Espèces'}
                      </span>
                    </td>
                    
                    {/* Montant aligné à droite */}
                    <td className="py-3.5 px-4 text-right font-black text-emerald-600 dark:text-emerald-400 text-sm">
                      {formatCurrency(payment.amountPaid, payment.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

    </div>
  );
};

export default StudentFinance;