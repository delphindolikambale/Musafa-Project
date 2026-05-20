import React, { useState } from 'react';
import SchoolConfigForm from './SchoolConfigForm';

const SettingsDashboard = () => {
    // États pour la navigation et la recherche
    const [activeSection, setActiveSection] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    // Configuration des options du Hub (Style Liste Professionnelle)
    const settingsOptions = [
        {
            id: 'school_info',
            title: "Infos de l'Institution",
            description: "Identité officielle, logo et autorités signataires.",
            icon: "🏛️",
            colorClass: "text-blue-500",
            bgGradient: "from-blue-600 to-blue-400",
            borderColor: "border-blue-500/20"
        },
        {
            id: 'users',
            title: "Comptes & Sécurité",
            description: "Permissions, rôles et protection des données.",
            icon: "🛡️",
            colorClass: "text-emerald-500",
            bgGradient: "from-emerald-600 to-emerald-400",
            borderColor: "border-emerald-500/20"
        },
        {
            id: 'notifications',
            title: "Communications & Alertes",
            description: "Configuration des SMS, emails et push système.",
            icon: "🔔",
            colorClass: "text-orange-500",
            bgGradient: "from-orange-600 to-orange-400",
            borderColor: "border-orange-500/20"
        },
        {
            id: 'academic',
            title: "Paramètres Académiques",
            description: "Formats des bulletins, mentions et pondérations.",
            icon: "🎓",
            colorClass: "text-blue-700",
            bgGradient: "from-blue-900 to-blue-700",
            borderColor: "border-blue-700/20"
        },
        {
            id: 'backup',
            title: "Maintenance & Backup",
            description: "Sauvegardes cloud, exports Excel et logs.",
            icon: "💾",
            colorClass: "text-slate-500",
            bgGradient: "from-slate-700 to-slate-500",
            borderColor: "border-slate-500/20"
        }
    ];

    // Filtrage pour la barre de recherche
    const filteredOptions = settingsOptions.filter(option =>
        option.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        option.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Vue du formulaire spécifique
    if (activeSection === 'school_info') {
        return (
            <div className="animate-in fade-in zoom-in-95 duration-300">
                <button 
                    onClick={() => setActiveSection(null)}
                    className="group mb-6 flex items-center gap-2 text-[#0a1128] hover:text-blue-600 font-bold transition-all"
                >
                    <span className="bg-white p-2 rounded-full shadow-sm group-hover:shadow-md transition-all">⬅️</span>
                    {/* Modification : Capitalize et font-black pour le bouton retour */}
                    <span className="capitalize text-sm font-black tracking-tight">Retour aux paramètres</span>
                </button>
                <SchoolConfigForm />
            </div>
        );
    }

    // Vue principale (Style Liste Compacte)
    return (
        <div className="max-w-4xl mx-auto p-4 animate-in fade-in duration-500">
            {/* Header et Barre de Recherche */}
            <div className="mb-8">
                {/* Modification : Titre principal en Capitalize et font-black */}
                <h2 className="text-3xl font-black text-[#0a1128] capitalize tracking-tight mb-4">
                    Paramètres
                </h2>
                
                <div className="relative group">
                    <span className="absolute inset-y-0 left-4 flex items-center text-slate-400 group-focus-within:text-blue-500 transition-colors">
                        🔍
                    </span>
                    <input 
                        type="text" 
                        placeholder="Rechercher un paramètre..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-slate-100 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all text-slate-700 font-medium"
                    />
                </div>
            </div>

            {/* Liste des Options */}
            <div className="space-y-3">
                {filteredOptions.length > 0 ? (
                    filteredOptions.map((option) => (
                        <button
                            key={option.id}
                            onClick={() => setActiveSection(option.id)}
                            className={`
                                w-full flex items-center gap-4 p-3 bg-white border ${option.borderColor} 
                                rounded-2xl hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-x-1
                                transition-all duration-300 group text-left
                            `}
                        >
                            {/* Icône avec dégradé circulaire */}
                            <div className={`
                                w-12 h-12 shrink-0 rounded-xl bg-gradient-to-br ${option.bgGradient} 
                                flex items-center justify-center text-xl shadow-lg shadow-inherit/20
                            `}>
                                {option.icon}
                            </div>

                            {/* Textes */}
                            <div className="flex-1 overflow-hidden">
                                {/* 
                                    MODIFICATIONS EFFECTUÉES ICI :
                                    - Remplacement de 'uppercase' par 'capitalize'
                                    - Remplacement de 'font-bold' par 'font-black' (Black Bolder)
                                    - Légère augmentation de la taille du texte à 'text-base' pour compenser le style capitalize
                                */}
                                <h3 className="text-slate-800 font-black text-base capitalize tracking-tight group-hover:text-blue-600 transition-colors">
                                    {option.title}
                                </h3>
                                <p className="text-slate-400 text-xs truncate font-medium">
                                    {option.description}
                                </p>
                            </div>

                            {/* Flèche Chevron */}
                            <div className="text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all px-2">
                                <span className="text-xl font-light">›</span>
                            </div>
                        </button>
                    ))
                ) : (
                    <div className="text-center py-10">
                        <p className="text-slate-400 font-medium italic">Aucun résultat pour "{searchTerm}"</p>
                    </div>
                )}
            </div>

            {/* Footer de version */}
            <div className="mt-12 pt-6 border-t border-slate-100 flex justify-between items-center px-2">
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                    Système de Gestion Scolaire • v2.4.0
                </span>
                <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                </div>
            </div>
        </div>
    );
};

export default SettingsDashboard;