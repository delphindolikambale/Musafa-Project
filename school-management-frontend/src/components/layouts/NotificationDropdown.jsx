import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Check, Clock, Inbox, ShieldAlert } from 'lucide-react';
import axios from 'axios';
import { BACKEND_BASE } from '../../services/api';
import AuthService from '../../services/auth.service';
import { websocketService } from '../../services/websocketService';

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const currentUser = AuthService.getCurrentUser();

  const fetchNotifications = async () => {
    try {
      const response = await axios.get(`${BACKEND_BASE}/api/notifications/role/PROVISEUR`);
      setNotifications(response.data);
      
      const countResponse = await axios.get(`${BACKEND_BASE}/api/notifications/role/PROVISEUR/count-unread`);
      setUnreadCount(countResponse.data);
    } catch (error) {
      console.error("Erreur lors de la récupération des notifications:", error);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Abonnement en direct au canal WebSocket global mixte
    const handleLiveNotification = (message) => {
      if (message && message.type === 'NEW_GRADE_SHEET') {
        // Ajoute la nouvelle notification en tête de liste et incrémente le badge
        setNotifications((prev) => [message, ...prev]);
        setUnreadCount((prev) => prev + 1);
      }
    };

    websocketService.connect(handleLiveNotification);

    // Fermeture dynamique en cas de clic en dehors du menu déroulant
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      websocketService.disconnect(handleLiveNotification);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleMarkAsRead = async (id, e) => {
    e.stopPropagation();
    try {
      await axios.put(`${BACKEND_BASE}/api/notifications/${id}/read`);
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, readStatus: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Erreur marquage notification lue:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await axios.put(`${BACKEND_BASE}/api/notifications/role/PROVISEUR/read-all`);
      setNotifications(prev => prev.map(n => ({ ...n, readStatus: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Erreur marquage global:", error);
    }
  };

  const handleNotificationClick = async (item) => {
    if (!item.readStatus) {
      try {
        await axios.put(`${BACKEND_BASE}/api/notifications/${item.id}/read`);
        setNotifications(prev =>
          prev.map(n => n.id === item.id ? { ...n, readStatus: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      } catch (err) {
        console.error(err);
      }
    }
    setIsOpen(false);
    
    // Redirection directe vers la fiche de validation correspondante
    if (item.assignmentId && item.period) {
      navigate(`/proviseur/validation-fiche/${item.assignmentId}/${item.period}`);
    } else {
      navigate('/proviseur/reception-fiches');
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) + ' - ' + date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bouton Cloche avec Badge d'alerte dynamique */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-xl transition-colors border border-slate-200 dark:border-slate-600 group"
        title="Notifications Pédagogiques"
      >
        <Bell size={20} className="text-slate-500 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 bg-orange-600 text-white text-[11px] font-black w-5 h-5 rounded-full flex items-center justify-center animate-pulse border-2 border-white dark:border-slate-800 shadow-sm">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Menu déroulant Panel des notifications */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-96 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl overflow-hidden z-50 transition-all duration-200 animate-in fade-in slide-in-from-top-5">
          
          {/* Header */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <Bell size={16} className="font-bold" />
              </span>
              <h3 className="font-black text-sm text-slate-800 dark:text-white uppercase tracking-wider">
                Fiches de notes reçues
              </h3>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-[11px] font-black text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 uppercase tracking-tight"
              >
                <Check size={12} /> Tout lire
              </button>
            )}
          </div>

          {/* Corps de la liste scrollable */}
          <div className="max-h-[420px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700/60 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-200 dark:[&::-webkit-scrollbar-thumb]:bg-slate-700 [&::-webkit-scrollbar-thumb]:rounded-full">
            {notifications.length === 0 ? (
              <div className="p-8 text-center flex flex-col items-center justify-center">
                <Inbox size={40} className="text-slate-300 dark:text-slate-600 mb-2 stroke-[1.5]" />
                <p className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-wide">
                  Aucune fiche en attente
                </p>
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleNotificationClick(item)}
                  className={`p-4 hover:bg-slate-50 dark:hover:bg-slate-700/40 cursor-pointer transition-colors flex gap-3 relative group/item ${
                    !item.readStatus ? 'bg-blue-50/40 dark:bg-blue-900/10' : ''
                  }`}
                >
                  {/* Indicateur de non lu */}
                  {!item.readStatus && (
                    <span className="absolute left-1.5 top-1/2 -translate-y-1/2 w-2 h-2 bg-blue-600 rounded-full" />
                  )}

                  <div className="shrink-0 mt-0.5">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                      !item.readStatus ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400' : 'bg-slate-100 text-slate-400 dark:bg-slate-700 dark:text-slate-500'
                    }`}>
                      <ShieldAlert size={16} />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <p className={`text-xs font-black truncate uppercase tracking-tight ${
                        !item.readStatus ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'
                      }`}>
                        {item.title || "Soumission de Notes"}
                      </p>
                      <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 flex items-center gap-1 whitespace-nowrap">
                        <Clock size={10} /> {formatTime(item.createdAt)}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-semibold">
                      {item.message}
                    </p>
                  </div>

                  {/* Bouton d'action rapide pour marquer comme lu unitairement */}
                  {!item.readStatus && (
                    <div className="shrink-0 self-center opacity-0 group-hover/item:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => handleMarkAsRead(item.id, e)}
                        className="p-1 hover:bg-white dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-500 rounded-md text-slate-400 hover:text-emerald-500 transition-colors shadow-sm"
                        title="Marquer comme lu"
                      >
                        <Check size={12} className="stroke-[3]" />
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-700 text-center">
            <button
              onClick={() => { setIsOpen(false); navigate('/proviseur/reception-fiches'); }}
              className="text-xs font-black text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 uppercase tracking-widest"
            >
              Voir toutes les fiches
            </button>
          </div>
          
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;