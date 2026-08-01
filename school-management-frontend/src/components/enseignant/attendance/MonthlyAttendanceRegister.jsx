import React, { useState, useEffect, useRef } from 'react';
import attendanceService from '../../../services/pedagogieService/attendanceService';

export const MonthlyAttendanceRegister = ({ schoolId, classroomId, academicYearId }) => {
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [registerData, setRegisterData] = useState(null);
  const [loading, setLoading] = useState(false);
  const registerRef = useRef();

  const loadRegister = async () => {
    setLoading(true);
    try {
      const data = await attendanceService.getMonthlyRegister(schoolId, classroomId, academicYearId, year, month);
      setRegisterData(data);
    } catch (err) {
      console.error("Erreur lors de la récupération du registre mensuel", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (classroomId && year && month) {
      loadRegister();
    }
  }, [classroomId, year, month]);

  const handlePrint = () => {
    window.print();
  };

  const daysInMonth = registerData ? new Date(year, month, 0).getDate() : 31;
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Barre de Filtres et Actions */}
      <div className="flex flex-wrap justify-between items-center pb-4 border-b gap-4 print:hidden">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Registre Mensuel de Présence</h2>
          <p className="text-sm text-gray-500">Conforme au modèle officiel du Ministère de l'Éducation Nationale</p>
        </div>

        <div className="flex items-center space-x-3">
          <div>
            <label className="block text-xs font-semibold text-gray-600">Mois</label>
            <select
              value={month}
              onChange={(e) => setMonth(parseInt(e.target.value))}
              className="border border-gray-300 rounded px-3 py-1 text-sm"
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {new Date(0, i).toLocaleString('fr', { month: 'long' }).toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600">Année</label>
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value))}
              className="border border-gray-300 rounded px-3 py-1 text-sm w-24"
            />
          </div>

          <button
            onClick={handlePrint}
            className="mt-4 px-4 py-1.5 bg-gray-800 text-white rounded text-sm hover:bg-gray-900"
          >
            Imprimer / PDF
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-gray-500">Chargement du registre...</div>
      ) : registerData ? (
        <div ref={registerRef} className="mt-6 print:m-0 print:p-0">
          {/* En-tête officiel pour impression */}
          <div className="mb-4 text-center border-b pb-2">
            <h1 className="text-lg font-bold uppercase">{registerData.schoolName}</h1>
            <h2 className="text-md font-semibold">REGISTRE DE PRÉSENCE DES ÉLÈVES - MOIS DE {registerData.monthName} {registerData.year}</h2>
            <div className="flex justify-between text-xs font-medium text-gray-600 mt-2 px-4">
              <span>Classe : <strong>{registerData.classroomName}</strong></span>
              <span>Titulaire : <strong>{registerData.titulaireName}</strong></span>
              <span>Année Scolaire : <strong>{registerData.academicYearName}</strong></span>
              <span>Jours de Classe (N) : <strong>{registerData.totalClassDays}</strong></span>
            </div>
          </div>

          {/* Grille du Registre */}
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse border border-gray-400 text-xs text-center">
              <thead className="bg-gray-200">
                <tr>
                  <th className="border border-gray-400 px-1 py-1 w-8" rowSpan="2">N°</th>
                  <th className="border border-gray-400 px-2 py-1 text-left w-48" rowSpan="2">Noms et Prénoms</th>
                  <th className="border border-gray-400 px-1 py-1 w-6" rowSpan="2">S</th>
                  <th className="border border-gray-400 py-1" colSpan={daysInMonth}>JOURS DU MOIS</th>
                  <th className="border border-gray-400 px-1 py-1" colSpan="2">TOTAL MOIS</th>
                  <th className="border border-gray-400 px-1 py-1" rowSpan="2">Cumul Pr.</th>
                  <th className="border border-gray-400 px-1 py-1" rowSpan="2">% Fréq.</th>
                </tr>
                <tr>
                  {daysArray.map((d) => (
                    <th key={d} className="border border-gray-400 px-1 py-0.5 text-[10px] w-5">{d}</th>
                  ))}
                  <th className="border border-gray-400 px-1 py-0.5 text-[10px] bg-emerald-100">P</th>
                  <th className="border border-gray-400 px-1 py-0.5 text-[10px] bg-red-100">A</th>
                </tr>
              </thead>
              <tbody>
                {registerData.studentRows.map((row, idx) => (
                  <tr key={row.studentId} className="hover:bg-gray-50">
                    <td className="border border-gray-400 px-1 py-1 font-medium">{idx + 1}</td>
                    <td className="border border-gray-400 px-2 py-1 text-left font-semibold truncate max-w-[180px]">{row.fullName}</td>
                    <td className="border border-gray-400 px-1 py-1">{row.gender}</td>
                    
                    {/* Symboles quotidiens */}
                    {daysArray.map((d) => {
                      const symbol = row.dailySymbols[d] || '';
                      let symbolColor = 'text-gray-800';
                      if (symbol === '-') symbolColor = 'text-red-600 font-bold';
                      if (symbol === '|') symbolColor = 'text-emerald-700 font-bold';
                      return (
                        <td key={d} className={`border border-gray-400 py-0.5 text-[11px] ${symbolColor}`}>
                          {symbol}
                        </td>
                      );
                    })}

                    <td className="border border-gray-400 px-1 py-1 bg-emerald-50 font-bold text-emerald-800">{row.monthlyPresences}</td>
                    <td className="border border-gray-400 px-1 py-1 bg-red-50 font-bold text-red-800">{row.monthlyAbsences}</td>
                    <td className="border border-gray-400 px-1 py-1 font-bold">{row.cumulatedPresences}</td>
                    <td className="border border-gray-400 px-1 py-1 font-bold text-blue-900">{row.attendancePercentage}%</td>
                  </tr>
                ))}
              </tbody>

              {/* Ligne des Totaux Bas de Page */}
              <tfoot className="bg-gray-100 font-bold text-[10px]">
                <tr>
                  <td colSpan="3" className="border border-gray-400 px-2 py-1 text-right">TOTAL PRÉSENCE DU JOUR</td>
                  {daysArray.map((d) => (
                    <td key={d} className="border border-gray-400 py-1 text-emerald-800">
                      {registerData.dailyTotalPresences[d] || 0}
                    </td>
                  ))}
                  <td colSpan="4" className="border border-gray-400 bg-gray-200"></td>
                </tr>
                <tr>
                  <td colSpan="3" className="border border-gray-400 px-2 py-1 text-right">TOTAL ABSENCE DU JOUR</td>
                  {daysArray.map((d) => (
                    <td key={d} className="border border-gray-400 py-1 text-red-800">
                      {registerData.dailyTotalAbsences[d] || 0}
                    </td>
                  ))}
                  <td colSpan="4" className="border border-gray-400 bg-gray-200"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      ) : (
        <div className="py-12 text-center text-gray-500">Aucune donnée disponible.</div>
      )}
    </div>
  );
};