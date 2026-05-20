import React from 'react';

const PrintTemplate = ({ title, children }) => {
    const today = new Date().toLocaleDateString('fr-FR');

    return (
        <div className="print-only p-10">
            {/* En-tête Professionnel */}
            <div className="flex justify-between items-center border-b-2 border-blue-900 pb-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-blue-900">MUSAFA SYSTEM</h1>
                    <p className="text-sm text-gray-600">Complexe Scolaire de Référence</p>
                    <p className="text-xs text-gray-500">République Démocratique du Congo</p>
                </div>
                <div className="text-right">
                    <h2 className="text-xl font-semibold uppercase">{title}</h2>
                    <p className="text-sm italic">Date d'édition : {today}</p>
                </div>
            </div>

            {/* Contenu (Le tableau) */}
            <div className="print-content">
                {children}
            </div>

            {/* Pied de page */}
            <div className="fixed bottom-0 left-0 w-full border-t border-gray-300 pt-2 text-center text-[10px] text-gray-400">
                <p>Document généré par MUSAFA System - Page 1/1</p>
                <p>Signature de l'Administrateur : __________________________</p>
            </div>
        </div>
    );
};

export default PrintTemplate;