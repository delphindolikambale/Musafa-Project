import React from 'react';

const BulletinFooter = ({ bulletinData }) => {
    const formatType = bulletinData?.formatType || '7EME_EB';

    return (
        <div className="border-[2px] border-black p-2 text-[11px] font-serif bg-white text-black print:text-black leading-snug">
            
            {/* Section 1 : Conditions de passage */}
            <div className="space-y-1 mb-4">
                <div className="flex w-full items-end">
                    <span className="whitespace-nowrap mr-1">- L'élève ne pourra passer dans la classe supérieure s'il n'a subi avec succès un examen de repêchage en</span>
                    <div className="flex-grow border-b-[2px] border-dotted border-black mb-[3px]"></div>
                </div>
                <div className="flex w-full items-end">
                    <div className="flex-grow border-b-[2px] border-dotted border-black mb-[3px]"></div>
                    <span className="ml-1">(1)</span>
                </div>
                <p>- L'élève passe dans la classe supérieure (1)</p>
                <p>- L'élève double la classe (1)</p>
            </div>

            {/* Section 2 : Signatures et Sceau (Alignement rigoureux par le bas) */}
            <div className="flex justify-between items-end mt-6 px-4">
                
                {/* Colonne 1 : Élève */}
                <div className="text-center font-bold w-1/4">
                    Signature de l'élève
                </div>
                
                {/* Colonne 2 : Sceau */}
                <div className="text-center font-bold w-1/4">
                    Sceau de l'Ecole
                </div>
                
                {/* Colonne 3 : Direction */}
                <div className="w-[45%] flex flex-col items-center">
                    {/* Bloc Date */}
                    <div className="flex items-end w-full whitespace-nowrap mb-4">
                        <span className="mr-1">Fait à</span>
                        <span className="flex-grow border-b-[2px] border-dotted border-black mb-[3px]"></span>
                        <span className="mx-2">, le</span>
                        <span className="w-8 border-b-[2px] border-dotted border-black mb-[3px]"></span>
                        <span className="mx-1">/</span>
                        <span className="w-8 border-b-[2px] border-dotted border-black mb-[3px]"></span>
                        <span className="mx-1">/ 20</span>
                        <span className="w-8 border-b-[2px] border-dotted border-black mb-[3px]"></span>
                    </div>
                    
                    {/* Bloc Signatures Direction */}
                    <div className="font-bold w-full text-center">Chef d'Etablissement,</div>
                    <div className="h-10 w-full"></div> {/* Espace pour la signature manuelle */}
                    <div className="font-bold w-full text-center">Noms et Signature</div>
                </div>
            </div>

            {/* Section 3 : Notes de bas de page et avertissement légal */}
            <div className="mt-5 text-[10px]">
                <div className="leading-tight">(1) Biffer la mention inutile.</div>
                <div className="leading-tight ml-4 mt-0.5">Note importante : Le bulletin est sans valeur s'il est raturé ou surchargé.</div>
                
                <div className="flex justify-center items-end relative mt-1">
                    <div className="font-bold italic text-[10.5px]">
                        Interdiction formelle de reproduire ce bulletin sous peine des sanctions prévues par la loi.
                    </div>
                    <div className="absolute right-0 bottom-0 font-bold text-[11px] tracking-wide">
                        {formatType === 'HUMANITES' ? 'IGE/P.S./042' : 'IGE/P.S./007'}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BulletinFooter;