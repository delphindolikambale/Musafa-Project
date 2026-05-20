import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import CashierSidebar from './CashierSidebar';
import AuthService from '../../services/auth.service'; // Nom corrigé
import { websocketService } from '../../services/websocketService';
import { Menu, Bell, User } from 'lucide-react';

const CashierLayout = () => {
    const [notifications, setNotifications] = useState([]);
    const [showNotif, setShowNotif] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const navigate = useNavigate();
    const currentUser = AuthService.getCurrentUser(); // Utilisation cohérente

    const API_URL = "http://localhost:8080/api/v1/notifications";
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
                const response = await fetch(API_URL);
                if (response.ok) {
                    const data = await response.json();
                    setNotifications(data);
                }
            } catch (error) { console.error("Notif Error:", error); }
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

    return (
        <div className="flex h-screen bg-[#F8FAFC] overflow-hidden">
            <div className={`
                fixed inset-0 z-[100] lg:relative lg:z-0 lg:flex
                ${isSidebarOpen ? 'flex' : 'hidden'} 
                lg:block
            `}>
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm lg:hidden" onClick={() => setIsSidebarOpen(false)}></div>
                <CashierSidebar closeMobile={() => setIsSidebarOpen(false)} />
            </div>

            <div className="flex-1 flex flex-col min-w-0 h-full relative">
                <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-6 lg:px-10 shrink-0 sticky top-0 z-40">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => setIsSidebarOpen(true)} 
                            className="lg:hidden p-2.5 text-slate-600 bg-slate-50 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all"
                        >
                            <Menu size={24} />
                        </button>
                        <div className="flex items-center gap-2">
                             <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                             <span className="hidden sm:inline-block text-slate-400 text-[10px] font-black uppercase tracking-widest">Système Financier Connecté</span>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3 lg:gap-6">
                        <div className="relative">
                            <button onClick={() => setShowNotif(!showNotif)} 
                                className={`relative p-3 rounded-2xl transition-all ${unreadCount > 0 ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-400'} hover:scale-105 active:scale-95`}>
                                <Bell size={20} />
                                {unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-black flex items-center justify-center rounded-full border-2 border-white animate-bounce">
                                        {unreadCount}
                                    </span>
                                )}
                            </button>
                            
                            {showNotif && (
                                <>
                                    <div className="fixed inset-0 z-[70]" onClick={() => setShowNotif(false)}></div>
                                    <div className="absolute right-0 mt-4 w-[calc(100vw-2rem)] sm:w-85 bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 z-[80] overflow-hidden animate-in fade-in zoom-in slide-in-from-top-2 duration-200">
                                        <div className="p-5 bg-slate-50/50 flex justify-between items-center border-b border-slate-100">
                                            <span className="font-black text-[10px] uppercase text-slate-400 tracking-widest">Notifications Flux</span>
                                            {notifications.length > 0 && (
                                                <button onClick={() => setNotifications([])} className="text-[10px] font-black text-red-500 hover:underline uppercase">Vider</button>
                                            )}
                                        </div>
                                        <div className="max-h-[400px] overflow-y-auto">
                                            {notifications.length === 0 ? (
                                                <div className="p-12 text-center opacity-30">
                                                    <p className="text-xs font-bold italic">Aucun nouveau flux</p>
                                                </div>
                                            ) : (
                                                notifications.map((notif) => (
                                                    <div key={notif.id} className="p-5 border-b border-slate-50 hover:bg-slate-50/50 cursor-pointer transition-all">
                                                        <p className="text-[11px] font-black text-slate-900 uppercase">{notif.type === 'PRICING' ? '💰 Tarification' : '👤 Inscription'}</p>
                                                        <p className="text-xs text-slate-600 mt-1 leading-snug">{notif.message || `Nouveau compte: ${notif.studentName}`}</p>
                                                        <p className="text-[9px] font-bold text-slate-400 mt-2 uppercase">{formatDateTime(notif.createdAt)}</p>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="flex items-center gap-3 pl-4 border-l border-slate-100">
                            <div className="hidden md:block text-right">
                                <p className="text-xs font-black text-slate-900 leading-none">{currentUser?.username}</p>
                                <p className="text-[9px] font-bold text-emerald-500 uppercase mt-1">Caisse 01</p>
                            </div>
                            <div className="h-11 w-11 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl border-2 border-blue-500/30 flex items-center justify-center text-white text-sm font-black shadow-lg">
                                {currentUser?.username ? currentUser.username.charAt(0).toUpperCase() : <User size={18}/>}
                            </div>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-4 lg:p-10 bg-[#F8FAFC]">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default CashierLayout;