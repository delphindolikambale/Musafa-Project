import React from 'react';

const PrintHeader = ({ title }) => {
    const date = new Date().toLocaleDateString('fr-FR', {
        year: 'numeric', month: 'long', day: 'numeric'
    });

    return (
        <div className="mb-8 border-b-4 border-blue-900 pb-4">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-black text-blue-900">MUSAFASystem</h1>
                    <p className="text-sm font-bold text-gray-600 uppercase tracking-widest">Complexe Scolaire de Référence</p>
                    <p className="text-xs text-gray-500">Direction Administrative & Pédagogique</p>
                </div>
                <div className="text-right">
                    <h2 className="text-xl font-bold uppercase text-gray-800 underline">{title}</h2>
                    <p className="text-sm mt-1 text-gray-600 font-medium">Édité le : {date}</p>
                </div>
            </div>
        </div>
    );
};

export default PrintHeader;