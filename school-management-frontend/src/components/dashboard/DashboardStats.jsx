import React, { useState, useEffect } from "react";
import dashboardService from "../../services/dashboardService";
import { Loader2 } from "lucide-react";

const DashboardStats = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await dashboardService.getStats();
        setStats(res.data);
      } catch (err) {
        console.error("Erreur Dashboard:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const cards = [
    { label: "Total Élèves", value: stats?.totalStudents || 0, icon: "👥", color: "bg-blue-600" },
    { label: "Enseignants", value: stats?.totalTeachers || 48, icon: "👨‍🏫", color: "bg-green-600" },
    { label: "Classes", value: stats?.totalClasses || 0, icon: "🏫", color: "bg-purple-600" },
    { label: "Recouvrement", value: `${stats?.recoveryRate || 0}%`, icon: "💰", color: "bg-amber-500" },
  ];

  return (
    <div className="space-y-8 p-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, i) => (
          <div key={i} className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex items-center gap-5">
            <div className={`${card.color} w-16 h-16 rounded-2xl flex items-center justify-center text-3xl text-white shadow-lg`}>
              {card.icon}
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{card.label}</p>
              <p className="text-2xl font-black text-slate-900">
                {loading ? <Loader2 className="animate-spin w-5 h-5 text-slate-200" /> : card.value.toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 min-h-[350px] flex items-center justify-center text-slate-300 italic">
          [ Graphique Performance ]
        </div>
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 min-h-[350px] flex items-end justify-around p-6">
            {[40, 60, 45, 90, 70, 85, 50].map((h, i) => (
                <div key={i} className="w-8 bg-blue-600 rounded-t-lg" style={{ height: `${h}%` }}></div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;