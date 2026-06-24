import React from 'react';

const BulletinFooter = ({ bulletinData }) => {
    const formatType = bulletinData?.formatType || '7EME_EB';

    return (
        <div className="border-2 border-black p-3 text-[10px] font-serif relative mt-1 print:text-black bg-white">
            <ul className="list-none p-0 m-0 space-y-2 leading-tight font-normal text-[10px]">
                <li>- L'élève ne pourra passer dans la classe supérieure s'il n'a subi avec succès un examen de repêchage en........................................................................................................................ <sup>(1)</sup></li>
                <li>- L'élève passe dans la classe supérieure <sup>(1)</sup></li>
                <li>- L'élève double la classe <sup>(1)</sup></li>
            </ul>
            
            <div className="flex justify-between items-start mt-8 px-4">
                <div className="text-center font-black uppercase tracking-wide w-1/4">
                    Signature de l'élève
                </div>
                <div className="text-center font-black uppercase tracking-wide w-1/4">
                    Sceau de l'École
                </div>
                <div className="text-right w-[45%]">
                    <p className="italic font-medium text-[9.5px]">Fait à ..........................................................., le ......../......../20........</p>
                    <p className="font-black mt-4 text-center uppercase mr-6">Chef d'Etablissement,</p>
                    <p className="font-black mt-8 text-center uppercase mr-6">Noms et Signature</p>
                </div>
            </div>
            
            <div className="mt-6 pt-1 text-[8px] leading-tight flex justify-between items-end">
                <div>
                    <p className="font-normal text-gray-800">(1) Biffer la mention inutile.</p>
                    <p className="font-black mt-1">Note importante : Le bulletin est sans valeur s'il est raturé ou surchargé.</p>
                    <p className="font-bold italic uppercase text-red-700 print:text-black">Interdiction formelle de reproduire ce bulletin sous peine des sanctions prévues par la loi.</p>
                </div>
                <div className="font-black text-[10px] tracking-wider">
                    {formatType === 'HUMANITES' ? 'IGE/P.S./042' : 'IGE/P.S./007'}
                </div>
            </div>
        </div>
    );
};

export default BulletinFooter;