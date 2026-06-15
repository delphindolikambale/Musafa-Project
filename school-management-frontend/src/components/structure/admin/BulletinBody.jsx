import React from 'react';
import { getImageUrl } from '../../../services/api';

const BulletinBody = ({ bulletinData, header }) => {
    if (!bulletinData) return <div className="text-center p-4 font-serif">Chargement de la grille...</div>;

    const { formatType, domains, results } = bulletinData;
    
    // Détermination stricte du format d'affichage
    const isEB = formatType === '7EME_EB' || formatType === '8EME_EB';
    const is8eme = formatType === '8EME_EB';
    const isHumanites = formatType === 'HUMANITES';

    // Classe CSS pour l'effet hachuré officiel des cellules non applicables
    const hatchedBg = "bg-[repeating-linear-gradient(-45deg,#a3a3a3,#a3a3a3_1px,transparent_1px,transparent_4px)] print:opacity-70";
    
    // Style pour forcer l'impression du fond noir de la colonne de séparation
    const printBlackColStyle = { backgroundColor: 'black', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' };

    // Extraction à plat de tous les cours pour le format Humanités
    const allHumanitesSubjects = isHumanites ? (domains?.flatMap(d => d.subjects || []) || []) : [];

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
                {/* EN-TÊTE : FORMAT ÉDUCATION DE BASE (7e & 8e)       */}
                {/* ================================================= */}
                {isEB && (
                    <thead>
                        <tr className="border-b-2 border-black text-[10px] font-bold uppercase bg-transparent">
                            <th rowSpan={3} className="border-r-2 border-black p-1 text-center align-middle w-[28%] font-black">
                                BRANCHES
                            </th>
                            <th colSpan={5} className="border-r-2 border-black p-0.5 text-[10px] align-middle font-bold">
                                PREMIER SEMESTRE
                            </th>
                            <th colSpan={5} className="border-r-2 border-black p-0.5 text-[10px] align-middle font-bold">
                                SECOND SEMESTRE
                            </th>
                            <th rowSpan={3} className="border-r border-black p-0.5 text-[9px] align-middle font-black w-12 bg-transparent">
                                TOTAL<br/>GENERAL
                            </th>
                            {/* NOUVELLE COLONNE DE SÉPARATION NOIRE */}
                            <th rowSpan={3} className="border-r-2 border-black w-2.5" style={printBlackColStyle}></th>
                            <th colSpan={2} className="p-0.5 text-[9px] align-middle w-18 leading-tight font-black">
                                EXAMEN DE<br/>REPECHAGE
                            </th>
                        </tr>
                        <tr className="border-b border-black text-[8px] font-bold bg-transparent">
                            <th rowSpan={2} className="border-r border-black p-0.5 w-7 align-middle">MAX.</th>
                            <th colSpan={2} className="border-r border-black p-0.5 align-middle leading-tight">TRAVAUX<br/>JOURNAL.</th>
                            <th rowSpan={2} className="border-r border-black p-0.5 w-8 align-middle">MAX.<br/>EXAM.</th>
                            <th rowSpan={2} className="border-r-2 border-black p-0.5 w-8 align-middle">TOTAL</th>
                            
                            <th rowSpan={2} className="border-r border-black p-0.5 w-7 align-middle">MAX.</th>
                            <th colSpan={2} className="border-r border-black p-0.5 align-middle leading-tight">TRAVAUX<br/>JOURNAL.</th>
                            <th rowSpan={2} className="border-r border-black p-0.5 w-8 align-middle">MAX.<br/>EXAM.</th>
                            <th rowSpan={2} className="border-r-2 border-black p-0.5 w-8 align-middle">TOTAL</th>
                            
                            <th rowSpan={2} className="border-r border-black p-0.5 w-7 align-middle">%</th>
                            <th rowSpan={2} className="p-0.5 w-11 align-middle leading-tight">Sign.<br/>Prof.</th>
                        </tr>
                        <tr className="border-b-2 border-black text-[8px] font-bold bg-transparent">
                            <th className="border-r border-black p-0.5 w-6">1ère P</th>
                            <th className="border-r border-black p-0.5 w-6">2ème P</th>
                            <th className="border-r border-black p-0.5 w-6">3ème P</th>
                            <th className="border-r border-black p-0.5 w-6">4ème P</th>
                        </tr>
                    </thead>
                )}

                {/* ================================================= */}
                {/* EN-TÊTE : FORMAT HUMANITES (MAXIMA A LA LIGNE)    */}
                {/* ================================================= */}
                {isHumanites && (
                    <thead>
                        <tr className="border-b-2 border-black text-[10px] font-bold uppercase bg-transparent">
                            <th rowSpan={3} className="border-r-2 border-black p-1 text-center align-middle w-[32%] font-black">
                                BRANCHES
                            </th>
                            <th colSpan={4} className="border-r-2 border-black p-0.5 text-[10px] align-middle font-bold">
                                PREMIER SEMESTRE
                            </th>
                            <th colSpan={4} className="border-r-2 border-black p-0.5 text-[10px] align-middle font-bold">
                                SECOND SEMESTRE
                            </th>
                            <th rowSpan={3} className="border-r border-black p-0.5 text-[9px] align-middle font-black w-12 bg-transparent">
                                TOTAL<br/>GENERAL
                            </th>
                            {/* NOUVELLE COLONNE DE SÉPARATION NOIRE */}
                            <th rowSpan={3} className="border-r-2 border-black w-2.5" style={printBlackColStyle}></th>
                            <th colSpan={2} className="p-0.5 text-[9px] align-middle w-18 leading-tight font-black">
                                EXAMEN DE<br/>REPECHAGE
                            </th>
                        </tr>
                        <tr className="border-b border-black text-[8px] font-bold bg-transparent">
                            <th colSpan={2} className="border-r border-black p-0.5 align-middle leading-tight">TRAVAUX<br/>JOURNALIERS</th>
                            <th rowSpan={2} className="border-r border-black p-0.5 w-9 align-middle uppercase">Examen</th>
                            <th rowSpan={2} className="border-r-2 border-black p-0.5 w-9 align-middle uppercase">Total</th>
                            
                            <th colSpan={2} className="border-r border-black p-0.5 align-middle leading-tight">TRAVAUX<br/>JOURNALIERS</th>
                            <th rowSpan={2} className="border-r border-black p-0.5 w-9 align-middle uppercase">Examen</th>
                            <th rowSpan={2} className="border-r-2 border-black p-0.5 w-9 align-middle uppercase">Total</th>
                            
                            <th rowSpan={2} className="border-r border-black p-0.5 w-7 align-middle">%</th>
                            <th rowSpan={2} className="p-0.5 w-11 align-middle leading-tight">Sign.<br/>Prof.</th>
                        </tr>
                        <tr className="border-b-2 border-black text-[8px] font-bold bg-transparent">
                            <th className="border-r border-black p-0.5 w-7">1ère P</th>
                            <th className="border-r border-black p-0.5 w-7">2ème P</th>
                            <th className="border-r border-black p-0.5 w-7">3ème P</th>
                            <th className="border-r border-black p-0.5 w-7">4ème P</th>
                        </tr>
                    </thead>
                )}

                {/* ================================================= */}
                {/* CORPS DU TABLEAU                                  */}
                {/* ================================================= */}
                <tbody className="bg-transparent">
                    
                    {/* RENDER INTERNÉ : ÉDUCATION DE BASE */}
                    {isEB && domains?.map((domain, dIdx) => (
                        <React.Fragment key={`eb-dom-${dIdx}`}>
                            <tr className="border-b border-black font-black text-left text-[9px] bg-gray-100/50 print:bg-gray-100/50">
                                {/* Augmentation du colSpan à 15 (au lieu de 14) */}
                                <td colSpan={15} className="p-1 pl-2 uppercase tracking-wider">
                                    {domain.name}
                                </td>
                            </tr>
                            {domain.subjects?.map((sub, sIdx) => (
                                <tr key={`eb-sub-${sIdx}`} className="border-b border-black text-[10px] bg-transparent">
                                    <td className="border-r-2 border-black p-1 text-left pl-3 font-normal leading-tight bg-transparent">{sub.subjectName}</td>
                                    
                                    {/* S1 */}
                                    <td className="border-r border-black p-0.5 font-bold bg-transparent">{sub.maxPeriod || '10'}</td>
                                    <td className="border-r border-black p-0.5 bg-transparent">{sub.p1 ?? ''}</td>
                                    <td className="border-r border-black p-0.5 bg-transparent">{sub.p2 ?? ''}</td>
                                    <td className="border-r border-black p-0.5 font-bold bg-transparent">{sub.maxExam || '20'}</td>
                                    <td className="border-r-2 border-black p-0.5 font-bold bg-transparent">{sub.totalS1 ?? ''}</td>
                                    
                                    {/* S2 */}
                                    <td className="border-r border-black p-0.5 font-bold bg-transparent">{sub.maxPeriod || '10'}</td>
                                    <td className="border-r border-black p-0.5 bg-transparent">{sub.p3 ?? ''}</td>
                                    <td className="border-r border-black p-0.5 bg-transparent">{sub.p4 ?? ''}</td>
                                    <td className="border-r border-black p-0.5 font-bold bg-transparent">{sub.maxExam || '20'}</td>
                                    <td className="border-r-2 border-black p-0.5 font-bold bg-transparent">{sub.totalS2 ?? ''}</td>
                                    
                                    <td className="border-r border-black p-0.5 font-black bg-transparent">{sub.totalAnnuel ?? ''}</td>
                                    
                                    {/* CELLULE NOIRE LIGNE DE COURS */}
                                    <td className="border-r-2 border-black" style={printBlackColStyle}></td>
                                    
                                    <td className="border-r border-black p-0.5 font-bold bg-transparent">{sub.repechagePct ?? ''}</td>
                                    <td className="p-0.5 bg-transparent"></td>
                                </tr>
                            ))}
                            {/* Sous-Total du Domaine */}
                            <tr className="border-b-2 border-black font-bold text-[9.5px] bg-gray-50/50">
                                <td className="border-r-2 border-black text-left pl-2 italic">Sous-Total</td>
                                <td className="border-r border-black p-0.5 font-bold">{domain.subMaxPeriod || ''}</td>
                                <td className="border-r border-black p-0.5">{domain.subP1 ?? ''}</td>
                                <td className="border-r border-black p-0.5">{domain.subP2 ?? ''}</td>
                                <td className="border-r border-black p-0.5 font-bold">{domain.subMaxExam ?? ''}</td>
                                <td className="border-r-2 border-black p-0.5 font-bold">{domain.subTotalS1 ?? ''}</td>
                                
                                <td className="border-r border-black p-0.5 font-bold">{domain.subMaxPeriod || ''}</td>
                                <td className="border-r border-black p-0.5">{domain.subP3 ?? ''}</td>
                                <td className="border-r border-black p-0.5">{domain.subP4 ?? ''}</td>
                                <td className="border-r border-black p-0.5 font-bold">{domain.subMaxExam ?? ''}</td>
                                <td className="border-r-2 border-black p-0.5 font-bold">{domain.subTotalS2 ?? ''}</td>
                                
                                <td className="border-r border-black p-0.5 font-black">{domain.subTotalAnnuel ?? ''}</td>
                                
                                {/* CELLULE NOIRE SOUS-TOTAL */}
                                <td className="border-r-2 border-black" style={printBlackColStyle}></td>
                                
                                <td className={`border-r border-black p-0.5 ${hatchedBg}`}></td>
                                <td className={hatchedBg}></td>
                            </tr>
                        </React.Fragment>
                    ))}

                    {/* RENDER INTERNÉ : HUMANITES */}
                    {isHumanites && (
                        <>
                            {/* LIGNE DES MAXIMA */}
                            <tr className="border-b-2 border-black font-black text-[10px] bg-gray-100/50 print:bg-gray-100/50">
                                <td className="border-r-2 border-black p-1 text-left pl-2 tracking-wider font-black">MAXIMA</td>
                                <td className="border-r border-black p-0.5 font-bold">{results?.maxPeriod || '10'}</td>
                                <td className="border-r border-black p-0.5 font-bold">{results?.maxPeriod || '10'}</td>
                                <td className="border-r border-black p-0.5 font-bold">{results?.maxExam || '20'}</td>
                                <td className="border-r-2 border-black p-0.5 font-bold">{results?.maxS1_Tot || '40'}</td>
                                
                                <td className="border-r border-black p-0.5 font-bold">{results?.maxPeriod || '10'}</td>
                                <td className="border-r border-black p-0.5 font-bold">{results?.maxPeriod || '10'}</td>
                                <td className="border-r border-black p-0.5 font-bold">{results?.maxExam || '20'}</td>
                                <td className="border-r-2 border-black p-0.5 font-bold">{results?.maxS2_Tot || '40'}</td>
                                
                                <td className="border-r border-black p-0.5 font-black">{results?.totalGeneralMax || '80'}</td>
                                
                                {/* CELLULE NOIRE LIGNE MAXIMA */}
                                <td className="border-r-2 border-black" style={printBlackColStyle}></td>
                                
                                <td className={`border-r border-black p-0.5 ${hatchedBg}`}></td>
                                <td className={hatchedBg}></td>
                            </tr>

                            {/* COURS */}
                            {allHumanitesSubjects.map((sub, sIdx) => (
                                <tr key={`hum-sub-${sIdx}`} className="border-b border-black text-[10px] bg-transparent">
                                    <td className="border-r-2 border-black p-1 text-left pl-3 font-normal leading-tight bg-transparent">{sub.subjectName}</td>
                                    
                                    <td className="border-r border-black p-0.5 bg-transparent">{sub.p1 ?? ''}</td>
                                    <td className="border-r border-black p-0.5 bg-transparent">{sub.p2 ?? ''}</td>
                                    <td className="border-r border-black p-0.5 bg-transparent">{sub.maxExam ? (sub.examS1 ?? '') : ''}</td>
                                    <td className="border-r-2 border-black p-0.5 font-bold bg-transparent">{sub.totalS1 ?? ''}</td>
                                    
                                    <td className="border-r border-black p-0.5 bg-transparent">{sub.p3 ?? ''}</td>
                                    <td className="border-r border-black p-0.5 bg-transparent">{sub.p4 ?? ''}</td>
                                    <td className="border-r border-black p-0.5 bg-transparent">{sub.maxExam ? (sub.examS2 ?? '') : ''}</td>
                                    <td className="border-r-2 border-black p-0.5 font-bold bg-transparent">{sub.totalS2 ?? ''}</td>
                                    
                                    <td className="border-r border-black p-0.5 font-black bg-transparent">{sub.totalAnnuel ?? ''}</td>
                                    
                                    {/* CELLULE NOIRE LIGNE DE COURS */}
                                    <td className="border-r-2 border-black" style={printBlackColStyle}></td>
                                    
                                    <td className="border-r border-black p-0.5 font-bold bg-transparent">{sub.repechagePct ?? ''}</td>
                                    <td className="p-0.5 bg-transparent"></td>
                                </tr>
                            ))}
                        </>
                    )}

                    {/* ================================================= */}
                    {/* LIGNES DE SYNTHÈSE DE FIN DE GRILLE               */}
                    {/* ================================================= */}
                    
                    {/* 1. MAXIMA GENERAUX */}
                    <tr className="border-b border-black font-black uppercase bg-transparent text-[9.5px]">
                        <td className="border-r-2 border-black p-1 text-left font-black pl-2">MAXIMA GENERAUX</td>
                        {isEB ? (
                            <>
                                <td className="border-r border-black p-0.5 font-bold">{results?.maxPeriod || ''}</td>
                                <td className="border-r border-black p-0.5"></td>
                                <td className="border-r border-black p-0.5"></td>
                                <td className="border-r border-black p-0.5 font-bold">{results?.maxExam || ''}</td>
                                <td className="border-r-2 border-black p-0.5 font-black">{results?.maxS1_Tot || ''}</td>
                                <td className="border-r border-black p-0.5 font-bold">{results?.maxPeriod || ''}</td>
                                <td className="border-r border-black p-0.5"></td>
                                <td className="border-r border-black p-0.5"></td>
                                <td className="border-r border-black p-0.5 font-bold">{results?.maxExam || ''}</td>
                                <td className="border-r-2 border-black p-0.5 font-black">{results?.maxS2_Tot || ''}</td>
                            </>
                        ) : (
                            <>
                                <td className="border-r border-black p-0.5"></td>
                                <td className="border-r border-black p-0.5"></td>
                                <td className="border-r border-black p-0.5"></td>
                                <td className="border-r-2 border-black p-0.5 font-black">{results?.maxS1_Tot || ''}</td>
                                <td className="border-r border-black p-0.5"></td>
                                <td className="border-r border-black p-0.5"></td>
                                <td className="border-r border-black p-0.5"></td>
                                <td className="border-r-2 border-black p-0.5 font-black">{results?.maxS2_Tot || ''}</td>
                            </>
                        )}
                        <td className="border-r border-black p-0.5 font-black">{results?.totalGeneralMax || ''}</td>
                        <td className="border-r-2 border-black" style={printBlackColStyle}></td>
                        <td className={`border-r border-black ${hatchedBg}`}></td>
                        <td className={hatchedBg}></td>
                    </tr>

                    {/* 2. TOTAUX OBTENUS */}
                    <tr className="border-b border-black font-bold uppercase bg-transparent text-[10px]">
                        <td className="border-r-2 border-black p-1 text-left font-black pl-2">TOTAUX</td>
                        {isEB && <td className={`border-r border-black ${hatchedBg}`}></td>}
                        <td className="border-r border-black p-0.5">{results?.obtS1_P1 ?? ''}</td>
                        <td className="border-r border-black p-0.5">{results?.obtS1_P2 ?? ''}</td>
                        {isEB && <td className={`border-r border-black ${hatchedBg}`}></td>}
                        <td className="border-r-2 border-black p-0.5 font-black">{results?.obtS1_Tot ?? ''}</td>
                        
                        {isEB && <td className={`border-r border-black ${hatchedBg}`}></td>}
                        <td className="border-r border-black p-0.5">{results?.obtS2_P3 ?? ''}</td>
                        <td className="border-r border-black p-0.5">{results?.obtS2_P4 ?? ''}</td>
                        {isEB && <td className={`border-r border-black ${hatchedBg}`}></td>}
                        <td className="border-r-2 border-black p-0.5 font-black">{results?.obtS2_Tot ?? ''}</td>
                        
                        <td className="border-r border-black p-0.5 font-black">{results?.totalGeneralObt ?? ''}</td>
                        <td className="border-r-2 border-black" style={printBlackColStyle}></td>
                        <td className={`border-r border-black ${hatchedBg}`}></td>
                        <td className={hatchedBg}></td>
                    </tr>

                    {/* 3. POURCENTAGE */}
                    <tr className="border-b border-black font-bold uppercase bg-transparent text-[9.5px]">
                        <td className="border-r-2 border-black p-1 text-left font-black pl-2">POURCENTAGE</td>
                        {isEB && <td className={`border-r border-black ${hatchedBg}`}></td>}
                        <td className="border-r border-black p-0.5 font-bold">{results?.pctS1_P1 ? `${results.pctS1_P1}%` : ''}</td>
                        <td className="border-r border-black p-0.5 font-bold">{results?.pctS1_P2 ? `${results.pctS1_P2}%` : ''}</td>
                        {isEB && <td className={`border-r border-black ${hatchedBg}`}></td>}
                        <td className="border-r-2 border-black p-0.5 font-black">{results?.pctS1_Tot ? `${results.pctS1_Tot}%` : ''}</td>
                        
                        {isEB && <td className={`border-r border-black ${hatchedBg}`}></td>}
                        <td className="border-r border-black p-0.5 font-bold">{results?.pctS2_P3 ? `${results.pctS2_P3}%` : ''}</td>
                        <td className="border-r border-black p-0.5 font-bold">{results?.pctS2_P4 ? `${results.pctS2_P4}%` : ''}</td>
                        {isEB && <td className={`border-r border-black ${hatchedBg}`}></td>}
                        <td className="border-r-2 border-black p-0.5 font-black">{results?.pctS2_Tot ? `${results.pctS2_Tot}%` : ''}</td>
                        
                        <td className="border-r border-black p-0.5 font-black">{results?.pourcentageGeneral ? `${results.pourcentageGeneral}%` : ''}</td>
                        <td className="border-r-2 border-black" style={printBlackColStyle}></td>
                        <td className={`border-r border-black ${hatchedBg}`}></td>
                        <td className={hatchedBg}></td>
                    </tr>

                    {/* 4. PLACE / NBRE D'ELEVES */}
                    <tr className="border-b border-black font-bold uppercase bg-transparent text-[9.5px]">
                        <td className="border-r-2 border-black p-1 text-left font-black pl-2">PLACE / NBRE D'ELEVES</td>
                        {isEB && <td className={`border-r border-black ${hatchedBg}`}></td>}
                        <td className="border-r border-black p-0.5">{results?.placeS1_P1 || ''} / {results?.nbEleves || ''}</td>
                        <td className="border-r border-black p-0.5">{results?.placeS1_P2 || ''} / {results?.nbEleves || ''}</td>
                        {isEB && <td className={`border-r border-black ${hatchedBg}`}></td>}
                        <td className="border-r-2 border-black p-0.5 font-bold">{results?.placeS1_Tot || ''} / {results?.nbEleves || ''}</td>
                        
                        {isEB && <td className={`border-r border-black ${hatchedBg}`}></td>}
                        <td className="border-r border-black p-0.5">{results?.placeS2_P3 || ''} / {results?.nbEleves || ''}</td>
                        <td className="border-r border-black p-0.5">{results?.placeS2_P4 || ''} / {results?.nbEleves || ''}</td>
                        {isEB && <td className={`border-r border-black ${hatchedBg}`}></td>}
                        <td className="border-r-2 border-black p-0.5 font-bold">{results?.placeS2_Tot || ''} / {results?.nbEleves || ''}</td>
                        
                        <td className="border-r border-black p-0.5 font-black">{results?.placeGeneral || ''} / {results?.nbEleves || ''}</td>
                        <td className="border-r-2 border-black" style={printBlackColStyle}></td>
                        <td className={`border-r border-black ${hatchedBg}`}></td>
                        <td className={hatchedBg}></td>
                    </tr>

                    {/* 5. APPLICATION */}
                    <tr className="border-b border-black font-bold uppercase bg-transparent text-[9.5px]">
                        <td className="border-r-2 border-black p-1 text-left font-black pl-2">APPLICATION</td>
                        {isEB && <td className={`border-r border-black ${hatchedBg}`}></td>}
                        <td className="border-r border-black p-0.5">{results?.appP1 || ''}</td>
                        <td className="border-r border-black p-0.5">{results?.appP2 || ''}</td>
                        {isEB && <td className={`border-r border-black ${hatchedBg}`}></td>}
                        <td className={`border-r-2 border-black ${hatchedBg}`}></td>
                        
                        {isEB && <td className={`border-r border-black ${hatchedBg}`}></td>}
                        <td className="border-r border-black p-0.5">{results?.appP3 || ''}</td>
                        <td className="border-r border-black p-0.5">{results?.appP4 || ''}</td>
                        {isEB && <td className={`border-r border-black ${hatchedBg}`}></td>}
                        <td className={`border-r-2 border-black ${hatchedBg}`}></td>
                        
                        <td className={`border-r border-black ${hatchedBg}`}></td>
                        <td className="border-r-2 border-black" style={printBlackColStyle}></td>
                        <td className={`border-r border-black ${hatchedBg}`}></td>
                        <td className={hatchedBg}></td>
                    </tr>

                    {/* 6. CONDUITE */}
                    <tr className="border-b border-black font-bold uppercase bg-transparent text-[9.5px]">
                        <td className="border-r-2 border-black p-1 text-left font-black pl-2">CONDUITE</td>
                        {isEB && <td className={`border-r border-black ${hatchedBg}`}></td>}
                        <td className="border-r border-black p-0.5">{results?.condP1 || ''}</td>
                        <td className="border-r border-black p-0.5">{results?.condP2 || ''}</td>
                        {isEB && <td className={`border-r border-black ${hatchedBg}`}></td>}
                        <td className={`border-r-2 border-black ${hatchedBg}`}></td>
                        
                        {isEB && <td className={`border-r border-black ${hatchedBg}`}></td>}
                        <td className="border-r border-black p-0.5">{results?.condP3 || ''}</td>
                        <td className="border-r border-black p-0.5">{results?.condP4 || ''}</td>
                        {isEB && <td className={`border-r border-black ${hatchedBg}`}></td>}
                        <td className={`border-r-2 border-black ${hatchedBg}`}></td>
                        
                        <td className={`border-r border-black ${hatchedBg}`}></td>
                        <td className="border-r-2 border-black" style={printBlackColStyle}></td>
                        <td className={`border-r border-black ${hatchedBg}`}></td>
                        <td className={hatchedBg}></td>
                    </tr>

                    {/* 7. SIGNATURE (Ligne finale) */}
                    <tr className="border-b-2 border-black font-bold uppercase bg-transparent text-[9.5px] h-7">
                        <td className="border-r-2 border-black p-1 text-left font-black pl-2">SIGNATURE</td>
                        {isEB && <td className={`border-r border-black ${hatchedBg}`}></td>}
                        <td className="border-r border-black p-0.5"></td>
                        <td className="border-r border-black p-0.5"></td>
                        {isEB && <td className={`border-r border-black ${hatchedBg}`}></td>}
                        <td className={`border-r-2 border-black ${hatchedBg}`}></td>
                        
                        {isEB && <td className={`border-r border-black ${hatchedBg}`}></td>}
                        <td className="border-r border-black p-0.5"></td>
                        <td className="border-r border-black p-0.5"></td>
                        {isEB && <td className={`border-r border-black ${hatchedBg}`}></td>}
                        <td className={`border-r-2 border-black ${hatchedBg}`}></td>
                        
                        <td className={`border-r border-black ${hatchedBg}`}></td>
                        <td className="border-r-2 border-black" style={printBlackColStyle}></td>
                        <td className={`border-r border-black ${hatchedBg}`}></td>
                        <td className={hatchedBg}></td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
};

export default BulletinBody;