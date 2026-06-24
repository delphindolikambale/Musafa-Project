import React from 'react';
import { getImageUrl } from '../../../services/api';

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
            
            {/* FILIGRANE / WATERMARK EN POSITION ABSOLUE SOUS LE TABLEAU */}
            {header?.watermarkLogoPath && (
                <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
                    <img 
                        src={getImageUrl(header.watermarkLogoPath)} 
                        alt="Filigrane Officiel MINEPST" 
                        className="w-[55%] h-auto object-contain opacity-[0.15] grayscale print:opacity-[0.20]"
                    />
                </div>
            )}

            {/* GRILLE PRINCIPALE DES EVALUATIONS */}
            <table className="relative z-10 w-full border-collapse border-2 border-black text-center table-fixed bg-transparent">
                
                {/* ================================================= */}
                {/* DÉFINITION STRICTE DES LARGEURS DE COLONNES (COLGROUP) */}
                {/* TOTAL : 20 Colonnes (100%)                          */}
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
                {/* EN-TÊTE : FORMAT ÉDUCATION DE BASE (7e & 8e)      */}
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
                        {/* SEMESTRE 1 */}
                        <th rowSpan={2} className="border-r border-black p-0.5 align-middle">MAX.</th>
                        <th colSpan={2} className="border-r border-black p-0.5 align-middle leading-tight">TRAVAUX<br/>JOURNAL.</th>
                        <th colSpan={2} rowSpan={2} className="border-r border-black p-0.4 align-middle">MAX.EXAM.</th>
                        <th colSpan={2} rowSpan={2} className="border-r-2 border-black p-0.5 align-middle">TOTAL</th>
                        
                        {/* SEMESTRE 2 */}
                        <th rowSpan={2} className="border-r border-black p-0.5 align-middle">MAX.</th>
                        <th colSpan={2} className="border-r border-black p-0.5 align-middle leading-tight">TRAVAUX<br/>JOURNAL.</th>
                        <th colSpan={2} rowSpan={2} className="border-r border-black p-0.4 align-middle">MAX.EXAM.</th>
                        <th colSpan={2} rowSpan={2} className="border-r-2 border-black p-0.5 align-middle">TOTAL</th>
                        
                        {/* TOTAL GENERAL est fusionné plus haut sur 3 lignes sans subdiviser MAX/OBT dans l'entête */}
                        
                        {/* REPECHAGE */}
                        <th rowSpan={2} className="border-r border-black p-0.5 align-middle">%</th>
                        <th rowSpan={2} className="p-0.5 align-middle leading-tight">Sign. Prof.</th>
                    </tr>
                    <tr className="border-b-2 border-black text-[8px] font-bold bg-transparent">
                        {/* SOUS-COLONNES S1 */}
                        <th className="border-r border-black p-0.5">1ère P</th>
                        <th className="border-r border-black p-0.5">2ème P</th>
                        {/* EXAMEN et TOTAL englobent cette ligne */}
                        
                        {/* SOUS-COLONNES S2 */}
                        <th className="border-r border-black p-0.5">3ème P</th>
                        <th className="border-r border-black p-0.5">4ème P</th>
                        {/* EXAMEN et TOTAL englobent cette ligne */}
                    </tr>
                </thead>

                {/* ================================================= */}
                {/* CORPS DU TABLEAU                                  */}
                {/* ================================================= */}
                <tbody className="bg-transparent">
                    
                    {domains?.map((domain, dIdx) => (
                        <React.Fragment key={`eb-dom-${dIdx}`}>
                            
                            {/* LIGNE DOMAINE (Gris puis Noir à partir du Total Général) */}
                            <tr className="border-b border-black font-black text-left text-[9px] bg-gray-300" style={printGrayBgStyle}>
                                <td colSpan={15} className="border-r-2 border-black p-1 pl-2 uppercase tracking-wider">
                                    {domain.name}
                                </td>
                                <td colSpan={5} className="bg-black" style={printBlackColStyle}></td>
                            </tr>
                            
                            {/* LIGNES DES BRANCHES */}
                            {domain.subjects?.map((sub, sIdx) => (
                                <tr key={`eb-sub-${sIdx}`} className="border-b border-black text-[10px] bg-transparent">
                                    <td className="border-r-2 border-black p-1 text-left pl-3 font-normal leading-tight">{sub.subjectName}</td>
                                    
                                    {/* S1 */}
                                    <td className="border-r border-black p-0.5 font-bold">{sub.maxPeriod || '10'}</td>
                                    <td className="border-r border-black p-0.5">{sub.p1 ?? ''}</td>
                                    <td className="border-r border-black p-0.5">{sub.p2 ?? ''}</td>
                                    <td className="border-r border-black p-0.5 font-bold">{sub.maxExam || '20'}</td>
                                    <td className="border-r border-black p-0.5 font-bold">{sub.exam1 ?? ''}</td>
                                    <td className="border-r border-black p-0.5 font-bold">{sub.maxTotalS1 || '40'}</td>
                                    <td className="border-r-2 border-black p-0.5 font-bold">{sub.totalS1 ?? ''}</td>
                                    
                                    {/* S2 */}
                                    <td className="border-r border-black p-0.5 font-bold">{sub.maxPeriod || '10'}</td>
                                    <td className="border-r border-black p-0.5">{sub.p3 ?? ''}</td>
                                    <td className="border-r border-black p-0.5">{sub.p4 ?? ''}</td>
                                    <td className="border-r border-black p-0.5 font-bold">{sub.maxExam || '20'}</td>
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
                            
                            {/* SOUS-TOTAL DU DOMAINE */}
                            <tr className="border-b-2 border-black font-bold text-[9.5px] bg-gray-50/50">
                                <td className="border-r-2 border-black text-left pl-2 italic">Sous-Total</td>
                                
                                {/* S1 */}
                                <td className="border-r border-black p-0.5 font-bold">{domain.subMaxPeriod || ''}</td>
                                <td className="border-r border-black p-0.5">{domain.subP1 ?? ''}</td>
                                <td className="border-r border-black p-0.5">{domain.subP2 ?? ''}</td>
                                <td className="border-r border-black p-0.5 font-bold">{domain.subMaxExam ?? ''}</td>
                                <td className="border-r border-black p-0.5 font-bold">{domain.subExam1 ?? ''}</td>
                                <td className="border-r border-black p-0.5 font-bold">{domain.subMaxTotalS1 ?? ''}</td>
                                <td className="border-r-2 border-black p-0.5 font-bold">{domain.subTotalS1 ?? ''}</td>
                                
                                {/* S2 */}
                                <td className="border-r border-black p-0.5 font-bold">{domain.subMaxPeriod || ''}</td>
                                <td className="border-r border-black p-0.5">{domain.subP3 ?? ''}</td>
                                <td className="border-r border-black p-0.5">{domain.subP4 ?? ''}</td>
                                <td className="border-r border-black p-0.5 font-bold">{domain.subMaxExam ?? ''}</td>
                                <td className="border-r border-black p-0.5 font-bold">{domain.subExam2 ?? ''}</td>
                                <td className="border-r border-black p-0.5 font-bold">{domain.subMaxTotalS2 ?? ''}</td>
                                <td className="border-r-2 border-black p-0.5 font-bold">{domain.subTotalS2 ?? ''}</td>
                                
                                {/* TOT GEN */}
                                <td className="border-r border-black p-0.5 font-bold">{domain.subMaxTotalGen ?? ''}</td>
                                <td className="border-r border-black p-0.5 font-black">{domain.subTotalAnnuel ?? ''}</td>
                                
                                {/* RESTE - NETTOYÉ */}
                                <td className="border-r-2 border-black" style={printBlackColStyle}></td>
                                <td className="border-r border-black p-0.5"></td>
                                <td className="p-0.5"></td>
                            </tr>
                        </React.Fragment>
                    ))}

                    {/* ================================================= */}
                    {/* LIGNES DE SYNTHÈSE DE FIN DE GRILLE               */}
                    {/* ================================================= */}
                    
                    {/* 1. MAXIMA GENERAUX - NETTOYÉ (Avec % et Sign. Prof remplis de noir) */}
                    <tr className="border-b border-black font-black uppercase bg-transparent text-[9.5px]">
                        <td className="border-r-2 border-black p-1 text-left font-black pl-2">MAXIMA GENERAUX</td>
                        <td className="border-r border-black p-0.5 font-bold">{results?.maxPeriod || ''}</td>
                        <td className="border-r border-black p-0.5"></td>
                        <td className="border-r border-black p-0.5"></td>
                        <td className="border-r border-black p-0.5 font-bold">{results?.maxExam || ''}</td>
                        <td className="border-r border-black p-0.5"></td>
                        <td className="border-r border-black p-0.5 font-black">{results?.maxS1_Tot || ''}</td>
                        <td className="border-r-2 border-black p-0.5"></td>
                        
                        <td className="border-r border-black p-0.5 font-bold">{results?.maxPeriod || ''}</td>
                        <td className="border-r border-black p-0.5"></td>
                        <td className="border-r border-black p-0.5"></td>
                        <td className="border-r border-black p-0.5 font-bold">{results?.maxExam || ''}</td>
                        <td className="border-r border-black p-0.5"></td>
                        <td className="border-r border-black p-0.5 font-black">{results?.maxS2_Tot || ''}</td>
                        <td className="border-r-2 border-black p-0.5"></td>
                        
                        <td className="border-r border-black p-0.5 font-black">{results?.totalGeneralMax || ''}</td>
                        <td className="border-r border-black p-0.5"></td>
                        
                        <td className="border-r-2 border-black" style={printBlackColStyle}></td>
                        <td className="border-r border-black bg-black" style={printBlackColStyle}></td>
                        <td className="bg-black" style={printBlackColStyle}></td>
                    </tr>

                    {/* 2. TOTAUX OBTENUS */}
                    <tr className="border-b border-black font-bold uppercase bg-transparent text-[10px]">
                        <td className="border-r-2 border-black p-1 text-left font-black pl-2">TOTAUX</td>
                        <td className={`border-r border-black ${hatchedBg}`}></td> {/* S1 MAX TJ */}
                        <td className="border-r border-black p-0.5">{results?.obtS1_P1 ?? ''}</td>
                        <td className="border-r border-black p-0.5">{results?.obtS1_P2 ?? ''}</td>
                        <td className={`border-r border-black ${hatchedBg}`}></td> {/* S1 EXAM MAX */}
                        <td className="border-r border-black p-0.5">{results?.obtS1_Exam ?? ''}</td>
                        <td className={`border-r border-black ${hatchedBg}`}></td> {/* S1 TOTAL MAX */}
                        <td className="border-r-2 border-black p-0.5 font-black">{results?.obtS1_Tot ?? ''}</td>
                        
                        <td className={`border-r border-black ${hatchedBg}`}></td> {/* S2 MAX TJ */}
                        <td className="border-r border-black p-0.5">{results?.obtS2_P3 ?? ''}</td>
                        <td className="border-r border-black p-0.5">{results?.obtS2_P4 ?? ''}</td>
                        <td className={`border-r border-black ${hatchedBg}`}></td> {/* S2 EXAM MAX */}
                        <td className="border-r border-black p-0.5">{results?.obtS2_Exam ?? ''}</td>
                        <td className={`border-r border-black ${hatchedBg}`}></td> {/* S2 TOTAL MAX */}
                        <td className="border-r-2 border-black p-0.5 font-black">{results?.obtS2_Tot ?? ''}</td>
                        
                        <td className={`border-r border-black ${hatchedBg}`}></td> {/* TOT GEN MAX */}
                        <td className="border-r border-black p-0.5 font-black">{results?.totalGeneralObt ?? ''}</td>
                        
                        <td className="border-r-2 border-black" style={printBlackColStyle}></td>
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
                        <td className={`border-r border-black ${hatchedBg}`}></td> {/* S1 MAX TJ */}
                        <td className="border-r border-black p-0.5 font-bold">{results?.pctS1_P1 ? `${results.pctS1_P1}%` : ''}</td>
                        <td className="border-r border-black p-0.5 font-bold">{results?.pctS1_P2 ? `${results.pctS1_P2}%` : ''}</td>
                        <td className={`border-r border-black ${hatchedBg}`}></td> {/* S1 EXAM MAX */}
                        <td className="border-r border-black p-0.5 font-bold">{results?.pctS1_Exam ? `${results.pctS1_Exam}%` : ''}</td>
                        <td className={`border-r border-black ${hatchedBg}`}></td> {/* S1 TOTAL MAX */}
                        <td className="border-r-2 border-black p-0.5 font-black">{results?.pctS1_Tot ? `${results.pctS1_Tot}%` : ''}</td>
                        
                        <td className={`border-r border-black ${hatchedBg}`}></td> {/* S2 MAX TJ */}
                        <td className="border-r border-black p-0.5 font-bold">{results?.pctS2_P3 ? `${results.pctS2_P3}%` : ''}</td>
                        <td className="border-r border-black p-0.5 font-bold">{results?.pctS2_P4 ? `${results.pctS2_P4}%` : ''}</td>
                        <td className={`border-r border-black ${hatchedBg}`}></td> {/* S2 EXAM MAX */}
                        <td className="border-r border-black p-0.5 font-bold">{results?.pctS2_Exam ? `${results.pctS2_Exam}%` : ''}</td>
                        <td className={`border-r border-black ${hatchedBg}`}></td> {/* S2 TOTAL MAX */}
                        <td className="border-r-2 border-black p-0.5 font-black">{results?.pctS2_Tot ? `${results.pctS2_Tot}%` : ''}</td>
                        
                        <td className={`border-r border-black ${hatchedBg}`}></td> {/* TOT GEN MAX */}
                        <td className="border-r border-black p-0.5 font-black">{results?.pourcentageGeneral ? `${results.pourcentageGeneral}%` : ''}</td>
                        
                        <td className="border-r-2 border-black" style={printBlackColStyle}></td>
                    </tr>

                    {/* 4. PLACE / NBRE D'ELEVES */}
                    <tr className="border-b border-black font-bold uppercase bg-transparent text-[9.5px]">
                        <td className="border-r-2 border-black p-1 text-left font-black pl-2">PLACE / NBRE D'ELEVES</td>
                        <td className={`border-r border-black ${hatchedBg}`}></td> {/* S1 MAX TJ */}
                        <td className="border-r border-black p-0.5">{results?.placeS1_P1 || ''} / {results?.nbEleves || ''}</td>
                        <td className="border-r border-black p-0.5">{results?.placeS1_P2 || ''} / {results?.nbEleves || ''}</td>
                        <td className={`border-r border-black ${hatchedBg}`}></td> {/* S1 EXAM MAX */}
                        <td className="border-r border-black p-0.5"></td>
                        <td className={`border-r border-black ${hatchedBg}`}></td> {/* S1 TOTAL MAX */}
                        <td className="border-r-2 border-black p-0.5 font-bold">{results?.placeS1_Tot || ''} / {results?.nbEleves || ''}</td>
                        
                        <td className={`border-r border-black ${hatchedBg}`}></td> {/* S2 MAX TJ */}
                        <td className="border-r border-black p-0.5">{results?.placeS2_P3 || ''} / {results?.nbEleves || ''}</td>
                        <td className="border-r border-black p-0.5">{results?.placeS2_P4 || ''} / {results?.nbEleves || ''}</td>
                        <td className={`border-r border-black ${hatchedBg}`}></td> {/* S2 EXAM MAX */}
                        <td className="border-r border-black p-0.5"></td>
                        <td className={`border-r border-black ${hatchedBg}`}></td> {/* S2 TOTAL MAX */}
                        <td className="border-r-2 border-black p-0.5 font-bold">{results?.placeS2_Tot || ''} / {results?.nbEleves || ''}</td>
                        
                        <td className={`border-r border-black ${hatchedBg}`}></td> {/* TOT GEN MAX */}
                        <td className="border-r border-black p-0.5 font-black">{results?.placeGeneral || ''} / {results?.nbEleves || ''}</td>
                        
                        <td className="border-r-2 border-black" style={printBlackColStyle}></td>
                    </tr>

                    {/* 5. APPLICATION */}
                    <tr className="border-b border-black font-bold uppercase bg-transparent text-[9.5px]">
                        <td className="border-r-2 border-black p-1 text-left font-black pl-2">APPLICATION</td>
                        <td className={`border-r border-black ${hatchedBg}`}></td> {/* S1 MAX TJ */}
                        <td className="border-r border-black p-0.5">{results?.appP1 || ''}</td>
                        <td className="border-r border-black p-0.5">{results?.appP2 || ''}</td>
                        <td className={`border-r border-black ${hatchedBg}`}></td> {/* S1 EXAM MAX */}
                        <td className="border-r border-black p-0.5"></td>
                        <td className={`border-r border-black ${hatchedBg}`}></td> {/* S1 TOTAL MAX */}
                        <td className="border-r-2 border-black p-0.5"></td>
                        
                        <td className={`border-r border-black ${hatchedBg}`}></td> {/* S2 MAX TJ */}
                        <td className="border-r border-black p-0.5">{results?.appP3 || ''}</td>
                        <td className="border-r border-black p-0.5">{results?.appP4 || ''}</td>
                        <td className={`border-r border-black ${hatchedBg}`}></td> {/* S2 EXAM MAX */}
                        <td className="border-r border-black p-0.5"></td>
                        <td className={`border-r border-black ${hatchedBg}`}></td> {/* S2 TOTAL MAX */}
                        <td className="border-r-2 border-black p-0.5"></td>
                        
                        <td className={`border-r border-black ${hatchedBg}`}></td> {/* TOT GEN MAX */}
                        <td className="border-r border-black p-0.5"></td>
                        
                        <td className="border-r-2 border-black" style={printBlackColStyle}></td>
                    </tr>

                    {/* 6. CONDUITE */}
                    <tr className="border-b border-black font-bold uppercase bg-transparent text-[9.5px]">
                        <td className="border-r-2 border-black p-1 text-left font-black pl-2">CONDUITE</td>
                        <td className={`border-r border-black ${hatchedBg}`}></td> {/* S1 MAX TJ */}
                        <td className="border-r border-black p-0.5">{results?.condP1 || ''}</td>
                        <td className="border-r border-black p-0.5">{results?.condP2 || ''}</td>
                        <td className={`border-r border-black ${hatchedBg}`}></td> {/* S1 EXAM MAX */}
                        <td className="border-r border-black p-0.5"></td>
                        <td className={`border-r border-black ${hatchedBg}`}></td> {/* S1 TOTAL MAX */}
                        <td className="border-r-2 border-black p-0.5"></td>
                        
                        <td className={`border-r border-black ${hatchedBg}`}></td> {/* S2 MAX TJ */}
                        <td className="border-r border-black p-0.5">{results?.condP3 || ''}</td>
                        <td className="border-r border-black p-0.5">{results?.condP4 || ''}</td>
                        <td className={`border-r border-black ${hatchedBg}`}></td> {/* S2 EXAM MAX */}
                        <td className="border-r border-black p-0.5"></td>
                        <td className={`border-r border-black ${hatchedBg}`}></td> {/* S2 TOTAL MAX */}
                        <td className="border-r-2 border-black p-0.5"></td>
                        
                        <td className={`border-r border-black ${hatchedBg}`}></td> {/* TOT GEN MAX */}
                        <td className="border-r border-black p-0.5"></td>
                        
                        <td className="border-r-2 border-black" style={printBlackColStyle}></td>
                    </tr>

                    {/* 7. SIGNATURE - NETTOYÉ */}
                    <tr className="border-b-2 border-black font-bold uppercase bg-transparent text-[9.5px] h-7">
                        <td className="border-r-2 border-black p-1 text-left font-black pl-2">SIGNATURE</td>
                        <td className="border-r border-black p-0.5"></td> {/* S1 MAX TJ */}
                        <td className="border-r border-black p-0.5"></td>
                        <td className="border-r border-black p-0.5"></td>
                        <td className="border-r border-black p-0.5"></td> {/* S1 EXAM MAX */}
                        <td className="border-r border-black p-0.5"></td>
                        <td className="border-r border-black p-0.5"></td> {/* S1 TOTAL MAX */}
                        <td className="border-r-2 border-black p-0.5"></td>
                        
                        <td className="border-r border-black p-0.5"></td> {/* S2 MAX TJ */}
                        <td className="border-r border-black p-0.5"></td>
                        <td className="border-r border-black p-0.5"></td>
                        <td className="border-r border-black p-0.5"></td> {/* S2 EXAM MAX */}
                        <td className="border-r border-black p-0.5"></td>
                        <td className="border-r border-black p-0.5"></td> {/* S2 TOTAL MAX */}
                        <td className="border-r-2 border-black p-0.5"></td>
                        
                        <td className="border-r border-black p-0.5"></td> {/* TOT GEN MAX */}
                        <td className="border-r border-black p-0.5"></td>
                        
                        <td className="border-r-2 border-black" style={printBlackColStyle}></td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
};

export default BulletinBody;