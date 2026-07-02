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
                                <th className="border-[2px] border-black p-1 uppercase w-16">MAX</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="border-[2px] border-black p-1 text-left font-bold">MOYENNE ECOLE</td>
                                <td className="border-[2px] border-black p-1 font-normal"></td>
                                <td className="border-[2px] border-black p-1">50</td>
                            </tr>
                            <tr>
                                <td className="border-[2px] border-black p-1 text-left font-bold">TENASOSP</td>
                                <td className="border-[2px] border-black p-1 font-normal"></td>
                                <td className="border-[2px] border-black p-1">50</td>
                            </tr>
                            <tr>
                                <td className="border-[2px] border-black p-1 text-left font-black">TOTAL</td>
                                <td className="border-[2px] border-black p-1"></td>
                                <td className="border-[2px] border-black p-1 font-black">100</td>
                            </tr>
                        </tbody>
                    </table>
                    
                    {/* Décision du Jury */}
                    <div className="mt-3 text-[10px] font-bold space-y-1">
                        <p className="uppercase">- DECISION DU JURY : Passe (1), Double (1)</p>
                        <div className="flex w-full items-end font-normal">
                            <span className="whitespace-nowrap mr-1">- Option Orientée :</span>
                            <div className="flex-grow border-b-[2px] border-dotted border-black mb-[3px]"></div>
                        </div>
                    </div>

                    {/* Tableau 2 : Commission */}
                    <table className="w-full border-collapse border-[2px] border-black text-[10px] font-bold mt-3">
                        <thead>
                            <tr className="text-center font-normal italic">
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
                    <p className="text-[9px] mt-1 font-normal">(1) Biffer la mention inutile.</p>
                </div>

                {/* Colonne Droite : Signatures et Sceaux */}
                <div className="w-[48%] flex flex-col pt-1">
                    {/* Top Right : Signature élève & Date */}
                    <div className="flex justify-between items-end text-[10px]">
                        <div className="font-bold uppercase">Signature de l'élève</div>
                        <div className="flex items-end">
                            <span className="italic mr-1">Fait à</span>
                            <span className="w-24 border-b-[2px] border-dotted border-black mb-[3px]"></span>
                            <span className="italic mx-1">, le</span>
                            <span className="w-6 border-b-[2px] border-dotted border-black mb-[3px]"></span>
                            <span className="italic mx-1">/</span>
                            <span className="w-6 border-b-[2px] border-dotted border-black mb-[3px]"></span>
                            <span className="italic mx-1">/ 20</span>
                            <span className="w-6 border-b-[2px] border-dotted border-black mb-[3px]"></span>
                        </div>
                    </div>
                    
                    {/* Middle Right : Sceau Ecole */}
                    <div className="text-center font-bold text-[11px] mt-8">
                        Sceau de l'Ecole et signature du Préfet des études,
                    </div>
                    <div className="h-16 w-full"></div> {/* Espace réservé pour Sceau et Signature Ecole */}
                    
                    {/* Bottom Right : Sceau Inspection */}
                    <div className="text-center font-bold text-[11px] mt-4">
                        Sceau du Pool d'Inspection
                    </div>
                    <div className="h-14 w-full"></div> {/* Espace réservé pour Sceau Inspection */}
                </div>
            </div>

            {/* Mentions Légales */}
            <div className="mt-4 text-[10px]">
                <div className="leading-tight ml-4 mt-0.5">Note importante : Le bulletin est sans valeur s'il est raturé ou surchargé.</div>
                
                <div className="flex justify-center items-end relative mt-1">
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