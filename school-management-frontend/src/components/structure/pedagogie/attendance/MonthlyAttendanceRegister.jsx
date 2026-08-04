import React, { useState, useEffect, useRef } from 'react';
import attendanceService from '../../../../services/pedagogieService/attendanceService';
import { Loader2, Printer } from 'lucide-react';

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
    if (classroomId && year && month && schoolId && academicYearId) {
      loadRegister();
    }
  }, [classroomId, year, month, schoolId, academicYearId]);

  const handlePrint = () => {
    window.print();
  };

  const daysInMonth = registerData ? new Date(year, month, 0).getDate() : 31;
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-8 print:p-0 print:border-none print:shadow-none">
      
      {/* BARRE D'OUTILS (Invisible à l'impression) */}
      <div className="flex flex-wrap justify-between items-center pb-6 border-b border-slate-100 gap-4 print:hidden">
        <div>
          <h2 className="text-xl font-black text-slate-800">Registre Mensuel de Présence</h2>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">Modèle Officiel - Éducation Nationale</p>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase text-slate-400">Période :</span>
            <select
              value={month}
              onChange={(e) => setMonth(parseInt(e.target.value))}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none"
            >
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {new Date(0, i).toLocaleString('fr', { month: 'long' }).toUpperCase()}
                </option>
              ))}
            </select>
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value))}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none w-20"
            />
          </div>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-black text-xs uppercase tracking-wider transition-all shadow-md active:scale-95"
          >
            <Printer size={16} /> Imprimer
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex py-12 items-center justify-center">
          <Loader2 className="animate-spin text-slate-400" size={32} />
        </div>
      ) : registerData ? (
        <div ref={registerRef} className="mt-8 print:m-0 print:p-0">
          
          {/* EN-TÊTE OFFICIEL POUR IMPRESSION */}
          <div className="mb-4 text-center">
            <h1 className="text-xl font-bold uppercase text-blue-900 tracking-wide underline decoration-2 underline-offset-4 mb-2">
              {registerData.schoolName || "COMPLEXE SCOLAIRE MUSAFA"}
            </h1>
            <h2 className="text-lg font-bold text-slate-800">
              REGISTRE DES PRÉSENCES - MOIS DE {registerData.monthName} {registerData.year}
            </h2>
            <div className="flex justify-between items-center text-sm font-semibold text-slate-700 mt-4 px-8 border-b-2 border-slate-300 pb-2">
              <span>CLASSE : <span className="text-blue-900 font-bold">{registerData.classroomName}</span></span>
              <span>TITULAIRE : <span className="text-blue-900 font-bold">{registerData.titulaireName}</span></span>
              <span>ANNÉE SCOLAIRE : <span className="text-blue-900 font-bold">{registerData.academicYearName}</span></span>
              <span>JOURS DE CLASSE : <span className="text-blue-900 font-bold">{registerData.totalClassDays}</span></span>
            </div>
          </div>

          {/* LÉGENDE CONVENTIONNELLE */}
          <div className="mb-4 text-[10px] font-semibold text-slate-600 flex gap-4 justify-center print:text-black">
            <span>SIGNES CONVENTIONNELS :</span>
            <span><strong className="text-blue-900">|</strong> = Présent</span>
            <span><strong className="text-red-600">-</strong> = Absent</span>
            <span><strong className="text-amber-600">+</strong> = Présent avec retard</span>
            <span><strong className="text-slate-800">m</strong> = Malade</span>
            <span><strong className="text-slate-800">p</strong> = Absent valable</span>
          </div>

          {/* GRILLE DU REGISTRE */}
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse border-2 border-slate-800 text-xs text-center print:border-black">
              <thead className="bg-slate-100 print:bg-transparent">
                <tr>
                  <th className="border border-slate-600 print:border-black px-1 py-2 w-8 text-[10px] text-blue-900" rowSpan="2">N°</th>
                  <th className="border border-slate-600 print:border-black px-2 py-2 text-left w-56 text-[11px] text-blue-900 uppercase" rowSpan="2">Noms et Postnoms</th>
                  <th className="border border-slate-600 print:border-black px-1 py-2 w-6 text-[10px] text-blue-900" rowSpan="2">S</th>
                  <th className="border border-slate-600 print:border-black py-1 text-[11px] text-blue-900 uppercase" colSpan={daysInMonth}>Fréquentation (Jours du mois)</th>
                  <th className="border border-slate-600 print:border-black px-1 py-1 text-[10px] text-blue-900 leading-tight" colSpan="2">TOTAL<br/>MENSUEL</th>
                  <th className="border border-slate-600 print:border-black px-1 py-1 text-[10px] text-blue-900 leading-tight" rowSpan="2">TOTAL<br/>GÉNÉRAL</th>
                </tr>
                <tr>
                  {daysArray.map((d) => (
                    <th key={d} className="border border-slate-600 print:border-black px-1 py-0.5 text-[9px] w-5 text-blue-900">{d}</th>
                  ))}
                  <th className="border border-slate-600 print:border-black px-1 py-0.5 text-[9px] w-6 bg-slate-200 print:bg-transparent">P</th>
                  <th className="border border-slate-600 print:border-black px-1 py-0.5 text-[9px] w-6 bg-slate-200 print:bg-transparent">A</th>
                </tr>
              </thead>
              <tbody>
                {(registerData.studentRows || []).map((row, idx) => (
                  <tr key={row.studentId} className="hover:bg-slate-50 print:hover:bg-transparent">
                    <td className="border border-slate-400 print:border-black px-1 py-1 text-[10px] font-medium text-slate-500">{idx + 1}</td>
                    <td className="border border-slate-400 print:border-black px-2 py-1 text-left font-bold text-slate-800 uppercase tracking-tight truncate max-w-[200px]">{row.fullName}</td>
                    <td className="border border-slate-400 print:border-black px-1 py-1 text-[10px]">{row.gender?.charAt(0) || ''}</td>
                    
                    {/* Symboles quotidiens avec respect strict des enums backend */}
                    {daysArray.map((d) => {
                      const symbol = row.dailySymbols ? row.dailySymbols[d] || '' : '';
                      let symbolClass = 'text-slate-800 font-medium';
                      if (symbol === '-') symbolClass = 'text-red-600 font-bold';
                      if (symbol === '|') symbolClass = 'text-blue-900 font-bold';
                      if (symbol === '+') symbolClass = 'text-amber-600 font-bold';
                      
                      return (
                        <td key={d} className={`border border-slate-400 print:border-black py-0.5 text-[12px] ${symbolClass}`}>
                          {symbol}
                        </td>
                      );
                    })}

                    <td className="border border-slate-400 print:border-black px-1 py-1 font-bold text-slate-700 bg-slate-50 print:bg-transparent">{row.monthlyPresences}</td>
                    <td className="border border-slate-400 print:border-black px-1 py-1 font-bold text-slate-700 bg-slate-50 print:bg-transparent">{row.monthlyAbsences}</td>
                    <td className="border border-slate-400 print:border-black px-1 py-1 font-bold text-blue-900">{row.cumulatedPresences}</td>
                  </tr>
                ))}
              </tbody>

              {/* LIGNE DES TOTAUX BAS DE PAGE */}
              <tfoot className="font-bold text-[10px] text-blue-900 bg-slate-100 print:bg-transparent">
                <tr>
                  <td colSpan="3" className="border border-slate-600 print:border-black px-2 py-1.5 text-right uppercase">Total des Présences</td>
                  {daysArray.map((d) => (
                    <td key={d} className="border border-slate-600 print:border-black py-1">
                      {(registerData.dailyTotalPresences || {})[d] || 0}
                    </td>
                  ))}
                  <td colSpan="3" className="border border-slate-600 print:border-black bg-slate-200 print:bg-transparent"></td>
                </tr>
                <tr>
                  <td colSpan="3" className="border border-slate-600 print:border-black px-2 py-1.5 text-right uppercase">Total des Absences</td>
                  {daysArray.map((d) => (
                    <td key={d} className="border border-slate-600 print:border-black py-1">
                      {(registerData.dailyTotalAbsences || {})[d] || 0}
                    </td>
                  ))}
                  <td colSpan="3" className="border border-slate-600 print:border-black bg-slate-200 print:bg-transparent"></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      ) : (
        <div className="py-12 text-center text-slate-400 font-bold text-xs uppercase">Aucune donnée disponible pour ce mois.</div>
      )}
    </div>
  );
};