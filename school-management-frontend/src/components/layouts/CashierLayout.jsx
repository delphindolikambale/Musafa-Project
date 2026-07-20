import React, { useState, useEffect, useContext } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import CashierSidebar from './CashierSidebar';
import { useSchool } from '../../context/SchoolContext';
import { ThemeContext } from '../../App'; // Importation du thème
import { websocketService } from '../../services/websocketService';
import api from '../../services/api'; 
import { Menu, Bell, Sun, Moon } from 'lucide-react';

const CashierLayout = () => {
    const [notifications, setNotifications] = useState([]);
    const [showNotif, setShowNotif] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    
    // Récupération correcte du contexte de l'école
    const { schoolConfig, loading: schoolLoading } = useSchool();
    
    const themeContext = useContext(ThemeContext);
    const theme = themeContext?.theme || 'light';
    const toggleTheme = themeContext?.toggleTheme || (() => {});

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const playNotificationSound = () => {
        try {
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const playTone = (freq, start, duration) => {
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, start);
                gain.gain.setValueAtTime(0, start);
                gain.gain.linearRampToValueAtTime(0.1, start + 0.01);
                gain.gain.exponentialRampToValueAtTime(0.01, start + duration);
                osc.connect(gain);
                gain.connect(audioCtx.destination);
                osc.start(start);
                osc.stop(start + duration);
            };
            const now = audioCtx.currentTime;
            playTone(880, now, 0.15);
            playTone(1046.50, now + 0.15, 0.2);
        } catch (e) { console.error(e); }
    };

    const formatDateTime = (dateStr) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }) + ' • ' + 
               d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    useEffect(() => {
        const loadStoredNotifications = async () => {
            try {
                const response = await api.get('/v1/notifications');
                if (response.status === 200) {
                    setNotifications(response.data);
                }
            } catch (error) { 
                console.error("Notif Error:", error); 
            }
        };

        loadStoredNotifications();

        const handleGlobalNotifications = (data) => {
            setNotifications(prev => {
                if (typeof data === 'string') {
                    if (prev.some(n => n.message === data && !n.isRead)) return prev;
                    playNotificationSound();
                    return [{ id: `t-${Date.now()}`, type: 'PRICING', message: data, isRead: false, createdAt: new Date().toISOString() }, ...prev];
                }
                if (data && data.accountNumber) {
                    if (prev.some(n => n.accountNumber === data.accountNumber && !n.isRead)) return prev;
                    playNotificationSound();
                    window.dispatchEvent(new CustomEvent('new-financial-account', { detail: data }));
                    return [{ ...data, type: 'ENROLLMENT', isRead: false, id: `t-${data.accountNumber}-${Date.now()}`, createdAt: data.createdAt || new Date().toISOString() }, ...prev];
                }
                return prev;
            });
        };

        websocketService.connect(handleGlobalNotifications);
        return () => websocketService.disconnect(handleGlobalNotifications);
    }, []);

    // Sécurisation de l'affichage du nom de l'école (priorité à name, puis schoolName)
    const displaySchoolName = schoolConfig?.name || schoolConfig?.schoolName || "Institution Scolaire";
    const displaySchoolInitial = displaySchoolName.charAt(0).toUpperCase();

    return (
        <div className="flex h-screen bg-[#F8FAFC] dark:bg-slate-950 font-sans text-slate-900 dark:text-white overflow-hidden relative transition-colors duration-300">
            <div className={`
                fixed inset-0 z-[100] lg:relative lg:z-0 lg:flex
                ${isSidebarOpen ? 'flex' : 'hidden'} 
                lg:block
            `}>
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm lg:hidden" onClick={() => setIsSidebarOpen(false)}></div>
                <CashierSidebar closeMobile={() => setIsSidebarOpen(false)} />
            </div>

            <div className="flex-1 flex flex-col min-w-0 h-full relative">
                <header className="h-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800/60 flex items-center justify-between px-6 lg:px-10 shrink-0 sticky top-0 z-40 transition-colors duration-300">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => setIsSidebarOpen(true)} 
                            className="lg:hidden p-2.5 text-blue-600 bg-blue-50 hover:bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 rounded-xl transition-all"
                        >
                            <Menu size={24} />
                        </button>
                        <div className="flex items-center gap-2">
                             <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                             <span className="hidden sm:inline-block text-slate-400 dark:text-slate-500 text-[10px] font-black uppercase tracking-widest">Système Financier Connecté</span>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3 lg:gap-6">
                        {/* BOUTON THÈME LIGHT/DARK */}
                        <button 
                            onClick={toggleTheme} 
                            className="p-2.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:text-slate-400 dark:hover:text-blue-400 dark:hover:bg-slate-800 rounded-xl transition-all duration-300"
                        >
                            {theme === 'dark' ? <Sun size={20} className="text-amber-400" /> : <Moon size={20} />}
                        </button>

                        <div className="relative">
                            <button onClick={() => setShowNotif(!showNotif)} 
                                className={`relative p-3 rounded-2xl transition-all ${unreadCount > 0 ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500'} hover:scale-105 active:scale-95`}>
                                <Bell size={20} />
                                {unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-black flex items-center justify-center rounded-full border-2 border-white dark:border-slate-900 animate-bounce">
                                        {unreadCount}
                                    </span>
                                )}
                            </button>
                            
                            {showNotif && (
                                <>
                                    <div className="fixed inset-0 z-[70]" onClick={() => setShowNotif(false)}></div>
                                    <div className="absolute right-0 mt-4 w-[calc(100vw-2rem)] sm:w-85 bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-800 z-[80] overflow-hidden animate-in fade-in zoom-in slide-in-from-top-2 duration-200">
                                        <div className="p-5 bg-slate-50/50 dark:bg-slate-800/50 flex justify-between items-center border-b border-slate-100 dark:border-slate-800">
                                            <span className="font-black text-[10px] uppercase text-slate-400 dark:text-slate-500 tracking-widest">Notifications Flux</span>
                                            {notifications.length > 0 && (
                                                <button onClick={() => setNotifications([])} className="text-[10px] font-black text-red-500 hover:underline uppercase">Vider</button>
                                            )}
                                        </div>
                                        <div className="max-h-[400px] overflow-y-auto hover-scrollbar">
                                            {notifications.length === 0 ? (
                                                <div className="p-12 text-center opacity-30">
                                                    <p className="text-xs font-bold italic dark:text-slate-400">Aucun nouveau flux</p>
                                                </div>
                                            ) : (
                                                notifications.map((notif) => (
                                                    <div key={notif.id} className="p-5 border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 cursor-pointer transition-all">
                                                        <p className="text-[11px] font-black text-slate-900 dark:text-slate-200 uppercase">{notif.type === 'PRICING' ? '💰 Tarification' : '👤 Inscription'}</p>
                                                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-snug">{notif.message || `Nouveau compte: ${notif.studentName}`}</p>
                                                        <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 mt-2 uppercase">{formatDateTime(notif.createdAt)}</p>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* PROFIL ÉCOLE (A la place du profil Caissier) */}
                        <div className="flex items-center gap-3 pl-4 border-l border-slate-200 dark:border-slate-700 transition-colors">
                            <div className="hidden md:block text-right max-w-[150px]">
                                <p className="text-xs font-black text-slate-900 dark:text-slate-100 leading-none truncate" title={displaySchoolName}>
                                    {schoolLoading ? "Chargement..." : displaySchoolName}
                                </p>
                                <p className="text-[9px] font-bold text-emerald-500 dark:text-emerald-400 uppercase mt-1">Institution Scolaire</p>
                            </div>
                            <div className="h-10 w-10 md:h-11 md:w-11 shrink-0 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 text-sm font-black shadow-sm overflow-hidden ring-2 ring-emerald-500/10">
                                {schoolConfig?.logoBase64 ? (
                                    <img 
                                        src={schoolConfig.logoBase64.startsWith('data:') ? schoolConfig.logoBase64 : `data:image/png;base64,${schoolConfig.logoBase64}`} 
                                        alt="School Logo" 
                                        className="w-full h-full object-contain p-0.5" 
                                    />
                                ) : (
                                    <span>{displaySchoolInitial}</span>
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-4 lg:p-10 bg-[#F8FAFC] dark:bg-slate-950 transition-colors hover-scrollbar">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default CashierLayout;