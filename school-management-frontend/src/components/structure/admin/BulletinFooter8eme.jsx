import React from 'react';

const BulletinFooter8eme = ({ bulletinData }) => {
    return (
        <div className="border-[2px] border-black p-2 text-[11px] font-serif bg-white text-black print:text-black leading-snug">
            
            <div className="flex justify-between items-start gap-4">
                
                {/* Colonne Gauche : TENASOSP & Commission */}
                <div className="w-[52%]">
                    {/* Tableau 1 : Résultats */}
                    <table className="w-full border-collapse border-[2px] border-black text-center text-[10px] font-bold">
                        <thead>
                            <tr>
                                <th className="border-[2px] border-black p-1 text-left uppercase">RESULTAT FINAL</th>
                                <th className="border-[2px] border-black p-1 uppercase w-24">POINTS OBTENUS</th>
                                <th className="border-[2px] border-black p-1 uppercase w-12">MAX</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="border-[2px] border-black p-1 text-left font-bold">MOYENNE ECOLE</td>
                                <td className="border-[2px] border-black p-1 font-normal"></td>
                                <td className="border-[2px] border-black p-1 font-normal">50</td>
                            </tr>
                            <tr>
                                <td className="border-[2px] border-black p-1 text-left font-bold">TENASOSP</td>
                                <td className="border-[2px] border-black p-1 font-normal"></td>
                                <td className="border-[2px] border-black p-1 font-normal">50</td>
                            </tr>
                            <tr>
                                <td className="border-[2px] border-black p-1 text-left font-black">TOTAL</td>
                                <td className="border-[2px] border-black p-1"></td>
                                <td className="border-[2px] border-black p-1 font-black">100</td>
                            </tr>
                        </tbody>
                    </table>
                    
                    {/* Décision du Jury */}
                    <div className="mt-2 text-[10px] font-bold leading-relaxed">
                        <div className="flex w-full items-end">
                            <span className="whitespace-nowrap mr-1">- DECISION DU JURY : Passe</span>
                            <div className="flex-grow border-b-[2px] border-dotted border-black mb-[4px] mx-1"></div>
                            <span className="whitespace-nowrap mr-1">(1), Double</span>
                            <div className="flex-grow border-b-[2px] border-dotted border-black mb-[4px] mx-1"></div>
                            <span className="whitespace-nowrap">(1)</span>
                        </div>
                        <div className="flex w-full items-end mt-1">
                            <span className="whitespace-nowrap mr-1">- Option Orientée :</span>
                            <div className="flex-grow border-b-[2px] border-dotted border-black mb-[4px]"></div>
                        </div>
                    </div>

                    {/* Tableau 2 : Commission */}
                    <table className="w-full border-collapse border-[2px] border-black text-[10px] font-bold mt-2">
                        <thead>
                            <tr className="text-center font-normal">
                                <th className="border-[2px] border-black p-1 text-left w-[45%]">Membre de la commission</th>
                                <th className="border-[2px] border-black p-1 text-left">Noms</th>
                                <th className="border-[2px] border-black p-1 text-left w-[25%]">Signatures</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="border-[2px] border-black p-1 font-normal">1. Superviseur :</td>
                                <td className="border-[2px] border-black p-1"></td>
                                <td className="border-[2px] border-black p-1"></td>
                            </tr>
                            <tr>
                                <td className="border-[2px] border-black p-1 font-normal">2. Superviseur Adjoint :</td>
                                <td className="border-[2px] border-black p-1"></td>
                                <td className="border-[2px] border-black p-1"></td>
                            </tr>
                            <tr>
                                <td className="border-[2px] border-black p-1 font-normal">3. Président :</td>
                                <td className="border-[2px] border-black p-1"></td>
                                <td className="border-[2px] border-black p-1"></td>
                            </tr>
                        </tbody>
                    </table>
                    <p className="text-[9px] mt-0.5 font-normal">(1) Biffer la mention inutile.</p>
                </div>

                {/* Colonne Droite : Signatures et Sceaux */}
                <div className="w-[48%] flex flex-col pt-1">
                    {/* Top Right : Signature élève & Date */}
                    <div className="flex justify-between items-end text-[10px]">
                        <div className="font-bold">Signature de l'élève</div>
                        <div className="font-normal">
                            Fait à ........................................, le ......../......../20........
                        </div>
                    </div>
                    
                    {/* Middle Right : Sceau Ecole */}
                    <div className="text-center font-bold text-[11px] mt-6">
                        Sceau de l'Ecole et signature du Préfet des études,
                    </div>
                    <div className="h-14 w-full"></div>
                    
                    {/* Bottom Right : Sceau Inspection */}
                    <div className="text-center font-bold text-[11px] mt-2">
                        Sceau du Pool d'Inspection
                    </div>
                    <div className="h-12 w-full"></div>
                </div>
            </div>

            {/* Mentions Légales */}
            <div className="mt-2 text-[10px]">
                <div className="leading-tight ml-2">Note importante : Le bulletin est sans valeur s'il est raturé ou surchargé.</div>
                
                <div className="relative flex justify-center items-end mt-1">
                    <div className="font-bold italic text-[10.5px]">
                        Interdiction formelle de reproduire ce bulletin sous peine des sanctions prévues par la loi.
                    </div>
                    <div className="absolute right-0 bottom-0 font-bold text-[11px] tracking-wide">
                        IGE/P.S./008
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BulletinFooter8eme;