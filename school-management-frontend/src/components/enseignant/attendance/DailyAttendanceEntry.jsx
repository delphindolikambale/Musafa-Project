import React, { useState, useEffect } from 'react';
import attendanceService from '../../../services/pedagogieService/attendanceService';

const STATUS_OPTIONS = [
  { value: 'PRESENT', label: 'Présent (|)', symbol: '|', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
  { value: 'ABSENT', label: 'Absent (-)', symbol: '-', color: 'bg-red-100 text-red-800 border-red-300' },
  { value: 'LATE', label: 'Retard (+)', symbol: '+', color: 'bg-amber-100 text-amber-800 border-amber-300' },
  { value: 'SICK', label: 'Malade (m)', symbol: 'm', color: 'bg-blue-100 text-blue-800 border-blue-300' },
  { value: 'EXCUSED', label: 'Excusé (p)', symbol: 'p', color: 'bg-purple-100 text-purple-800 border-purple-300' }
];

export const DailyAttendanceEntry = ({ schoolId, classroomId, academicYearId, teacherId }) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [sessionType, setSessionType] = useState('MORNING');
  const [studentsData, setStudentsData] = useState([]);
  const [morningDone, setMorningDone] = useState(false);
  const [eveningDone, setEveningDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  // Charger les présences du jour
  const loadDailyAttendance = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const data = await attendanceService.getDailyAttendance(schoolId, classroomId, academicYearId, date);
      setMorningDone(data.morningDone);
      setEveningDone(data.eveningDone);
      
      // Auto-commutation sur EVENING si le matin est déjà fait
      if (data.morningDone && !data.eveningDone) {
        setSessionType('EVENING');
      }

      setStudentsData(data.students.map(s => ({
        studentId: s.studentId,
        matricule: s.matricule,
        fullName: s.fullName,
        gender: s.gender,
        currentStatus: sessionType === 'MORNING' ? (s.morningStatus || 'PRESENT') : (s.eveningStatus || s.morningStatus || 'PRESENT'),
        remarks: s.remarks || ''
      })));
    } catch (err) {
      setMessage({ type: 'error', text: 'Erreur lors du chargement des présences.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (classroomId && date) {
      loadDailyAttendance();
    }
  }, [date, classroomId]);

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
      setMessage({ type: 'success', text: `Passage de ${sessionType === 'MORNING' ? '1ère heure' : 'Fin de journée'} enregistré avec succès !` });
      await loadDailyAttendance();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || "Erreur lors de l'enregistrement." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex flex-wrap justify-between items-center pb-4 border-b gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Appel Quotidien des Élèves</h2>
          <p className="text-sm text-gray-500">Registre de présence officiel (C.S. MUSAFA)</p>
        </div>

        <div className="flex items-center space-x-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Date d'appel</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Passage</label>
            <div className="inline-flex rounded-md shadow-sm">
              <button
                type="button"
                onClick={() => setSessionType('MORNING')}
                className={`px-3 py-1.5 text-xs font-medium rounded-l-lg border ${
                  sessionType === 'MORNING' 
                    ? 'bg-blue-600 text-white border-blue-600' 
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                1er Passage (Matin) {morningDone && '✓'}
              </button>
              <button
                type="button"
                onClick={() => setSessionType('EVENING')}
                disabled={!morningDone}
                className={`px-3 py-1.5 text-xs font-medium rounded-r-lg border ${
                  sessionType === 'EVENING'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                } ${!morningDone ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                2ème Passage (Soir) {eveningDone && '✓'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {message && (
        <div className={`mt-4 p-3 rounded-md text-sm ${message.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
          {message.text}
        </div>
      )}

      {/* Raccourcis de sélection globale */}
      <div className="mt-4 flex items-center justify-between bg-gray-50 p-3 rounded-md border">
        <span className="text-xs font-semibold text-gray-600">Actions rapides :</span>
        <div className="space-x-2">
          <button
            type="button"
            onClick={() => handleMarkAll('PRESENT')}
            className="px-2.5 py-1 text-xs font-medium bg-emerald-600 text-white rounded hover:bg-emerald-700"
          >
            Tous Présents (|)
          </button>
          <button
            type="button"
            onClick={() => handleMarkAll('ABSENT')}
            className="px-2.5 py-1 text-xs font-medium bg-red-600 text-white rounded hover:bg-red-700"
          >
            Tous Absents (-)
          </button>
        </div>
      </div>

      {/* Liste des élèves */}
      {loading ? (
        <div className="py-12 text-center text-gray-500">Chargement de la liste...</div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-4">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">N°</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Matricule</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Nom & Prénom</th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-gray-600 uppercase">Sexe</th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-gray-600 uppercase">Statut ({sessionType === 'MORNING' ? 'Matin' : 'Soir'})</th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase">Remarque</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {studentsData.map((student, idx) => (
                  <tr key={student.studentId} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-xs font-medium text-gray-500">{idx + 1}</td>
                    <td className="px-4 py-3 text-xs font-mono text-gray-600">{student.matricule}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">{student.fullName}</td>
                    <td className="px-4 py-3 text-xs text-center font-bold text-gray-600">{student.gender}</td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex justify-center space-x-1">
                        {STATUS_OPTIONS.map((opt) => (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => handleStatusChange(student.studentId, opt.value)}
                            title={opt.label}
                            className={`w-8 h-8 text-xs font-bold rounded-md border transition-colors ${
                              student.currentStatus === opt.value
                                ? `${opt.color} ring-2 ring-blue-500 shadow-sm`
                                : 'bg-white text-gray-400 border-gray-200 hover:bg-gray-100'
                            }`}
                          >
                            {opt.symbol}
                          </button>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        placeholder="Motif / Observation..."
                        value={student.remarks}
                        onChange={(e) => handleRemarkChange(student.studentId, e.target.value)}
                        className="w-full text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:border-blue-400"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-blue-600 text-white font-medium text-sm rounded-md shadow hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? 'Enregistrement...' : `Valider le passage du ${sessionType === 'MORNING' ? 'Matin' : 'Soir'}`}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};