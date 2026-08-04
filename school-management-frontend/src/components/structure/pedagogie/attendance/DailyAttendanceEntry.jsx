import React, { useState, useEffect } from 'react';
import { Check, X, Clock, AlertCircle, PlusSquare, Save, Loader2 } from 'lucide-react';
import attendanceService from '../../../../services/pedagogieService/attendanceService';

const STATUS_OPTIONS = [
  { value: 'PRESENT', label: 'Présent', symbol: '|', icon: <Check size={14} />, defaultColor: 'bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700', activeColor: 'bg-emerald-600 text-white shadow-md shadow-emerald-200' },
  { value: 'ABSENT', label: 'Absent', symbol: '-', icon: <X size={14} />, defaultColor: 'bg-slate-100 text-slate-600 hover:bg-red-50 hover:text-red-700', activeColor: 'bg-red-600 text-white shadow-md shadow-red-200' },
  { value: 'LATE', label: 'En Retard', symbol: '+', icon: <Clock size={14} />, defaultColor: 'bg-slate-100 text-slate-600 hover:bg-amber-50 hover:text-amber-700', activeColor: 'bg-amber-500 text-white shadow-md shadow-amber-200' },
  { value: 'SICK', label: 'Malade', symbol: 'm', icon: <PlusSquare size={14} />, defaultColor: 'bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-700', activeColor: 'bg-blue-500 text-white shadow-md shadow-blue-200' },
  { value: 'EXCUSED', label: 'Excusé', symbol: 'p', icon: <AlertCircle size={14} />, defaultColor: 'bg-slate-100 text-slate-600 hover:bg-purple-50 hover:text-purple-700', activeColor: 'bg-purple-600 text-white shadow-md shadow-purple-200' }
];

export const DailyAttendanceEntry = ({ schoolId, classroomId, academicYearId, teacherId }) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [sessionType, setSessionType] = useState('MORNING');
  const [rawStudents, setRawStudents] = useState([]); // État pour conserver les données brutes du backend
  const [studentsData, setStudentsData] = useState([]); // État modifiable pour le formulaire
  const [morningDone, setMorningDone] = useState(false);
  const [eveningDone, setEveningDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const loadDailyAttendance = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const data = await attendanceService.getDailyAttendance(schoolId, classroomId, academicYearId, date);
      
      const studentsList = data?.students || [];
      
      setMorningDone(data?.morningDone || false);
      setEveningDone(data?.eveningDone || false);
      setRawStudents(studentsList);
      
      let activeSession = 'MORNING';
      if (data?.morningDone && !data?.eveningDone) {
        activeSession = 'EVENING';
      }
      setSessionType(activeSession);
      updateFormState(studentsList, activeSession);

    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Erreur lors du chargement des présences.' });
      setRawStudents([]);
      setStudentsData([]);
    } finally {
      setLoading(false);
    }
  };

  const updateFormState = (studentsList, session) => {
    setStudentsData(studentsList.map(s => {
      let defaultStatus = 'PRESENT';
      if (session === 'MORNING') {
        defaultStatus = s.morningStatus || 'PRESENT';
      } else {
        // Logique : Le soir, si l'élève était absent le matin, on suggère ABSENT. Sinon PRESENT ou l'état enregistré.
        defaultStatus = s.eveningStatus || (s.morningStatus === 'ABSENT' ? 'ABSENT' : 'PRESENT');
      }

      return {
        studentId: s.studentId,
        matricule: s.matricule,
        fullName: s.fullName,
        gender: s.gender,
        currentStatus: defaultStatus,
        remarks: s.remarks || ''
      };
    }));
  };

  // Chargement initial et lors du changement de date ou des paramètres globaux
  useEffect(() => {
    if (classroomId && date && schoolId && academicYearId) {
      loadDailyAttendance();
    }
    // sessionType est retiré des dépendances pour éviter les boucles infinies ou les reset non désirés
  }, [date, classroomId, schoolId, academicYearId]);

  // Met à jour la grille de formulaire uniquement quand l'utilisateur change d'onglet manuellement (Matin <-> Soir)
  useEffect(() => {
    if (rawStudents.length > 0) {
      updateFormState(rawStudents, sessionType);
    }
  }, [sessionType]);

  const handleStatusChange = (studentId, newStatus) => {
    setStudentsData(prev =>
      prev.map(s => s.studentId === studentId ? { ...s, currentStatus: newStatus } : s)
    );
  };

  const handleRemarkChange = (studentId, remarks) => {
    setStudentsData(prev =>
      prev.map(s => s.studentId === studentId ? { ...s, remarks } : s)
    );
  };

  const handleMarkAll = (status) => {
    setStudentsData(prev => prev.map(s => ({ ...s, currentStatus: status })));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const payload = {
      schoolId,
      classroomId,
      academicYearId,
      teacherId,
      date,
      sessionType,
      entries: studentsData.map(s => ({
        studentId: s.studentId,
        status: s.currentStatus,
        remarks: s.remarks
      }))
    };

    try {
      await attendanceService.recordDailyAttendance(payload);
      setMessage({ type: 'success', text: `Passage de ${sessionType === 'MORNING' ? '1ère heure (Matin)' : 'Fin de journée (Soir)'} enregistré avec succès !` });
      await loadDailyAttendance(); // Rafraîchit les statuts et bascule automatiquement sur le soir si nécessaire
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || "Erreur lors de l'enregistrement." });
    } finally {
      setSaving(false);
    }
  };

  const filteredStudents = studentsData.filter(s => 
    s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (s.matricule && s.matricule.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (!classroomId) {
    return <div className="p-8 text-center text-slate-500 font-medium">Veuillez sélectionner une classe pour commencer l'appel.</div>;
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-sm border border-slate-100 dark:border-slate-800 animate-in fade-in duration-300">
      
      {/* HEADER & FILTRES */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center pb-6 border-b border-slate-100 dark:border-slate-800 gap-6">
        <div>
          <h2 className="text-xl font-black text-slate-800 dark:text-slate-100">Appel Quotidien des Élèves</h2>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
            Registre de présence officiel
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-black uppercase text-slate-400 tracking-wider">Date :</span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm font-bold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-black uppercase text-slate-400 tracking-wider">Passage :</span>
            <div className="inline-flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setSessionType('MORNING')}
                className={`px-4 py-2 text-xs font-black uppercase tracking-wider rounded-lg transition-all ${
                  sessionType === 'MORNING' 
                    ? 'bg-white dark:bg-slate-700 text-emerald-600 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                1er Heure {morningDone && '✓'}
              </button>
              <button
                type="button"
                onClick={() => setSessionType('EVENING')}
                disabled={!morningDone}
                className={`px-4 py-2 text-xs font-black uppercase tracking-wider rounded-lg transition-all ${
                  sessionType === 'EVENING'
                    ? 'bg-white dark:bg-slate-700 text-emerald-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                } ${!morningDone ? 'opacity-40 cursor-not-allowed' : ''}`}
              >
                Fin de journée {eveningDone && '✓'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {message && (
        <div className={`mt-6 p-4 rounded-2xl font-bold text-sm ${message.type === 'error' ? 'bg-red-100 text-red-800 border border-red-200' : 'bg-emerald-100 text-emerald-800 border border-emerald-200'}`}>
          {message.text}
        </div>
      )}

      {/* ACTIONS RAPIDES & RECHERCHE */}
      <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <span className="text-xs font-black uppercase text-slate-400 tracking-wider">Marquer tous :</span>
          <button onClick={() => handleMarkAll('PRESENT')} className="px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-colors">
            Présent (|)
          </button>
          <button onClick={() => handleMarkAll('ABSENT')} className="px-3 py-1.5 text-xs font-bold rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition-colors">
            Absent (-)
          </button>
        </div>
        
        <input 
            type="text"
            placeholder="Rechercher un élève..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-64 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      {/* TABLEAU */}
      <div className="mt-6 overflow-x-auto">
        {loading ? (
          <div className="flex py-12 items-center justify-center">
            <Loader2 className="animate-spin text-emerald-600" size={32} />
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-100 dark:border-slate-800">
                  <th className="py-4 px-2 text-xs font-black text-slate-400 uppercase w-12">N°</th>
                  <th className="py-4 px-2 text-xs font-black text-slate-400 uppercase min-w-[200px]">Nom & Prénom</th>
                  <th className="py-4 px-2 text-xs font-black text-slate-400 uppercase text-center min-w-[450px]">Statut de Présence</th>
                  <th className="py-4 px-2 text-xs font-black text-slate-400 uppercase w-48">Observations</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.length > 0 ? filteredStudents.map((st, idx) => (
                  <tr key={st.studentId} className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-2 text-xs font-bold text-slate-400">{idx + 1}</td>
                    <td className="py-3 px-2 text-sm font-black text-slate-800 dark:text-slate-200">
                      {st.fullName}
                    </td>
                    <td className="py-3 px-2">
                      <div className="flex justify-center items-center gap-2">
                        {STATUS_OPTIONS.map(option => {
                          const isActive = st.currentStatus === option.value;
                          return (
                            <button
                              key={option.value}
                              type="button"
                              onClick={() => handleStatusChange(st.studentId, option.value)}
                              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all duration-200 ${
                                isActive ? option.activeColor : option.defaultColor
                              }`}
                              title={`${option.label} (${option.symbol})`}
                            >
                              {option.icon} <span>{option.label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <input
                        type="text"
                        value={st.remarks}
                        onChange={(e) => handleRemarkChange(st.studentId, e.target.value)}
                        placeholder="Note..."
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-emerald-500"
                      />
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="4" className="text-center py-8 text-slate-400 font-bold text-xs uppercase">
                      Aucun élève à afficher pour cette date.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            <div className="mt-8 flex justify-end">
              <button
                type="submit"
                disabled={saving || filteredStudents.length === 0}
                className="inline-flex items-center gap-2 px-8 py-3.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl font-black text-sm uppercase tracking-wider transition-all shadow-lg shadow-emerald-200 dark:shadow-emerald-900/20 active:scale-95"
              >
                {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                Enregistrer {sessionType === 'MORNING' ? 'le Matin' : 'le Soir'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};