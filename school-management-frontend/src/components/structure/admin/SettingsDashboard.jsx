import React, { useState } from 'react';
import { 
    ArrowLeft, 
    Search, 
    Building2, 
    ShieldCheck, 
    BellRing, 
    GraduationCap, 
    HardDrive,
    FileSignature,
    LayoutTemplate
} from 'lucide-react';
import SchoolConfigForm from './SchoolConfigForm';
import BulletinHeaderForm from './BulletinHeaderForm';
import BulletinFormatForm from './BulletinFormatForm';

const SettingsDashboard = () => {
    // États pour la navigation et la recherche
    const [activeSection, setActiveSection] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    // Configuration des options du Hub
    const settingsOptions = [
        {
            id: 'school_info',
            title: "Infos de l'Institution",
            description: "Identité officielle, logo et autorités signataires.",
            icon: <Building2 size={24} />,
            colorClass: "text-blue-600 dark:text-blue-400",
            bgGradient: "bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800",
            hoverRing: "hover:border-blue-400 dark:hover:border-blue-600"
        },
        {
            id: 'bulletin_header',
            title: "En-tête Bulletin RDC",
            description: "Configuration du format national (Drapeau, Ministère, Filigrane).",
            icon: <FileSignature size={24} />,
            colorClass: "text-indigo-600 dark:text-indigo-400",
            bgGradient: "bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800",
            hoverRing: "hover:border-indigo-400 dark:hover:border-indigo-600"
        },
        {
            id: 'bulletin_format',
            title: "Format Bulletin",
            description: "Gestion des grilles d'évaluation (Maternelle, Primaire, Secondaire).",
            icon: <LayoutTemplate size={24} />,
            colorClass: "text-pink-600 dark:text-pink-400",
            bgGradient: "bg-pink-50 dark:bg-pink-900/30 border border-pink-200 dark:border-pink-800",
            hoverRing: "hover:border-pink-400 dark:hover:border-pink-600"
        },
        {
            id: 'academic',
            title: "Paramètres Académiques",
            description: "Mentions, pondérations et règles de passage.",
            icon: <GraduationCap size={24} />,
            colorClass: "text-violet-600 dark:text-violet-400",
            bgGradient: "bg-violet-50 dark:bg-violet-900/30 border border-violet-200 dark:border-violet-800",
            hoverRing: "hover:border-violet-400 dark:hover:border-violet-600"
        },
        {
            id: 'users',
            title: "Comptes & Sécurité",
            description: "Permissions, rôles et protection des données.",
            icon: <ShieldCheck size={24} />,
            colorClass: "text-emerald-600 dark:text-emerald-400",
            bgGradient: "bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800",
            hoverRing: "hover:border-emerald-400 dark:hover:border-emerald-600"
        },
        {
            id: 'notifications',
            title: "Communications & Alertes",
            description: "Configuration des SMS, emails et push système.",
            icon: <BellRing size={24} />,
            colorClass: "text-orange-600 dark:text-orange-400",
            bgGradient: "bg-orange-50 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-800",
            hoverRing: "hover:border-orange-400 dark:hover:border-orange-600"
        },
        {
            id: 'backup',
            title: "Maintenance & Sauvegarde",
            description: "Sauvegardes cloud, exports Excel et logs systèmes.",
            icon: <HardDrive size={24} />,
            colorClass: "text-slate-600 dark:text-slate-400",
            bgGradient: "bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700",
            hoverRing: "hover:border-slate-400 dark:hover:border-slate-500"
        }
    ];

    const filteredOptions = settingsOptions.filter(option =>
        option.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        option.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Vues spécifiques
    if (activeSection === 'school_info') {
        return (
            <div className="animate-in fade-in zoom-in-95 duration-300 w-full max-w-5xl mx-auto">
                <button onClick={() => setActiveSection(null)} className="group mb-6 flex items-center gap-3 text-slate-800 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 transition-all">
                    <span className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl shadow-sm group-hover:shadow-md transition-all">
                        <ArrowLeft size={18} />
                    </span>
                    <span className="capitalize text-sm font-black tracking-tight">Retour aux paramètres</span>
                </button>
                <SchoolConfigForm />
            </div>
        );
    }

    if (activeSection === 'bulletin_header') {
        return (
            <div className="animate-in fade-in zoom-in-95 duration-300 w-full max-w-5xl mx-auto">
                <button onClick={() => setActiveSection(null)} className="group mb-6 flex items-center gap-3 text-slate-800 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all">
                    <span className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl shadow-sm group-hover:shadow-md transition-all">
                        <ArrowLeft size={18} />
                    </span>
                    <span className="capitalize text-sm font-black tracking-tight">Retour aux paramètres</span>
                </button>
                <BulletinHeaderForm />
            </div>
        );
    }

    // Vue pour le nouveau Format Bulletin
    if (activeSection === 'bulletin_format') {
        return (
            <div className="animate-in fade-in zoom-in-95 duration-300 w-full max-w-5xl mx-auto">
                <button onClick={() => setActiveSection(null)} className="group mb-6 flex items-center gap-3 text-slate-800 dark:text-slate-200 hover:text-pink-600 dark:hover:text-pink-400 transition-all">
                    <span className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl shadow-sm group-hover:shadow-md transition-all">
                        <ArrowLeft size={18} />
                    </span>
                    <span className="capitalize text-sm font-black tracking-tight">Retour aux paramètres</span>
                </button>
                <BulletinFormatForm />
            </div>
        );
    }

    // Vue principale
    return (
        <div className="max-w-4xl mx-auto p-2 sm:p-4 animate-in fade-in duration-500">
            <div className="mb-10">
                <h2 className="text-3xl font-black text-slate-900 dark:text-white capitalize tracking-tight mb-6 flex items-center gap-3">
                    Centre de Configuration
                </h2>
                <div className="relative group shadow-sm">
                    <span className="absolute inset-y-0 left-4 flex items-center text-slate-400 dark:text-slate-500 group-focus-within:text-blue-500 dark:group-focus-within:text-blue-400 transition-colors">
                        <Search size={20} />
                    </span>
                    <input 
                        type="text" 
                        placeholder="Rechercher un module (ex: Bulletin, Sécurité...)"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 dark:focus:border-blue-500 transition-all text-slate-800 dark:text-slate-200 font-bold placeholder-slate-400"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {filteredOptions.length > 0 ? (
                    filteredOptions.map((option) => (
                        <button
                            key={option.id}
                            onClick={() => setActiveSection(option.id)}
                            className={`w-full flex items-center gap-5 p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl hover:shadow-xl hover:shadow-slate-200/40 dark:hover:shadow-black/40 hover:-translate-y-0.5 transition-all duration-300 group text-left ${option.hoverRing}`}
                        >
                            <div className={`w-14 h-14 shrink-0 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 duration-300 ${option.bgGradient} ${option.colorClass}`}>
                                {option.icon}
                            </div>
                            <div className="flex-1 overflow-hidden">
                                <h3 className="text-slate-900 dark:text-white font-black text-base uppercase tracking-wider group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-1">
                                    {option.title}
                                </h3>
                                <p className="text-slate-500 dark:text-slate-400 text-sm truncate font-medium">
                                    {option.description}
                                </p>
                            </div>
                            <div className="text-slate-300 dark:text-slate-600 group-hover:text-blue-500 dark:group-hover:text-blue-400 group-hover:translate-x-2 transition-all px-2">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M9 18l6-6-6-6"/>
                                </svg>
                            </div>
                        </button>
                    ))
                ) : (
                    <div className="text-center py-16 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700">
                        <Search size={40} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
                        <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-sm">Aucun résultat pour "{searchTerm}"</p>
                    </div>
                )}
            </div>

            <div className="mt-12 pt-6 flex justify-between items-center px-4">
                <div className="flex gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                </div>
            </div>
        </div>
    );
};

export default SettingsDashboard;