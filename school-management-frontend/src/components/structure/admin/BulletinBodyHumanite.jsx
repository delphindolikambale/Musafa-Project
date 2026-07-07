import React from 'react';

const BulletinBodyHumanite = ({ bulletinData, header }) => {
    if (!bulletinData) return <div className="text-center p-4 font-serif">Chargement de la grille...</div>;

    const { domains, standaloneSubjects } = bulletinData;
    
    // Motif hachuré officiel pour les cases inactives (barcodes selon l'image 1)
    const hatchedBg = "bg-[repeating-linear-gradient(-45deg,#a3a3a3,#a3a3a3_1px,transparent_1px,transparent_4px)] print:opacity-70";
    const printBlackColStyle = { backgroundColor: 'black', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' };

    // Extraction des cours : On privilégie la liste plate (Humanités) fournie par le backend
    // S'il n'y en a pas, on fait un fallback sur les domaines (mock de base)
    const allHumanitesSubjects = standaloneSubjects && standaloneSubjects.length > 0 
        ? standaloneSubjects 
        : (domains?.flatMap(d => d.subjects || []) || []);

    return (
        <div className="relative w-full text-black font-serif text-[10px] leading-tight print:text-black">
            <table className="w-full table-fixed border-collapse border-[2px] border-black text-center">
                <thead>
                    {/* LIGNE 1 : En-têtes principaux */}
                    <tr>
                        <th className="border-r-[2px] border-b-[2px] border-black p-1 w-[26%] align-middle font-bold uppercase" rowSpan={3}>
                            BRANCHES
                        </th>
                        <th className="border-r-[2px] border-b-[2px] border-black p-1 font-bold uppercase" colSpan={4}>PREMIER SEMESTRE</th>
                        <th className="border-r-[2px] border-b-[2px] border-black p-1 font-bold uppercase" colSpan={4}>SECOND SEMESTRE</th>
                        <th className="border-r-[2px] border-b-[2px] border-black p-1 font-bold uppercase w-[5%]" rowSpan={3}>T.G.</th>
                        <th className="border-r-[2px] border-b-[2px] border-black w-[2%]" rowSpan={3} style={printBlackColStyle}></th>
                        <th className="border-b-[2px] border-black p-1 w-[12%] font-bold uppercase leading-none" colSpan={2} rowSpan={2}>
                            EXAMEN DE<br />REPECHAGE
                        </th>
                    </tr>
                    {/* LIGNE 2 : Sous-en-têtes (Travaux, Exam, Tot) */}
                    <tr>
                        <th className="border-r border-b-[2px] border-black p-1 font-normal w-[6.5%]" colSpan={2}>TRAVAUX<br/>JOURNAL.</th>
                        <th className="border-r border-b-[2px] border-black p-1 font-normal w-[5.5%]" rowSpan={2}>EXAM.</th>
                        <th className="border-r-[2px] border-b-[2px] border-black p-1 font-normal w-[6.5%]" rowSpan={2}>TOT.</th>
                        
                        <th className="border-r border-b-[2px] border-black p-1 font-normal w-[6.5%]" colSpan={2}>TRAVAUX<br/>JOURNAL.</th>
                        <th className="border-r border-b-[2px] border-black p-1 font-normal w-[5.5%]" rowSpan={2}>EXAM.</th>
                        <th className="border-r-[2px] border-b-[2px] border-black p-1 font-normal w-[6.5%]" rowSpan={2}>TOT.</th>
                    </tr>
                    {/* LIGNE 3 : Périodes et Repechage */}
                    <tr>
                        <th className="border-r border-b-[2px] border-black p-1 font-normal w-[3.25%]">1<sup>ère</sup> P.</th>
                        <th className="border-r border-b-[2px] border-black p-1 font-normal w-[3.25%]">2<sup>e</sup> P.</th>
                        
                        <th className="border-r border-b-[2px] border-black p-1 font-normal w-[3.25%]">3<sup>e</sup> P.</th>
                        <th className="border-r border-b-[2px] border-black p-1 font-normal w-[3.25%]">4<sup>e</sup> P.</th>
                        
                        <th className="border-r border-b-[2px] border-black p-1 font-normal w-[4%]">%</th>
                        <th className="border-b-[2px] border-black p-1 font-normal w-[8%]">Sign. Prof.</th>
                    </tr>
                    {/* LIGNE 4 : MAXIMA STATIQUES */}
                    <tr className="font-bold border-b-[2px] border-black bg-white">
                        <td className="border-r-[2px] border-black p-1 text-left pl-2 uppercase">MAXIMA</td>
                        <td className="border-r border-black p-1">10</td>
                        <td className="border-r border-black p-1">10</td>
                        <td className="border-r border-black p-1">20</td>
                        <td className="border-r-[2px] border-black p-1">40</td>
                        <td className="border-r border-black p-1">10</td>
                        <td className="border-r border-black p-1">10</td>
                        <td className="border-r border-black p-1">20</td>
                        <td className="border-r-[2px] border-black p-1">40</td>
                        <td className="border-r-[2px] border-black p-1">80</td>
                        <td className="border-r-[2px] border-black" style={printBlackColStyle}></td>
                        {/* Bordures remplies noires pour le MAXIMA sous Repechage */}
                        <td className="border-r-[4px] border-black" style={printBlackColStyle}></td>
                        <td style={printBlackColStyle}></td>
                    </tr>
                </thead>
                <tbody>
                    {/* LISTE DES COURS */}
                    {allHumanitesSubjects.length > 0 ? (
                        allHumanitesSubjects.map((subject, idx) => (
                            <tr key={idx} className="border-b border-black">
                                <td className="border-r-[2px] border-black p-1 text-left pl-2 font-normal">
                                    {/* 🔴 CORRECTION DU NOM : Prise en charge du format Backend (subjectName) */}
                                    {subject.subjectName || subject.name || "\u00A0"}
                                </td>
                                {/* 🔴 CORRECTION DES CLES : Utilisation des noms de variables du Backend */}
                                <td className="border-r border-black p-1">{subject.maxP1 ?? "\u00A0"}</td>
                                <td className="border-r border-black p-1">{subject.maxP2 ?? "\u00A0"}</td>
                                <td className="border-r border-black p-1">{subject.maxExam1 ?? "\u00A0"}</td>
                                <td className="border-r-[2px] border-black p-1 font-bold">{subject.maxTotalS1 ?? "\u00A0"}</td>
                                <td className="border-r border-black p-1">{subject.maxP3 ?? "\u00A0"}</td>
                                <td className="border-r border-black p-1">{subject.maxP4 ?? "\u00A0"}</td>
                                <td className="border-r border-black p-1">{subject.maxExam2 ?? "\u00A0"}</td>
                                <td className="border-r-[2px] border-black p-1 font-bold">{subject.maxTotalS2 ?? "\u00A0"}</td>
                                <td className="border-r-[2px] border-black p-1 font-bold">{subject.maxTotalGen ?? "\u00A0"}</td>
                                <td className="border-r-[2px] border-black" style={printBlackColStyle}></td>
                                <td className="border-r border-black p-1"></td>
                                <td className="p-1"></td>
                            </tr>
                        ))
                    ) : (
                        <tr className="border-b border-black h-5">
                            <td className="border-r-[2px] border-black p-1 text-left pl-2">&nbsp;</td>
                            <td className="border-r border-black p-1"></td>
                            <td className="border-r border-black p-1"></td>
                            <td className="border-r border-black p-1"></td>
                            <td className="border-r-[2px] border-black p-1"></td>
                            <td className="border-r border-black p-1"></td>
                            <td className="border-r border-black p-1"></td>
                            <td className="border-r border-black p-1"></td>
                            <td className="border-r-[2px] border-black p-1"></td>
                            <td className="border-r-[2px] border-black p-1"></td>
                            <td className="border-r-[2px] border-black" style={printBlackColStyle}></td>
                            <td className="border-r border-black p-1"></td>
                            <td className="p-1"></td>
                        </tr>
                    )}

                    {/* LIGNES STATISTIQUES ET SIGNATURES OFFICIELLES */}
                    
                    {/* MAXIMA GENERAUX */}
                    <tr className="border-t-[2px] border-b border-black font-bold h-6">
                        <td className="border-r-[2px] border-black p-1 text-left pl-2 uppercase">MAXIMA GENERAUX</td>
                        {/* 🔴 CORRECTION DES CLES : Intégration des totaux globaux */}
                        <td className="border-r border-black p-1">{bulletinData?.totalMaxP1 ?? "\u00A0"}</td>
                        <td className="border-r border-black p-1">{bulletinData?.totalMaxP2 ?? "\u00A0"}</td>
                        <td className="border-r border-black p-1">{bulletinData?.totalMaxExam1 ?? "\u00A0"}</td>
                        <td className="border-r-[2px] border-black p-1">{bulletinData?.totalMaxS1 ?? "\u00A0"}</td>
                        <td className="border-r border-black p-1">{bulletinData?.totalMaxP3 ?? "\u00A0"}</td>
                        <td className="border-r border-black p-1">{bulletinData?.totalMaxP4 ?? "\u00A0"}</td>
                        <td className="border-r border-black p-1">{bulletinData?.totalMaxExam2 ?? "\u00A0"}</td>
                        <td className="border-r-[2px] border-black p-1">{bulletinData?.totalMaxS2 ?? "\u00A0"}</td>
                        <td className="border-r-[2px] border-black p-1">{bulletinData?.totalGeneralMax ?? "\u00A0"}</td>
                        <td className="border-r-[2px] border-black" style={printBlackColStyle}></td>
                        <td className="border-r-[4px] border-black" style={printBlackColStyle}></td>
                        <td style={printBlackColStyle}></td>
                    </tr>
                    
                    {/* TOTAUX */}
                    <tr className="border-b-[2px] border-black font-bold h-6">
                        <td className="border-r-[2px] border-black p-1 text-left pl-2 uppercase">TOTAUX</td>
                        <td className="border-r border-black p-1"></td>
                        <td className="border-r border-black p-1"></td>
                        <td className="border-r border-black p-1"></td>
                        <td className="border-r-[2px] border-black p-1"></td>
                        <td className="border-r border-black p-1"></td>
                        <td className="border-r border-black p-1"></td>
                        <td className="border-r border-black p-1"></td>
                        <td className="border-r-[2px] border-black p-1"></td>
                        <td className="border-r-[2px] border-black p-1"></td>
                        <td className="border-r-[2px] border-black" style={printBlackColStyle}></td>
                        
                        {/* FUSION : Boite de décision du Jury et Signature (Prend 6 lignes de hauteur) */}
                        <td colSpan={2} rowSpan={6} className="p-1 align-top text-left border-black text-[9px] font-normal pb-2">
                            <div className="flex flex-col h-full justify-between">
                                <div>
                                    <div>- PASSE (1)</div>
                                    <div>- DOUBLE (1)</div>
                                    <div className="mt-1">LE ......../........ / 20......</div>
                                </div>
                                <div className="text-center mt-2 leading-tight">
                                    <div>Le Chef</div>
                                    <div>d'Etablissement</div>
                                </div>
                                <div className="text-center mt-3">
                                    Sceau de l'école
                                </div>
                            </div>
                        </td>
                    </tr>
                    
                    {/* POURCENTAGE */}
                    <tr className="border-b border-black font-bold h-6">
                        <td className="border-r-[2px] border-black p-1 text-left pl-2 uppercase">POURCENTAGE</td>
                        <td className="border-r border-black p-1"></td>
                        <td className="border-r border-black p-1"></td>
                        <td className="border-r border-black p-1"></td>
                        <td className="border-r-[2px] border-black p-1"></td>
                        <td className="border-r border-black p-1"></td>
                        <td className="border-r border-black p-1"></td>
                        <td className="border-r border-black p-1"></td>
                        <td className="border-r-[2px] border-black p-1"></td>
                        <td className="border-r-[2px] border-black p-1"></td>
                        <td className="border-r-[2px] border-black" style={printBlackColStyle}></td>
                    </tr>
                    
                    {/* PLACE / NBRE D'ELEVES */}
                    <tr className="border-b-[2px] border-black font-bold h-6 text-center">
                        <td className="border-r-[2px] border-black p-1 text-left pl-2 uppercase">PLACE / NBRE D'ELEVES</td>
                        <td className="border-r border-black p-0">/</td>
                        <td className="border-r border-black p-0">/</td>
                        <td className="border-r border-black p-0">/</td>
                        <td className="border-r-[2px] border-black p-0">/</td>
                        <td className="border-r border-black p-0">/</td>
                        <td className="border-r border-black p-0">/</td>
                        <td className="border-r border-black p-0">/</td>
                        <td className="border-r-[2px] border-black p-0">/</td>
                        <td className="border-r-[2px] border-black p-0">/</td>
                        <td className="border-r-[2px] border-black" style={printBlackColStyle}></td>
                    </tr>
                    
                    {/* APPLICATION */}
                    <tr className="border-b border-black font-bold h-6">
                        <td className="border-r-[2px] border-black p-1 text-left pl-2 uppercase">APPLICATION</td>
                        <td className="border-r border-black p-1"></td>
                        <td className="border-r border-black p-1"></td>
                        <td className={`border-r border-black ${hatchedBg}`}></td>
                        <td className="border-r-[2px] border-black p-1"></td>
                        <td className="border-r border-black p-1"></td>
                        <td className="border-r border-black p-1"></td>
                        <td className={`border-r border-black ${hatchedBg}`}></td>
                        <td className={`border-r-[2px] border-black ${hatchedBg}`}></td>
                        <td className={`border-r-[2px] border-black ${hatchedBg}`}></td>
                        <td className="border-r-[2px] border-black" style={printBlackColStyle}></td>
                    </tr>
                    
                    {/* CONDUITE */}
                    <tr className="border-b-[2px] border-black font-bold h-6">
                        <td className="border-r-[2px] border-black p-1 text-left pl-2 uppercase">CONDUITE</td>
                        <td className="border-r border-black p-1"></td>
                        <td className="border-r border-black p-1"></td>
                        <td className={`border-r border-black ${hatchedBg}`}></td>
                        <td className="border-r-[2px] border-black p-1"></td>
                        <td className="border-r border-black p-1"></td>
                        <td className="border-r border-black p-1"></td>
                        <td className={`border-r border-black ${hatchedBg}`}></td>
                        <td className={`border-r-[2px] border-black ${hatchedBg}`}></td>
                        <td className={`border-r-[2px] border-black ${hatchedBg}`}></td>
                        <td className="border-r-[2px] border-black" style={printBlackColStyle}></td>
                    </tr>
                    
                    {/* SIGNATURE DU RESPONSABLE */}
                    <tr className="border-b-[2px] border-black font-bold h-7">
                        <td className="border-r-[2px] border-black p-1 text-left pl-2">Signature du responsable</td>
                        <td className="border-r border-black p-1"></td>
                        <td className="border-r border-black p-1"></td>
                        <td className="border-r border-black p-1"></td>
                        <td className="border-r-[2px] border-black p-1"></td>
                        <td className="border-r border-black p-1"></td>
                        <td className="border-r border-black p-1"></td>
                        <td className="border-r border-black p-1"></td>
                        <td className="border-r-[2px] border-black p-1"></td>
                        <td className="border-r-[2px] border-black p-1"></td>
                        <td className="border-r-[2px] border-black" style={printBlackColStyle}></td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
};

export default BulletinBodyHumanite;