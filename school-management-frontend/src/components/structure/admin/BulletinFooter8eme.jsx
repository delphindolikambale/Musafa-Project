import React from 'react';

const BulletinFooter8eme = ({ bulletinData }) => {
    return (
        <div className="border-2 border-black p-2 text-[10px] font-serif relative mt-1 print:text-black bg-white">
            <div className="flex justify-between items-start gap-4">
                
                {/* Colonne Gauche : TENASOSP & Commission */}
                <div className="w-[48%]">
                    <table className="w-full border-collapse border-2 border-black text-center text-[9px] font-bold">
                        <thead>
                            <tr className="bg-gray-100">
                                <th className="border-2 border-black p-1 text-left uppercase">RESULTAT FINAL</th>
                                <th className="border-2 border-black p-1 uppercase w-24">POINTS OBTENUS</th>
                                <th className="border-2 border-black p-1 uppercase w-16">MAX</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="border-2 border-black p-1 text-left font-bold">MOYENNE ECOLE</td>
                                <td className="border-2 border-black p-1 font-normal"></td>
                                <td className="border-2 border-black p-1 bg-gray-50">50</td>
                            </tr>
                            <tr>
                                <td className="border-2 border-black p-1 text-left font-bold">TENASOSP</td>
                                <td className="border-2 border-black p-1 font-normal"></td>
                                <td className="border-2 border-black p-1 bg-gray-50">50</td>
                            </tr>
                            <tr className="bg-gray-50 font-black">
                                <td className="border-2 border-black p-1 text-left">TOTAL</td>
                                <td className="border-2 border-black p-1"></td>
                                <td className="border-2 border-black p-1">100</td>
                            </tr>
                        </tbody>
                    </table>
                    
                    <div className="mt-2 text-[9.5px] leading-tight font-bold">
                        <p className="uppercase">- DECISION DU JURY : Passe <sup>(1)</sup>, Double <sup>(1)</sup></p>
                        <p className="mt-1 font-normal">- Option Orientée : .................................................................................................</p>
                    </div>

                    <table className="w-full border-collapse border-2 border-black text-[8.5px] font-bold mt-2">
                        <thead>
                            <tr className="bg-gray-50 text-center font-normal italic">
                                <th className="border-2 border-black p-0.5 text-left w-[35%]">Membre de la commission</th>
                                <th className="border-2 border-black p-0.5 text-left">Noms</th>
                                <th className="border-2 border-black p-0.5 text-left w-[25%]">Signatures</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td className="border-2 border-black p-1 font-normal">1. Superviseur :</td>
                                <td className="border-2 border-black p-1"></td>
                                <td className="border-2 border-black p-1"></td>
                            </tr>
                            <tr>
                                <td className="border-2 border-black p-1 font-normal">2. Superviseur Adjoint :</td>
                                <td className="border-2 border-black p-1"></td>
                                <td className="border-2 border-black p-1"></td>
                            </tr>
                            <tr>
                                <td className="border-2 border-black p-1 font-normal">3. Président :</td>
                                <td className="border-2 border-black p-1"></td>
                                <td className="border-2 border-black p-1"></td>
                            </tr>
                        </tbody>
                    </table>
                    <p className="text-[7.5px] mt-1 font-normal text-gray-600">(1) Biffer la mention inutile.</p>
                </div>

                {/* Colonne Droite : Signatures et Sceaux */}
                <div className="w-[50%] flex flex-col justify-between h-full min-h-[170px] pt-1">
                    <div className="flex justify-between text-[9.5px]">
                        <div className="font-bold uppercase tracking-wider">Signature de l'élève</div>
                        <div className="italic font-medium">Fait à ........................................, le ......../......../20........</div>
                    </div>
                    
                    <div className="text-center font-black text-[10px] mt-6 tracking-tight">
                        Sceau de l'École et signature du Préfet des études,
                    </div>
                    
                    <div className="text-center font-black text-[10px] mt-10 mb-4">
                        Sceau du Pool d'Inspection
                    </div>
                </div>
            </div>

            {/* Mentions Légales */}
            <div className="mt-3 pt-1 border-t border-black/30 text-[8px] flex justify-between items-end leading-tight">
                <div>
                    <p className="font-black uppercase">NOTE IMPORTANTE : Le bulletin est sans valeur s'il est raturé ou surchargé.</p>
                    <p className="font-bold italic uppercase text-red-700 print:text-black">Interdiction formelle de reproduire ce bulletin sous peine des sanctions prévues par la loi.</p>
                </div>
                <div className="font-black text-[10px] tracking-wider">
                    IGE/P.S./008
                </div>
            </div>
        </div>
    );
};

export default BulletinFooter8eme;