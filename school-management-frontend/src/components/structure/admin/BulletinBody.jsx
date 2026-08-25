import React from 'react';

const BulletinBody = ({ bulletinData, header }) => {
    if (!bulletinData) return <div className="text-center p-4 font-serif">Chargement de la grille...</div>;

    const { domains, results } = bulletinData;

    // Classe CSS pour l'effet hachuré officiel des cellules non applicables
    const hatchedBg = "bg-[repeating-linear-gradient(-45deg,#a3a3a3,#a3a3a3_1px,transparent_1px,transparent_4px)] print:opacity-70";
    
    // Style pour forcer l'impression du fond noir de la colonne de séparation et des fins de lignes Domaines
    const printBlackColStyle = { backgroundColor: 'black', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' };
    
    // Style pour forcer l'impression du fond gris sur les lignes de Domaines/Sous-domaines
    const printGrayBgStyle = { backgroundColor: '#d1d5db', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' };

    return (
        <div className="relative w-full text-black font-serif text-[10px] leading-tight print:text-black">
            
            {/* GRILLE PRINCIPALE DES EVALUATIONS */}
            <table className="relative z-10 w-full border-collapse border-2 border-black text-center table-fixed bg-transparent">
                
                {/* ================================================= */}
                {/* DÉFINITION STRICTE DES LARGEURS DE COLONNES       */}
                {/* ================================================= */}
                <colgroup>
                    <col className="w-[23.5%]" /> {/* 1. BRANCHES */}
                    
                    {/* SEMESTRE 1 */}
                    <col className="w-[3%]" />    {/* 2. S1: MAX TJ */}
                    <col className="w-[3.5%]" />  {/* 3. S1: P1 */}
                    <col className="w-[3.5%]" />  {/* 4. S1: P2 */}
                    <col className="w-[3.5%]" />  {/* 5. S1: MAX EXAM */}
                    <col className="w-[3.5%]" />  {/* 6. S1: OBT EXAM */}
                    <col className="w-[4%]" />    {/* 7. S1: MAX TOTAL */}
                    <col className="w-[4%]" />    {/* 8. S1: OBT TOTAL */}
                    
                    {/* SEMESTRE 2 */}
                    <col className="w-[3%]" />    {/* 9. S2: MAX TJ */}
                    <col className="w-[3.5%]" />  {/* 10. S2: P3 */}
                    <col className="w-[3.5%]" />  {/* 11. S2: P4 */}
                    <col className="w-[3.5%]" />  {/* 12. S2: MAX EXAM */}
                    <col className="w-[3.5%]" />  {/* 13. S2: OBT EXAM */}
                    <col className="w-[4%]" />    {/* 14. S2: MAX TOTAL */}
                    <col className="w-[4%]" />    {/* 15. S2: OBT TOTAL */}
                    
                    {/* TOTAL GENERAL */}
                    <col className="w-[4.5%]" />  {/* 16. TOT GEN: MAX */}
                    <col className="w-[4.5%]" />  {/* 17. TOT GEN: OBT */}
                    
                    {/* RESTE */}
                    <col className="w-[1%]" />    {/* 18. COLONNE NOIRE */}
                    <col className="w-[4.5%]" />  {/* 19. REPECHAGE % */}
                    <col className="w-[12%]" />   {/* 20. SIGN. PROF */}
                </colgroup>

                {/* ================================================= */}
                {/* EN-TÊTE : FORMAT ÉDUCATION DE BASE                */}
                {/* ================================================= */}
                <thead>
                    <tr className="border-b-2 border-black text-[10px] font-bold uppercase bg-transparent">
                        <th rowSpan={3} className="border-r-2 border-black p-1 text-center align-middle font-black">BRANCHES</th>
                        <th colSpan={7} className="border-r-2 border-black p-0.5 align-middle">PREMIER SEMESTRE</th>
                        <th colSpan={7} className="border-r-2 border-black p-0.5 align-middle">SECOND SEMESTRE</th>
                        <th colSpan={2} rowSpan={3} className="border-r border-black p-0.5 text-[9px] align-middle font-black leading-tight">TOTAL<br/>GENERAL</th>
                        <th rowSpan={3} className="border-r-2 border-black" style={printBlackColStyle}></th>
                        <th colSpan={2} className="p-0.5 text-[9px] align-middle leading-tight font-black">EXAMEN DE<br/>REPECHAGE</th>
                    </tr>
                    <tr className="border-b border-black text-[8px] font-bold bg-transparent">
                        <th rowSpan={2} className="border-r border-black p-0.5 align-middle">MAX.</th>
                        <th colSpan={2} className="border-r border-black p-0.5 align-middle leading-tight">TRAVAUX<br/>JOURNAL.</th>
                        <th colSpan={2} rowSpan={2} className="border-r border-black p-0.4 align-middle">MAX.EXAM.</th>
                        <th colSpan={2} rowSpan={2} className="border-r-2 border-black p-0.5 align-middle">TOTAL</th>
                        
                        <th rowSpan={2} className="border-r border-black p-0.5 align-middle">MAX.</th>
                        <th colSpan={2} className="border-r border-black p-0.5 align-middle leading-tight">TRAVAUX<br/>JOURNAL.</th>
                        <th colSpan={2} rowSpan={2} className="border-r border-black p-0.4 align-middle">MAX.EXAM.</th>
                        <th colSpan={2} rowSpan={2} className="border-r-2 border-black p-0.5 align-middle">TOTAL</th>
                        
                        <th rowSpan={2} className="border-r border-black p-0.5 align-middle">%</th>
                        <th rowSpan={2} className="p-0.5 align-middle leading-tight">Sign. Prof.</th>
                    </tr>
                    <tr className="border-b-2 border-black text-[8px] font-bold bg-transparent">
                        <th className="border-r border-black p-0.5">1ère P</th>
                        <th className="border-r border-black p-0.5">2ème P</th>
                        <th className="border-r border-black p-0.5">3ème P</th>
                        <th className="border-r border-black p-0.5">4ème P</th>
                    </tr>
                </thead>

                {/* ================================================= */}
                {/* CORPS DU TABLEAU (Hiérarchie Dynamique)           */}
                {/* ================================================= */}
                <tbody className="bg-transparent">
                    
                    {domains?.map((domain, dIdx) => (
                        <React.Fragment key={`eb-dom-${dIdx}`}>
                            
                            {/* 1. LIGNE DOMAINE */}
                            <tr className="border-b border-black font-black text-left text-[9px] bg-gray-300" style={printGrayBgStyle}>
                                <td colSpan={15} className="border-r-2 border-black p-1 pl-2 uppercase tracking-wider">
                                    {domain.domainName || domain.name}
                                </td>
                                <td colSpan={5} className="bg-black" style={printBlackColStyle}></td>
                            </tr>
                            
                            {/* 2. LIGNES DES COURS DIRECTS */}
                            {domain.subjects?.map((sub, sIdx) => (
                                <tr key={`eb-dom-sub-${dIdx}-${sIdx}`} className="border-b border-black text-[10px] bg-transparent">
                                    <td className="border-r-2 border-black p-1 text-left pl-3 font-normal leading-tight">{sub.subjectName || sub.name}</td>
                                    
                                    {/* S1 */}
                                    <td className="border-r border-black p-0.5 font-bold">{sub.maxP1 || sub.maxPeriod || '10'}</td>
                                    <td className="border-r border-black p-0.5">{sub.p1 ?? ''}</td>
                                    <td className="border-r border-black p-0.5">{sub.p2 ?? ''}</td>
                                    <td className="border-r border-black p-0.5 font-bold">{sub.maxExam1 || sub.maxExam || '20'}</td>
                                    <td className="border-r border-black p-0.5 font-bold">{sub.exam1 ?? ''}</td>
                                    <td className="border-r border-black p-0.5 font-bold">{sub.maxTotalS1 || '40'}</td>
                                    <td className="border-r-2 border-black p-0.5 font-bold">{sub.totalS1 ?? ''}</td>
                                    
                                    {/* S2 */}
                                    <td className="border-r border-black p-0.5 font-bold">{sub.maxP3 || sub.maxPeriod || '10'}</td>
                                    <td className="border-r border-black p-0.5">{sub.p3 ?? ''}</td>
                                    <td className="border-r border-black p-0.5">{sub.p4 ?? ''}</td>
                                    <td className="border-r border-black p-0.5 font-bold">{sub.maxExam2 || sub.maxExam || '20'}</td>
                                    <td className="border-r border-black p-0.5 font-bold">{sub.exam2 ?? ''}</td>
                                    <td className="border-r border-black p-0.5 font-bold">{sub.maxTotalS2 || '40'}</td>
                                    <td className="border-r-2 border-black p-0.5 font-bold">{sub.totalS2 ?? ''}</td>
                                    
                                    {/* TOT GEN */}
                                    <td className="border-r border-black p-0.5 font-bold">{sub.maxTotalGen || '80'}</td>
                                    <td className="border-r border-black p-0.5 font-black">{sub.totalAnnuel ?? ''}</td>
                                    
                                    {/* RESTE */}
                                    <td className="border-r-2 border-black" style={printBlackColStyle}></td>
                                    <td className="border-r border-black p-0.5 font-bold">{sub.repechagePct ?? ''}</td>
                                    <td className="p-0.5"></td>
                                </tr>
                            ))}

                            {/* 3. LIGNES DES SOUS-DOMAINES ET LEURS COURS */}
                            {domain.subDomains?.map((subDom, sdIdx) => {
                                const domainStr = (domain.domainName || domain.name || '').trim().toUpperCase();
                                const subDomStr = (subDom.subDomainName || subDom.name || '').trim().toUpperCase();
                                const isRedundant = subDomStr === domainStr;

                                return (
                                <React.Fragment key={`eb-subdom-${dIdx}-${sdIdx}`}>
                                    {/* Ligne En-tête Sous-Domaine */}
                                    {!isRedundant && (
                                        <tr className="border-b border-black text-left text-[9px] bg-gray-300" style={printGrayBgStyle}>
                                            <td colSpan={15} className="border-r-2 border-black p-1 pl-4 font-bold italic text-gray-800">
                                                {subDom.subDomainName || subDom.name}
                                            </td>
                                            <td colSpan={5} className="bg-black" style={printBlackColStyle}></td>
                                        </tr>
                                    )}

                                    {/* Cours du Sous-Domaine */}
                                    {subDom.subjects?.map((sub, sIdx) => (
                                        <tr key={`eb-subdom-sub-${dIdx}-${sdIdx}-${sIdx}`} className="border-b border-black text-[10px] bg-transparent">
                                            <td className="border-r-2 border-black p-1 text-left pl-5 font-normal leading-tight">{sub.subjectName || sub.name}</td>
                                            
                                            <td className="border-r border-black p-0.5 font-bold">{sub.maxP1 || sub.maxPeriod || '10'}</td>
                                            <td className="border-r border-black p-0.5">{sub.p1 ?? ''}</td>
                                            <td className="border-r border-black p-0.5">{sub.p2 ?? ''}</td>
                                            <td className="border-r border-black p-0.5 font-bold">{sub.maxExam1 || sub.maxExam || '20'}</td>
                                            <td className="border-r border-black p-0.5 font-bold">{sub.exam1 ?? ''}</td>
                                            <td className="border-r border-black p-0.5 font-bold">{sub.maxTotalS1 || '40'}</td>
                                            <td className="border-r-2 border-black p-0.5 font-bold">{sub.totalS1 ?? ''}</td>
                                            
                                            <td className="border-r border-black p-0.5 font-bold">{sub.maxP3 || sub.maxPeriod || '10'}</td>
                                            <td className="border-r border-black p-0.5">{sub.p3 ?? ''}</td>
                                            <td className="border-r border-black p-0.5">{sub.p4 ?? ''}</td>
                                            <td className="border-r border-black p-0.5 font-bold">{sub.maxExam2 || sub.maxExam || '20'}</td>
                                            <td className="border-r border-black p-0.5 font-bold">{sub.exam2 ?? ''}</td>
                                            <td className="border-r border-black p-0.5 font-bold">{sub.maxTotalS2 || '40'}</td>
                                            <td className="border-r-2 border-black p-0.5 font-bold">{sub.totalS2 ?? ''}</td>
                                            
                                            <td className="border-r border-black p-0.5 font-bold">{sub.maxTotalGen || '80'}</td>
                                            <td className="border-r border-black p-0.5 font-black">{sub.totalAnnuel ?? ''}</td>
                                            
                                            <td className="border-r-2 border-black" style={printBlackColStyle}></td>
                                            <td className="border-r border-black p-0.5 font-bold">{sub.repechagePct ?? ''}</td>
                                            <td className="p-0.5"></td>
                                        </tr>
                                    ))}

                                    {/* Sous-Total du Sous-Domaine */}
                                    <tr className="border-b border-black font-bold text-[9px] bg-gray-50/50">
                                        <td className="border-r-2 border-black text-left pl-4 italic">Sous-Total</td>
                                        <td className="border-r border-black p-0.5 font-bold">{subDom.subMaxP1 || ''}</td>
                                        <td className="border-r border-black p-0.5">{subDom.obtP1 ?? ''}</td>
                                        <td className="border-r border-black p-0.5">{subDom.obtP2 ?? ''}</td>
                                        <td className="border-r border-black p-0.5 font-bold">{subDom.subMaxExam1 ?? ''}</td>
                                        <td className="border-r border-black p-0.5 font-bold">{subDom.obtExam1 ?? ''}</td>
                                        <td className="border-r border-black p-0.5 font-bold">{subDom.subMaxTotalS1 ?? ''}</td>
                                        <td className="border-r-2 border-black p-0.5 font-bold">{subDom.obtTotalS1 ?? ''}</td>
                                        
                                        <td className="border-r border-black p-0.5 font-bold">{subDom.subMaxP3 || ''}</td>
                                        <td className="border-r border-black p-0.5">{subDom.obtP3 ?? ''}</td>
                                        <td className="border-r border-black p-0.5">{subDom.obtP4 ?? ''}</td>
                                        <td className="border-r border-black p-0.5 font-bold">{subDom.subMaxExam2 ?? ''}</td>
                                        <td className="border-r border-black p-0.5 font-bold">{subDom.obtExam2 ?? ''}</td>
                                        <td className="border-r border-black p-0.5 font-bold">{subDom.subMaxTotalS2 ?? ''}</td>
                                        <td className="border-r-2 border-black p-0.5 font-bold">{subDom.obtTotalS2 ?? ''}</td>
                                        
                                        <td className="border-r border-black p-0.5 font-bold">{subDom.subMaxTotalGen ?? ''}</td>
                                        <td className="border-r border-black p-0.5 font-black">{subDom.obtTotalAnnuel ?? ''}</td>
                                        
                                        <td className="border-r-2 border-black" style={printBlackColStyle}></td>
                                        <td className="border-r border-black p-0.5"></td>
                                        <td className="p-0.5"></td>
                                    </tr>
                                </React.Fragment>
                                );
                            })}
                        </React.Fragment>
                    ))}

                    {/* ================================================= */}
                    {/* LIGNES DE SYNTHÈSE DE FIN DE GRILLE               */}
                    {/* ================================================= */}
                    
                    {/* 1. MAXIMA GENERAUX */}
                    <tr className="border-b border-black font-black uppercase bg-transparent text-[9.5px]">
                        <td className="border-r-2 border-black p-1 text-left font-black pl-2">MAXIMA GENERAUX</td>
                        <td className="border-r border-black p-0.5 font-bold">{bulletinData?.totalMaxP1 || results?.maxPeriod || ''}</td>
                        <td className="border-r border-black p-0.5"></td>
                        <td className="border-r border-black p-0.5"></td>
                        <td className="border-r border-black p-0.5 font-bold">{bulletinData?.totalMaxExam1 || results?.maxExam || ''}</td>
                        <td className="border-r border-black p-0.5"></td>
                        <td className="border-r border-black p-0.5 font-black">{bulletinData?.totalMaxS1 || results?.maxS1_Tot || ''}</td>
                        <td className="border-r-2 border-black p-0.5"></td>
                        
                        <td className="border-r border-black p-0.5 font-bold">{bulletinData?.totalMaxP3 || results?.maxPeriod || ''}</td>
                        <td className="border-r border-black p-0.5"></td>
                        <td className="border-r border-black p-0.5"></td>
                        <td className="border-r border-black p-0.5 font-bold">{bulletinData?.totalMaxExam2 || results?.maxExam || ''}</td>
                        <td className="border-r border-black p-0.5"></td>
                        <td className="border-r border-black p-0.5 font-black">{bulletinData?.totalMaxS2 || results?.maxS2_Tot || ''}</td>
                        <td className="border-r-2 border-black p-0.5"></td>
                        
                        <td className="border-r border-black p-0.5 font-black">{bulletinData?.totalGeneralMax || results?.totalGeneralMax || ''}</td>
                        <td className="border-r border-black p-0.5"></td>
                        
                        <td className="border-r-2 border-black" style={printBlackColStyle}></td>
                        <td className="border-r border-black bg-black" style={printBlackColStyle}></td>
                        <td className="bg-black" style={printBlackColStyle}></td>
                    </tr>

                    {/* 2. TOTAUX OBTENUS */}
                    <tr className="border-b border-black font-bold uppercase bg-transparent text-[10px]">
                        <td className="border-r-2 border-black p-1 text-left font-black pl-2">TOTAUX</td>
                        <td className={`border-r border-black ${hatchedBg}`}></td>
                        <td className="border-r border-black p-0.5">{results?.obtS1_P1 ?? ''}</td>
                        <td className="border-r border-black p-0.5">{results?.obtS1_P2 ?? ''}</td>
                        <td className={`border-r border-black ${hatchedBg}`}></td>
                        <td className="border-r border-black p-0.5">{results?.obtS1_Exam ?? ''}</td>
                        <td className={`border-r border-black ${hatchedBg}`}></td>
                        <td className="border-r-2 border-black p-0.5 font-black">{results?.obtS1_Tot ?? ''}</td>
                        
                        <td className={`border-r border-black ${hatchedBg}`}></td>
                        <td className="border-r border-black p-0.5">{results?.obtS2_P3 ?? ''}</td>
                        <td className="border-r border-black p-0.5">{results?.obtS2_P4 ?? ''}</td>
                        <td className={`border-r border-black ${hatchedBg}`}></td>
                        <td className="border-r border-black p-0.5">{results?.obtS2_Exam ?? ''}</td>
                        <td className={`border-r border-black ${hatchedBg}`}></td>
                        <td className="border-r-2 border-black p-0.5 font-black">{results?.obtS2_Tot ?? ''}</td>
                        
                        <td className={`border-r border-black ${hatchedBg}`}></td>
                        <td className="border-r border-black p-0.5 font-black">{results?.totalGeneralObt ?? ''}</td>
                        
                        <td className="border-r-2 border-black" style={printBlackColStyle}></td>
                        
                        {/* Bloc fixe occupant les 6 dernières lignes */}
                        <td colSpan={2} rowSpan={6} className="p-1 text-left align-top font-bold text-[8px] leading-tight">
                            <div>- PASSE (1)</div>
                            <div>- DOUBLE (1)</div>
                            <div className="mt-1">LE....../...../20...</div>
                            <div>Le Chef d'Etablissement</div>
                            <div className="mt-2 text-left">Sceau de l'école</div>
                        </td>
                    </tr>

                    {/* 3. POURCENTAGE */}
                    <tr className="border-b border-black font-bold uppercase bg-transparent text-[9.5px]">
                        <td className="border-r-2 border-black p-1 text-left font-black pl-2">POURCENTAGE</td>
                        <td className={`border-r border-black ${hatchedBg}`}></td>
                        <td className="border-r border-black p-0.5 font-bold">{results?.pctS1_P1 ? `${results.pctS1_P1}%` : ''}</td>
                        <td className="border-r border-black p-0.5 font-bold">{results?.pctS1_P2 ? `${results.pctS1_P2}%` : ''}</td>
                        <td className={`border-r border-black ${hatchedBg}`}></td>
                        <td className="border-r border-black p-0.5 font-bold">{results?.pctS1_Exam ? `${results.pctS1_Exam}%` : ''}</td>
                        <td className={`border-r border-black ${hatchedBg}`}></td>
                        <td className="border-r-2 border-black p-0.5 font-black">{results?.pctS1_Tot ? `${results.pctS1_Tot}%` : ''}</td>
                        
                        <td className={`border-r border-black ${hatchedBg}`}></td>
                        <td className="border-r border-black p-0.5 font-bold">{results?.pctS2_P3 ? `${results.pctS2_P3}%` : ''}</td>
                        <td className="border-r border-black p-0.5 font-bold">{results?.pctS2_P4 ? `${results.pctS2_P4}%` : ''}</td>
                        <td className={`border-r border-black ${hatchedBg}`}></td>
                        <td className="border-r border-black p-0.5 font-bold">{results?.pctS2_Exam ? `${results.pctS2_Exam}%` : ''}</td>
                        <td className={`border-r border-black ${hatchedBg}`}></td>
                        <td className="border-r-2 border-black p-0.5 font-black">{results?.pctS2_Tot ? `${results.pctS2_Tot}%` : ''}</td>
                        
                        <td className={`border-r border-black ${hatchedBg}`}></td>
                        <td className="border-r border-black p-0.5 font-black">{results?.pourcentageGeneral ? `${results.pourcentageGeneral}%` : ''}</td>
                        
                        <td className="border-r-2 border-black" style={printBlackColStyle}></td>
                    </tr>

                    {/* 4. PLACE / NBRE D'ELEVES */}
                    <tr className="border-b border-black font-bold uppercase bg-transparent text-[9.5px]">
                        <td className="border-r-2 border-black p-1 text-left font-black pl-2">PLACE / NBRE D'ELEVES</td>
                        <td className={`border-r border-black ${hatchedBg}`}></td>
                        <td className="border-r border-black p-0.5">{results?.placeS1_P1 || ''} / {bulletinData?.studentCount || results?.nbEleves || ''}</td>
                        <td className="border-r border-black p-0.5">{results?.placeS1_P2 || ''} / {bulletinData?.studentCount || results?.nbEleves || ''}</td>
                        <td className={`border-r border-black ${hatchedBg}`}></td>
                        <td className="border-r border-black p-0.5"></td>
                        <td className={`border-r border-black ${hatchedBg}`}></td>
                        <td className="border-r-2 border-black p-0.5 font-bold">{results?.placeS1_Tot || ''} / {bulletinData?.studentCount || results?.nbEleves || ''}</td>
                        
                        <td className={`border-r border-black ${hatchedBg}`}></td>
                        <td className="border-r border-black p-0.5">{results?.placeS2_P3 || ''} / {bulletinData?.studentCount || results?.nbEleves || ''}</td>
                        <td className="border-r border-black p-0.5">{results?.placeS2_P4 || ''} / {bulletinData?.studentCount || results?.nbEleves || ''}</td>
                        <td className={`border-r border-black ${hatchedBg}`}></td>
                        <td className="border-r border-black p-0.5"></td>
                        <td className={`border-r border-black ${hatchedBg}`}></td>
                        <td className="border-r-2 border-black p-0.5 font-bold">{results?.placeS2_Tot || ''} / {bulletinData?.studentCount || results?.nbEleves || ''}</td>
                        
                        <td className={`border-r border-black ${hatchedBg}`}></td>
                        <td className="border-r border-black p-0.5 font-black">{results?.placeGeneral || ''} / {bulletinData?.studentCount || results?.nbEleves || ''}</td>
                        
                        <td className="border-r-2 border-black" style={printBlackColStyle}></td>
                    </tr>

                    {/* 5. APPLICATION */}
                    <tr className="border-b border-black font-bold uppercase bg-transparent text-[9.5px]">
                        <td className="border-r-2 border-black p-1 text-left font-black pl-2">APPLICATION</td>
                        <td className={`border-r border-black ${hatchedBg}`}></td>
                        <td className="border-r border-black p-0.5">{results?.appP1 || ''}</td>
                        <td className="border-r border-black p-0.5">{results?.appP2 || ''}</td>
                        <td className={`border-r border-black ${hatchedBg}`}></td>
                        <td className="border-r border-black p-0.5"></td>
                        <td className={`border-r border-black ${hatchedBg}`}></td>
                        <td className="border-r-2 border-black p-0.5"></td>
                        
                        <td className={`border-r border-black ${hatchedBg}`}></td>
                        <td className="border-r border-black p-0.5">{results?.appP3 || ''}</td>
                        <td className="border-r border-black p-0.5">{results?.appP4 || ''}</td>
                        <td className={`border-r border-black ${hatchedBg}`}></td>
                        <td className="border-r border-black p-0.5"></td>
                        <td className={`border-r border-black ${hatchedBg}`}></td>
                        <td className="border-r-2 border-black p-0.5"></td>
                        
                        <td className={`border-r border-black ${hatchedBg}`}></td>
                        <td className="border-r border-black p-0.5"></td>
                        
                        <td className="border-r-2 border-black" style={printBlackColStyle}></td>
                    </tr>

                    {/* 6. CONDUITE */}
                    <tr className="border-b border-black font-bold uppercase bg-transparent text-[9.5px]">
                        <td className="border-r-2 border-black p-1 text-left font-black pl-2">CONDUITE</td>
                        <td className={`border-r border-black ${hatchedBg}`}></td>
                        <td className="border-r border-black p-0.5">{results?.condP1 || ''}</td>
                        <td className="border-r border-black p-0.5">{results?.condP2 || ''}</td>
                        <td className={`border-r border-black ${hatchedBg}`}></td>
                        <td className="border-r border-black p-0.5"></td>
                        <td className={`border-r border-black ${hatchedBg}`}></td>
                        <td className="border-r-2 border-black p-0.5"></td>
                        
                        <td className={`border-r border-black ${hatchedBg}`}></td>
                        <td className="border-r border-black p-0.5">{results?.condP3 || ''}</td>
                        <td className="border-r border-black p-0.5">{results?.condP4 || ''}</td>
                        <td className={`border-r border-black ${hatchedBg}`}></td>
                        <td className="border-r border-black p-0.5"></td>
                        <td className={`border-r border-black ${hatchedBg}`}></td>
                        <td className="border-r-2 border-black p-0.5"></td>
                        
                        <td className={`border-r border-black ${hatchedBg}`}></td>
                        <td className="border-r border-black p-0.5"></td>
                        
                        <td className="border-r-2 border-black" style={printBlackColStyle}></td>
                    </tr>

                    {/* 7. SIGNATURE */}
                    <tr className="border-b border-black font-bold uppercase bg-transparent text-[9.5px]">
                        <td className="border-r-2 border-black p-1 text-left font-black pl-2">SIGNATURE</td>
                        
                        {/* S1: MAX et 1ère P fusionnés */}
                        <td colSpan={2} className="border-r border-black p-0.5"></td>
                        
                        {/* S1: 2ème P */}
                        <td className="border-r border-black p-0.5"></td>
                        
                        {/* S1: MAX.EXAM fusionné (2 sous-colonnes) */}
                        <td colSpan={2} className="border-r border-black p-0.5"></td>
                        
                        {/* S1: TOTAL fusionné (2 sous-colonnes) */}
                        <td colSpan={2} className="border-r-2 border-black p-0.5"></td>
                        
                        {/* S2: MAX */}
                        <td className="border-r border-black p-0.5"></td>
                        
                        {/* S2: 3ème P */}
                        <td className="border-r border-black p-0.5"></td>
                        
                        {/* S2: 4ème P */}
                        <td className="border-r border-black p-0.5"></td>
                        
                        {/* S2: De MAX.EXAM jusqu'à la colonne Noire fusionnés (7 colonnes) */}
                        <td colSpan={7} className="border-r-2 border-black p-0.5"></td>
                        
                        {/* NOTE: Les colonnes REPECHAGE % et SIGN. PROF sont déjà occupées par le rowspan du Chef d'Etablissement déclaré à la ligne TOTAUX */}
                    </tr>
                </tbody>
            </table>
        </div>
    );
};

export default BulletinBody;