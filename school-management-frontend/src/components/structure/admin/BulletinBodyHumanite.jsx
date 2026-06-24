import React from 'react';

const BulletinBodyHumanite = ({ bulletinData, header }) => {
    if (!bulletinData) return <div className="text-center p-4 font-serif">Chargement de la grille...</div>;

    const { domains } = bulletinData;
    const hatchedBg = "bg-[repeating-linear-gradient(-45deg,#a3a3a3,#a3a3a3_1px,transparent_1px,transparent_4px)] print:opacity-70";
    const printBlackColStyle = { backgroundColor: 'black', WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' };

    // Extraction à plat de tous les cours pour le format Humanités
    const allHumanitesSubjects = domains?.flatMap(d => d.subjects || []) || [];

    return (
        <div className="relative w-full text-black font-serif text-[10px] leading-tight print:text-black">
            <table className="w-full table-fixed border-collapse border-2 border-black text-center">
                {/* Copiez ou adaptez ici votre en-tête standard (<thead>) du tableau de note */}
                {/* Et effectuez le mappage exclusif (allHumanitesSubjects.map) pour vos lignes */}
                <tbody>
                    {allHumanitesSubjects.map((subject, idx) => (
                        <tr key={idx} className="border-b border-black">
                            {/* Vos cellules td pour les cours des Humanités */}
                        </tr>
                    ))}
                    {/* Ligne des signatures internes du corps (Directeur, Prof, etc.) */}
                    <tr className="bg-transparent text-[9.5px] h-7">
                        <td className="border-r-2 border-black p-1 text-left font-black pl-2">SIGNATURE</td>
                        <td className="border-r border-black p-0.5"></td>
                        <td className="border-r border-black p-0.5"></td>
                        <td className={`border-r-2 border-black ${hatchedBg}`}></td>
                        <td className="border-r border-black p-0.5"></td>
                        <td className="border-r border-black p-0.5"></td>
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

export default BulletinBodyHumanite;