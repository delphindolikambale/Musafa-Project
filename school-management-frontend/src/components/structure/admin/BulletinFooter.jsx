import React from 'react';

const BulletinFooter = () => {
    return (
        <div className="mt-4 font-serif text-[10px] text-black print:text-black">
            {/* Grille des comportements et totaux généreux calquée sur le standard RDC */}
            <table className="w-full border-collapse border border-black mb-4">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="border border-black p-1 w-1/4 text-left pl-2">ÉVALUATION</th>
                        <th className="border border-black p-1 text-center">1e P.</th>
                        <th className="border border-black p-1 text-center">2e P.</th>
                        <th className="border border-black p-1 text-center bg-gray-200">1er SEM</th>
                        <th className="border border-black p-1 text-center">3e P.</th>
                        <th className="border border-black p-1 text-center">4e P.</th>
                        <th className="border border-black p-1 text-center bg-gray-200">2e SEM</th>
                        <th className="border border-black p-1 text-center bg-gray-300">ANNÉE</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td className="border border-black p-1 font-bold pl-2">Place dans la classe</td>
                        <td className="border border-black p-1 text-center">... / ...</td>
                        <td className="border border-black p-1 text-center">... / ...</td>
                        <td className="border border-black p-1 text-center bg-gray-200">... / ...</td>
                        <td className="border border-black p-1 text-center">... / ...</td>
                        <td className="border border-black p-1 text-center">... / ...</td>
                        <td className="border border-black p-1 text-center bg-gray-200">... / ...</td>
                        <td className="border border-black p-1 text-center bg-gray-300 font-bold">... / ...</td>
                    </tr>
                    <tr>
                        <td className="border border-black p-1 font-bold pl-2">Application (TB-B-AB-P-M-N)</td>
                        <td className="border border-black p-1 text-center"></td>
                        <td className="border border-black p-1 text-center"></td>
                        <td className="border border-black p-1 text-center bg-gray-200"></td>
                        <td className="border border-black p-1 text-center"></td>
                        <td className="border border-black p-1 text-center"></td>
                        <td className="border border-black p-1 text-center bg-gray-200"></td>
                        <td className="border border-black p-1 text-center bg-gray-300"></td>
                    </tr>
                    <tr>
                        <td className="border border-black p-1 font-bold pl-2">Conduite (E-TB-B-AB-P-M-N)</td>
                        <td className="border border-black p-1 text-center"></td>
                        <td className="border border-black p-1 text-center"></td>
                        <td className="border border-black p-1 text-center bg-gray-200"></td>
                        <td className="border border-black p-1 text-center"></td>
                        <td className="border border-black p-1 text-center"></td>
                        <td className="border border-black p-1 text-center bg-gray-200"></td>
                        <td className="border border-black p-1 text-center bg-gray-300"></td>
                    </tr>
                </tbody>
            </table>

            {/* Signatures */}
            <div className="flex justify-between mt-6 text-center px-4">
                <div className="w-1/3">
                    <p className="font-bold mb-12">Le Titulaire</p>
                    <p className="text-xs italic">(Nom et Signature)</p>
                </div>
                <div className="w-1/3">
                    <p className="font-bold mb-12">Sceau de l'École</p>
                </div>
                <div className="w-1/3">
                    <p className="font-bold mb-12">Le Chef d'Établissement</p>
                    <p className="text-xs italic">(Nom et Signature)</p>
                </div>
            </div>
            
            <p className="text-[9px] text-center mt-6 italic">Fait à ........................................., le ......../......../20......</p>
        </div>
    );
};

export default BulletinFooter;