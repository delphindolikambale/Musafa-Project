import React from 'react';
import { Fingerprint, CheckCircle2, XCircle, Clock, MapPin, Scan } from 'lucide-react';

const AttendanceManagement = () => {
  const attendances = [
    { id: 1, teacher: 'Kambale Vianney', time: '07:45', status: 'Présent', delay: 'En avance', photo: 'V' },
    { id: 2, teacher: 'Masika Dorcas', time: '08:05', status: 'En retard', delay: '5 min', photo: 'M' },
    { id: 3, teacher: 'Paluku Justin', time: '--:--', status: 'Absent', delay: '-', photo: 'P' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Panneau de Scan (Simulateur de Pointage) */}
        <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl flex flex-col items-center justify-center text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full -mr-10 -mt-10 blur-3xl"></div>
          <div className="w-24 h-24 bg-blue-600 rounded-3xl flex items-center justify-center shadow-lg shadow-blue-500/40 mb-6">
            <Scan size={40} className="animate-pulse" />
          </div>
          <h3 className="text-xl font-black uppercase tracking-tight">Système de Pointage</h3>
          <p className="text-slate-400 text-sm mt-2 font-medium">Présentez la carte de service au scanner</p>
          <div className="mt-8 w-full bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-ping"></div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 italic">Scanner prêt pour enregistrement...</span>
          </div>
        </div>

        {/* Statistiques Rapides */}
        <div className="xl:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Taux de Ponctualité</p>
                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><Clock size={20}/></div>
                </div>
                <h3 className="text-4xl font-black text-slate-800">88.5%</h3>
                <p className="text-[10px] text-slate-400 font-bold mt-2 uppercase">Basé sur les 30 derniers jours</p>
            </div>
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                    <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Absences du jour</p>
                    <div className="p-3 bg-red-50 text-red-600 rounded-xl"><XCircle size={20}/></div>
                </div>
                <h3 className="text-4xl font-black text-slate-800">03</h3>
                <p className="text-[10px] text-red-400 font-bold mt-2 uppercase tracking-tighter italic font-black animate-pulse">Alerte : Remplacements requis</p>
            </div>
        </div>
      </div>

      {/* Liste des présences du jour */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex items-center justify-between">
            <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">Log des Pointages <span className="text-blue-500 italic lowercase font-medium ml-2">(Aujourd'hui)</span></h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <th className="p-6">Enseignant</th>
                <th className="p-6">Heure Pointage</th>
                <th className="p-6">Statut</th>
                <th className="p-6">Performance</th>
                <th className="p-6">Lieu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {attendances.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center font-black text-slate-500 text-xs">{item.photo}</div>
                      <span className="text-sm font-bold text-slate-700">{item.teacher}</span>
                    </div>
                  </td>
                  <td className="p-6 text-sm font-black text-slate-800 tracking-tighter italic">{item.time}</td>
                  <td className="p-6">
                    <div className={`flex items-center gap-2 text-[10px] font-black uppercase px-3 py-1 rounded-full w-fit ${
                      item.status === 'Présent' ? 'bg-green-50 text-green-600' : 
                      item.status === 'Absent' ? 'bg-red-50 text-red-600' : 'bg-orange-50 text-orange-600'
                    }`}>
                      {item.status === 'Présent' ? <CheckCircle2 size={12}/> : <XCircle size={12}/>}
                      {item.status}
                    </div>
                  </td>
                  <td className="p-6 text-[10px] font-bold text-slate-500 italic">{item.delay}</td>
                  <td className="p-6">
                    <div className="flex items-center gap-1 text-slate-400 text-xs font-medium uppercase tracking-tighter">
                      <MapPin size={12}/> Entrée Principale
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AttendanceManagement;