import React from 'react';

const BulletinBody = ({ bulletinData }) => {
    if (!bulletinData) return <div className="text-center p-4 font-serif">Chargement de la grille...</div>;

    const { formatType, domains, results, behavior } = bulletinData;
    const isEB = formatType === '7EME_EB' || formatType === '8EME_EB';
    const is8eme = formatType === '8EME_EB';

    return (
        <div className="w-full text-black font-serif text-[10px] leading-tight print:text-black">
            
            {/* GRILLE PRINCIPALE DES EVALUATIONS */}
            <table className="w-full border-collapse border-[1.5px] border-black text-center table-fixed">
                <thead>
                    {/* Ligne de tête 1 : Semestrialisation */}
                    <tr className="border-b-[1.5px] border-black text-[10px] font-bold uppercase bg-gray-50">
                        <th rowSpan={2} className="border-r border-black p-1 text-left w-[28%] align-middle font-sans">
                            BRANCHES
                        </th>
                        <th colSpan={isEB ? 5 : 4} className="border-r border-black p-0.5 text-[9px] align-middle">
                            PREMIER SEMESTRE
                        </th>
                        <th colSpan={isEB ? 5 : 4} className="border-r border-black p-0.5 text-[9px] align-middle">
                            SECOND SEMESTRE
                        </th>
                        <th rowSpan={2} className="border-r border-black p-0.5 text-[9px] align-middle font-bold w-10">
                            {isEB ? "TOTAL GENERAL" : "T.G."}
                        </th>
                        {is8eme && (
                            <th rowSpan={2} className="border-r border-black p-0.5 text-[8px] align-middle w-6 font-sans font-black uppercase tracking-tight" style={{ writingMode: 'vertical-rl' }}>
                                TENASOSP
                            </th>
                        )}
                        <th colSpan={2} className="p-0.5 text-[8px] align-middle w-16">
                            EXAMEN DE REPECHAGE
                        </th>
                    </tr>
                    {/* Ligne de tête 2 : Sous-colonnes périodiques */}
                    <tr className="border-b-[1.5px] border-black text-[8.5px] font-bold">
                        {/* S1 */}
                        {isEB && <th className="border-r border-black p-0.5 w-7 bg-gray-50/50">MAX.</th>}
                        <th className="border-r border-black p-0.5 w-6">1ère P</th>
                        <th className="border-r border-black p-0.5 w-6">2ème P</th>
                        <th className="border-r border-black p-0.5 w-8">EXAM.</th>
                        <th className="border-r border-black p-0.5 w-8 font-black">TOT.</th>
                        
                        {/* S2 */}
                        {isEB && <th className="border-r border-black p-0.5 w-7 bg-gray-50/50">MAX.</th>}
                        <th className="border-r border-black p-0.5 w-6">3ème P</th>
                        <th className="border-r border-black p-0.5 w-6">4ème P</th>
                        <th className="border-r border-black p-0.5 w-8">EXAM.</th>
                        <th className="border-r border-black p-0.5 w-8 font-black">TOT.</th>
                        
                        {/* Repêchage */}
                        <th className="border-r border-black p-0.5 w-7">%</th>
                        <th className="p-0.5 w-9">Sign. Prof</th>
                    </tr>
                </thead>
                
                <tbody>
                    {/* RENDER MODE 1 : HUMANITÉS (Affichage d'une ligne de MAXIMA en tête de groupe) */}
                    {!isEB && domains?.map((domain, dIdx) => (
                        <React.Fragment key={`hum-dom-${dIdx}`}>
                            <tr className="border-b border-black font-sans font-black bg-gray-100 text-left text-[9px] uppercase tracking-wide">
                                <td colSpan={12} className="p-1 pl-2 border-r border-black">{domain.name}</td>
                            </tr>
                            {/* Ligne de Maxima spécifique au groupe de cours (Typique Humanités RDC) */}
                            <tr className="border-b border-black font-bold text-[9px] bg-white italic text-center">
                                <td className="border-r border-black text-left pl-4">MAXIMA</td>
                                <td className="border-r border-black p-0.5 text-gray-500">{domain.maxPeriod || '10'}</td>
                                <td className="border-r border-black p-0.5 text-gray-500">{domain.maxPeriod || '10'}</td>
                                <td className="border-r border-black p-0.5 text-gray-500">{domain.maxExam || '20'}</td>
                                <td className="border-r border-black p-0.5 font-black text-gray-700">{domain.maxTotalSem || '40'}</td>
                                <td className="border-r border-black p-0.5 text-gray-500">{domain.maxPeriod || '10'}</td>
                                <td className="border-r border-black p-0.5 text-gray-500">{domain.maxPeriod || '10'}</td>
                                <td className="border-r border-black p-0.5 text-gray-500">{domain.maxExam || '20'}</td>
                                <td className="border-r border-black p-0.5 font-black text-gray-700">{domain.maxTotalSem || '40'}</td>
                                <td className="border-r border-black p-0.5 font-black text-gray-800">{domain.maxTotalAnnual || '80'}</td>
                                <td colSpan={2} className="bg-gray-50 border-black border-l"></td>
                            </tr>
                            {domain.subjects?.map((sub, sIdx) => (
                                <tr key={`hum-sub-${sIdx}`} className="border-b border-black text-[10px] hover:bg-slate-50">
                                    <td className="border-r border-black p-1 text-left pl-2 font-medium">{sub.subjectName}</td>
                                    <td className="border-r border-black p-0.5">{sub.p1 ?? ''}</td>
                                    <td className="border-r border-black p-0.5">{sub.p2 ?? ''}</td>
                                    <td className="border-r border-black p-0.5">{sub.exam1 ?? ''}</td>
                                    <td className="border-r border-black p-0.5 font-bold bg-slate-50/50">{sub.totalS1 ?? ''}</td>
                                    <td className="border-r border-black p-0.5">{sub.p3 ?? ''}</td>
                                    <td className="border-r border-black p-0.5">{sub.p4 ?? ''}</td>
                                    <td className="border-r border-black p-0.5">{sub.exam2 ?? ''}</td>
                                    <td className="border-r border-black p-0.5 font-bold bg-slate-50/50">{sub.totalS2 ?? ''}</td>
                                    <td className="border-r border-black p-0.5 font-black text-sm bg-gray-50">{sub.totalAnnuel ?? ''}</td>
                                    <td className="border-r border-black p-0.5 italic text-gray-400"></td>
                                    <td className="p-0.5"></td>
                                </tr>
                            ))}
                        </React.Fragment>
                    ))}

                    {/* RENDER MODE 2 : ÉDUCATION DE BASE 7e / 8e (Structure par Domaines / Sous-domaines et colonne Max intégrée) */}
                    {isEB && domains?.map((domain, dIdx) => (
                        <React.Fragment key={`eb-dom-${dIdx}`}>
                            <tr className="border-b border-black font-sans font-bold text-left uppercase text-[9px] bg-slate-100">
                                <td colSpan={is8eme ? 15 : 14} className="p-1 pl-2 font-extrabold underline decoration-1">
                                    {domain.name}
                                </td>
                            </tr>
                            {domain.subjects?.map((sub, sIdx) => (
                                <tr key={`eb-sub-${sIdx}`} className="border-b border-black text-[10px]">
                                    <td className="border-r border-black p-1 text-left pl-4 font-medium">{sub.subjectName}</td>
                                    {/* S1 */}
                                    <td className="border-r border-black p-0.5 bg-gray-50 font-bold">{sub.maxPeriod || '-'}</td>
                                    <td className="border-r border-black p-0.5">{sub.p1 ?? ''}</td>
                                    <td className="border-r border-black p-0.5">{sub.p2 ?? ''}</td>
                                    <td className="border-r border-black p-0.5">{sub.exam1 ?? ''}</td>
                                    <td className="border-r border-black p-0.5 font-bold bg-slate-50">{sub.totalS1 ?? ''}</td>
                                    {/* S2 */}
                                    <td className="border-r border-black p-0.5 bg-gray-50 font-bold">{sub.maxPeriod || '-'}</td>
                                    <td className="border-r border-black p-0.5">{sub.p3 ?? ''}</td>
                                    <td className="border-r border-black p-0.5">{sub.p4 ?? ''}</td>
                                    <td className="border-r border-black p-0.5">{sub.exam2 ?? ''}</td>
                                    <td className="border-r border-black p-0.5 font-bold bg-slate-50">{sub.totalS2 ?? ''}</td>
                                    {/* Synthèse annuelle */}
                                    <td className="border-r border-black p-0.5 font-black bg-gray-100 text-sm">{sub.totalAnnuel ?? ''}</td>
                                    {is8eme && <td className="border-r border-black p-0.5 font-bold text-amber-900 bg-amber-50/30">{sub.tenasosp ?? ''}</td>}
                                    {/* Repêchage */}
                                    <td className="border-r border-black p-0.5"></td>
                                    <td className="p-0.5"></td>
                                </tr>
                            ))}
                            {/* Ligne Sous-Total par domaine (Conforme à la maquette CTEB) */}
                            <tr className="border-b border-black font-bold text-[9.5px] bg-gray-50 italic">
                                <td className="border-r border-black text-left pl-2 font-sans">Sous - Total</td>
                                {isEB && <td className="border-r border-black p-0.5 font-sans font-black">{domain.subMaxPeriod || ''}</td>}
                                <td className="border-r border-black p-0.5">{domain.subP1 ?? ''}</td>
                                <td className="border-r border-black p-0.5">{domain.subP2 ?? ''}</td>
                                <td className="border-r border-black p-0.5">{domain.subExam1 ?? ''}</td>
                                <td className="border-r border-black p-0.5 font-black">{domain.subTotalS1 ?? ''}</td>
                                {isEB && <td className="border-r border-black p-0.5 font-sans font-black">{domain.subMaxPeriod || ''}</td>}
                                <td className="border-r border-black p-0.5">{domain.subP3 ?? ''}</td>
                                <td className="border-r border-black p-0.5">{domain.subP4 ?? ''}</td>
                                <td className="border-r border-black p-0.5">{domain.subExam2 ?? ''}</td>
                                <td className="border-r border-black p-0.5 font-black">{domain.subTotalS2 ?? ''}</td>
                                <td className="border-r border-black p-0.5 font-black text-gray-800 bg-gray-100">{domain.subTotalAnnuel ?? ''}</td>
                                {is8eme && <td className="border-r border-black p-0.5 font-bold bg-amber-50">{domain.subTenasosp ?? ''}</td>}
                                <td colSpan={2} className="bg-white"></td>
                            </tr>
                        </React.Fragment>
                    ))}

                    {/* ================================================= */}
                    {/* LIGNES DE SYNTHÈSE STRICTEMENT OFFICIELLES        */}
                    {/* ================================================= */}
                    
                    {/* 1. MAXIMA GÉNÉRAUX */}
                    <tr className="border-b-[1.5px] border-t-[1.5px] border-black font-sans font-black uppercase bg-gray-100 text-[9.5px]">
                        <td className="border-r border-black p-1 text-left">MAXIMA GENERAUX</td>
                        {isEB && <td className="border-r border-black p-0.5 bg-gray-200">{results?.maxTotalPeriod ?? '-'}</td>}
                        <td className="border-r border-black p-0.5">{results?.maxS1_P1 ?? '-'}</td>
                        <td className="border-r border-black p-0.5">{results?.maxS1_P2 ?? '-'}</td>
                        <td className="border-r border-black p-0.5">{results?.maxS1_Ex ?? '-'}</td>
                        <td className="border-r border-black p-0.5 bg-gray-200 font-extrabold">{results?.maxS1_Tot ?? '-'}</td>
                        {isEB && <td className="border-r border-black p-0.5 bg-gray-200">{results?.maxTotalPeriod ?? '-'}</td>}
                        <td className="border-r border-black p-0.5">{results?.maxS2_P3 ?? '-'}</td>
                        <td className="border-r border-black p-0.5">{results?.maxS2_P4 ?? '-'}</td>
                        <td className="border-r border-black p-0.5">{results?.maxS2_Ex ?? '-'}</td>
                        <td className="border-r border-black p-0.5 bg-gray-200 font-extrabold">{results?.maxS2_Tot ?? '-'}</td>
                        <td className="border-r border-black p-0.5 bg-gray-300 font-black text-sm">{results?.totalGeneralMax ?? '-'}</td>
                        {is8eme && <td className="border-r border-black p-0.5 bg-amber-100 font-bold">{results?.maxTenasospTot ?? '/80'}</td>}
                        <td colSpan={2} className="bg-white border-l border-black"></td>
                    </tr>

                    {/* 2. TOTAUX OBTENUS */}
                    <tr className="border-b border-black font-bold uppercase bg-white text-[10px]">
                        <td className="border-r border-black p-1 text-left font-sans">TOTAUX OBTENUS</td>
                        {isEB && <td className="border-r border-black bg-slate-50"></td>}
                        <td className="border-r border-black p-0.5">{results?.obtS1_P1 ?? ''}</td>
                        <td className="border-r border-black p-0.5">{results?.obtS1_P2 ?? ''}</td>
                        <td className="border-r border-black p-0.5">{results?.obtS1_Ex ?? ''}</td>
                        <td className="border-r border-black p-0.5 font-black bg-slate-50">{results?.totalObtainedS1 ?? ''}</td>
                        {isEB && <td className="border-r border-black bg-slate-50"></td>}
                        <td className="border-r border-black p-0.5">{results?.obtS2_P3 ?? ''}</td>
                        <td className="border-r border-black p-0.5">{results?.obtS2_P4 ?? ''}</td>
                        <td className="border-r border-black p-0.5">{results?.obtS2_Ex ?? ''}</td>
                        <td className="border-r border-black p-0.5 font-black bg-slate-50">{results?.totalObtainedS2 ?? ''}</td>
                        <td className="border-r border-black p-0.5 font-black text-base bg-gray-100 text-blue-950">{results?.totalObtainedAnnual ?? ''}</td>
                        {is8eme && <td className="border-r border-black p-0.5 font-bold bg-amber-50">{results?.obtTenasosp ?? ''}</td>}
                        <td colSpan={2} className="bg-white border-l border-black"></td>
                    </tr>

                    {/* 3. POURCENTAGE */}
                    <tr className="border-b border-black font-bold uppercase bg-white text-[9.5px]">
                        <td className="border-r border-black p-1 text-left font-sans">POURCENTAGE</td>
                        {isEB && <td className="border-r border-black bg-slate-50"></td>}
                        <td className="border-r border-black p-0.5">{results?.pctS1_P1 ? `${results.pctS1_P1}%` : ''}</td>
                        <td className="border-r border-black p-0.5">{results?.pctS1_P2 ? `${results.pctS1_P2}%` : ''}</td>
                        <td className="border-r border-black p-0.5">{results?.pctS1_Ex ? `${results.pctS1_Ex}%` : ''}</td>
                        <td className="border-r border-black p-0.5 font-extrabold text-blue-700">{results?.percentageS1 ? `${results.percentageS1}%` : ''}</td>
                        {isEB && <td className="border-r border-black bg-slate-50"></td>}
                        <td className="border-r border-black p-0.5">{results?.pctS2_P3 ? `${results.pctS2_P3}%` : ''}</td>
                        <td className="border-r border-black p-0.5">{results?.pctS2_P4 ? `${results.pctS2_P4}%` : ''}</td>
                        <td className="border-r border-black p-0.5">{results?.pctS2_Ex ? `${results.pctS2_Ex}%` : ''}</td>
                        <td className="border-r border-black p-0.5 font-extrabold text-blue-700">{results?.percentageS2 ? `${results.percentageS2}%` : ''}</td>
                        <td className="border-r border-black p-0.5 font-black text-sm text-emerald-700 bg-emerald-50">{results?.percentageAnnual ? `${results.percentageAnnual}%` : ''}</td>
                        {is8eme && <td className="border-r border-black p-0.5 font-bold text-amber-700">{results?.pctTenasosp ? `${results.pctTenasosp}%` : ''}</td>}
                        <td colSpan={2} className="bg-white border-l border-black"></td>
                    </tr>

                    {/* 4. PLACE / RANG */}
                    <tr className="border-b-[1.5px] border-black font-bold uppercase bg-white text-[9.5px]">
                        <td className="border-r border-black p-1 text-left font-sans">PLACE / RANG</td>
                        {isEB && <td className="border-r border-black bg-slate-50"></td>}
                        <td className="border-r border-black p-0.5">{results?.placeS1_P1 || ''}</td>
                        <td className="border-r border-black p-0.5">{results?.placeS1_P2 || ''}</td>
                        <td className="border-r border-black p-0.5">{results?.placeS1_Ex || ''}</td>
                        <td className="border-r border-black p-0.5 bg-slate-50 font-bold">{results?.placeS1 || ''}</td>
                        {isEB && <td className="border-r border-black bg-slate-50"></td>}
                        <td className="border-r border-black p-0.5">{results?.placeS2_P3 || ''}</td>
                        <td className="border-r border-black p-0.5">{results?.placeS2_P4 || ''}</td>
                        <td className="border-r border-black p-0.5">{results?.placeS2_Ex || ''}</td>
                        <td className="border-r border-black p-0.5 bg-slate-50 font-bold">{results?.placeS2 || ''}</td>
                        <td className="border-r border-black p-0.5 font-black bg-gray-100">{results?.placeAnnual || ''}</td>
                        {is8eme && <td className="border-r border-black p-0.5">{results?.placeTenasosp || ''}</td>}
                        <td colSpan={2} className="bg-white border-l border-black"></td>
                    </tr>
                </tbody>
            </table>

            {/* BLOC INFÉRIEUR : APPLICATION, CONDUITE ET SIGNATURES REGLEMENTAIRES */}
            <div className="w-full flex mt-2 border-[1.5px] border-black h-[115px] page-break-inside-avoid">
                {/* Section Gauche : Discipline et Décision du Conseil */}
                <div className="w-[45%] border-r-[1.5px] border-black flex flex-col justify-between">
                    <table className="w-full text-center text-[8.5px] uppercase font-bold border-b border-black">
                        <tbody>
                            <tr className="border-b border-black">
                                <td className="border-r border-black p-1 text-left font-sans w-24">APPLICATION</td>
                                <td className="border-r border-black p-1 w-8">{behavior?.appP1 ?? ''}</td>
                                <td className="border-r border-black p-1 w-8">{behavior?.appP2 ?? ''}</td>
                                <td className="border-r border-black p-1 w-8">{behavior?.appP3 ?? ''}</td>
                                <td className="p-1 w-8">{behavior?.appP4 ?? ''}</td>
                            </tr>
                            <tr>
                                <td className="border-r border-black p-1 text-left font-sans">CONDUITE</td>
                                <td className="border-r border-black p-1">{behavior?.condP1 ?? ''}</td>
                                <td className="border-r border-black p-1">{behavior?.condP2 ?? ''}</td>
                                <td className="border-r border-black p-1">{behavior?.condP3 ?? ''}</td>
                                <td className="p-1">{behavior?.condP4 ?? ''}</td>
                            </tr>
                        </tbody>
                    </table>
                    <div className="p-1.5 flex-1 flex flex-col justify-start">
                        <span className="underline font-sans font-bold text-[8px]">DECISION DU CONSEIL DE DELIBERATION :</span>
                        <p className="mt-1 font-sans font-black text-[11px] text-center text-red-950 uppercase leading-snug">
                            {results?.decision || "..........................................................................."}
                        </p>
                    </div>
                </div>

                {/* Section Droite : Signatures et Clôture Géographique */}
                <div className="w-[55%] p-1.5 flex flex-col justify-between text-[9px]">
                    <div className="text-right w-full font-normal italic pr-2 text-[8.5px]">
                        Fait à ................................., le .... / .... / 20 ....
                    </div>
                    
                    <div className="grid grid-cols-3 font-bold text-center items-start gap-1">
                        <div className="flex flex-col justify-between h-16">
                            <p className="underline uppercase text-[8.5px] font-sans">LE TITULAIRE</p>
                            <div className="text-[7px] text-gray-400 font-normal italic">(Signature)</div>
                        </div>
                        <div className="flex flex-col justify-between h-16 border-x border-black/10 px-1">
                            <p className="underline uppercase text-[8.5px] font-sans leading-none">LE DIRECTEUR<br/>OU PREFET</p>
                            <div className="text-[7px] text-gray-300 font-normal flex items-center justify-center mb-1">
                                (Sceau de l'école)
                            </div>
                        </div>
                        <div className="flex flex-col justify-between h-16">
                            <p className="underline uppercase text-[8.5px] font-sans">LE PARENT</p>
                            <div className="text-[7px] text-gray-400 font-normal italic">(Visa)</div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default BulletinBody;