import React from 'react';
import { Printer, X, CheckCircle } from 'lucide-react';

const ReceiptPayment = ({ data, onClose, onPrint }) => {
    if (!data) return null;

    const rawAmount = parseFloat(data.amount);
    const safeAmount = isNaN(rawAmount) ? 0 : rawAmount;
    
    let displayDate = data.paymentDate || '---';
    let displayTime = data.paymentTime || '---';
    
    const getLogoSrc = (logoStr) => {
        if (!logoStr) return null;
        return logoStr.startsWith('data:image') ? logoStr : `data:image/png;base64,${logoStr}`;
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto print:bg-white print:p-0 print:block">
            
            {/* Conteneur principal */}
            <div className="relative bg-white w-full max-w-[210mm] min-h-[99mm] shadow-2xl animate-in zoom-in duration-300 print:shadow-none print:m-0 print:w-[210mm] print:min-h-[99mm] print:absolute print:top-0 print:left-0">
                
                {/* TOOLBAR (Cachée à l'impression) */}
                <div className="bg-slate-800 p-3 flex justify-between items-center print:hidden rounded-t-md">
                    <div className="flex items-center gap-2 text-white font-medium text-sm">
                        <CheckCircle className="text-emerald-400" size={18} />
                        APERÇU DU REÇU (Format 1/3 A4 Portrait)
                    </div>
                    <div className="flex gap-2">
                        <button onClick={onPrint} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded flex items-center gap-2 text-sm font-bold transition-all">
                            <Printer size={16} /> Imprimer
                        </button>
                        <button onClick={onClose} className="bg-white/10 hover:bg-white/20 text-white p-1.5 rounded transition-colors">
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {/* ZONE DU REÇU - Ajustée pour ne pas couper le bas */}
                <div id="receipt-content" className="p-5 text-black bg-white relative font-sans text-sm flex flex-col justify-between print:p-6 print:m-0 print:w-[210mm] print:h-[99mm] print:overflow-visible">
                    
                    <div>
                        {/* EN-TÊTE */}
                        <div className="flex justify-between items-start mb-2">
                            <div className="flex gap-3 items-start">
                                {data.schoolLogo ? (
                                    <img 
                                        src={getLogoSrc(data.schoolLogo)} 
                                        alt="Logo École" 
                                        className="w-14 h-14 object-contain" 
                                        onError={(e) => e.target.style.display = 'none'}
                                    />
                                ) : (
                                    <div className="w-14 h-14 bg-gray-100 flex items-center justify-center text-[10px] text-gray-400 border">Logo</div>
                                )}
                                <div className="flex flex-col pt-0">
                                    <h1 className="font-bold text-[17px] uppercase leading-tight tracking-wide max-w-[380px]">
                                        {data.schoolName}
                                    </h1>
                                    <p className="text-[10px] mt-0.5 font-medium">{data.schoolAddress}</p>
                                    <p className="text-[10px]">Email : {data.schoolEmail}</p>
                                    <p className="text-[10px]">Site web : {data.schoolWebsite}</p>
                                </div>
                            </div>

                            <div className="flex flex-col items-end gap-1.5">
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-xs">N°</span>
                                    <div className="border border-black rounded-[4px] px-3 py-0.5 text-[11px] font-bold min-w-[160px] text-center bg-gray-50">
                                        {data.receiptNumber}
                                    </div>
                                </div>
                                <div className="border border-black rounded-[6px] px-8 py-0.5 font-bold text-sm mr-4 uppercase tracking-widest">
                                    RECU
                                </div>
                            </div>
                        </div>

                        <hr className="border-black border-t-[1.5px] mb-3" />

                        {/* CORPS DU REÇU */}
                        <div className="flex relative min-h-[120px]">
                            
                            <div className="w-[65%] pr-6 border-r border-black border-dashed flex flex-col gap-3">
                                
                                {/* Section Étudiant */}
                                <div>
                                    <div className="bg-[#001f3f] text-white font-bold text-[10px] w-24 py-0.5 rounded-sm text-center mb-1 shadow-sm">
                                        Élève
                                    </div>
                                    <div className="pl-4 space-y-0">
                                        <p className="font-bold tracking-wider text-[11px] text-gray-700">{data.studentRegNumber}</p>
                                        <p className="font-bold text-[12px] uppercase">{data.studentFullName}</p>
                                        <p className="font-bold text-[11px]">
                                            {data.classLevel} {data.sectionOption && <><span className="mx-2">/</span> {data.sectionOption}</>}
                                        </p>
                                    </div>
                                </div>

                                {/* Section Règlement */}
                                <div className="flex flex-col">
                                    <div className="flex items-center mb-2 w-full">
                                        <div className="bg-[#001f3f] text-white font-bold text-[10px] w-24 py-0.5 rounded-sm text-center shadow-sm flex-shrink-0 z-20">
                                            Règlement
                                        </div>
                                        <div className="flex-grow border-t-2 border-black mx-0"></div>
                                        <div className="bg-white border-2 border-black rounded-full px-4 py-1 text-center font-bold text-[14px] z-30 whitespace-nowrap shadow-sm ml-2">
                                            {safeAmount.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} {data.currency}
                                        </div>
                                    </div>

                                    <div className="pl-2 space-y-1 text-[11px]">
                                        <div className="flex items-center gap-2">
                                            <span className="w-32">Règlement en date du</span>
                                            <span className="font-bold border-b border-black border-dotted flex-1 pb-0">{displayDate}</span>
                                            <span>à :</span>
                                            <span className="font-bold border-b border-black border-dotted w-14 text-center pb-0">{displayTime}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="w-32">Pour un montant de</span>
                                            <span className="font-bold capitalize border-b border-black border-dotted flex-1 pb-0">{data.amountInWords}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="w-32 text-right pr-2">Pour :</span>
                                            <span className="font-bold border-b border-black border-dotted flex-1 pb-0">{data.paymentFor}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="w-32 text-right pr-2">Par :</span>
                                            <span className="font-bold border-b border-black border-dotted flex-1 pb-0">{data.paymentMethod}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Colonne Droite */}
                            <div className="w-[35%] pl-6 pt-1 flex flex-col justify-between">
                                <div>
                                    <h3 className="font-bold text-[15px] mb-1.5 border-b border-black inline-block">Les modes de paiement</h3>
                                    <p className="text-[12px] italic">
                                        - Cash (à la caisse de l'établissement)
                                    </p>
                                </div>
                                
                                <div className="mb-2 text-center">
                                    <p className="italic text-[13px] text-gray-700 bg-gray-50 py-1 px-2 border border-dashed border-gray-200">Veuillez bien conserver ce reçu</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* PIED DE PAGE - Forcé en bas sans être coupé */}
                    <div className="mt-auto">
                        
                        <div className="flex justify-between items-end relative">
                            <div className="w-[35%]">
                                <p className="font-bold text-[12px] italic mb-4">Nom, Signature Caissier(e) et Sceau</p>
                                <div className="text-[13px] font-bold text-[#001f3f] min-h-[20px]" style={{ fontFamily: 'cursive' }}>
                                    {data.cashierName}
                                </div>
                            </div>

                            <div className="w-[30%] flex flex-col items-center justify-end pb-1">
                                <p className="text-[9px] font-black text-center uppercase tracking-tighter italic border-t border-black pt-0.5">
                                    {data.schoolSlogan}
                                </p>
                            </div>

                            <div className="w-[35%] text-right pb-1">
                                <p className="text-[9px] font-bold uppercase tracking-widest border-2 border-black px-2 py-0.5 inline-block">
                                    MERCI POUR VOTRE PASSAGE !
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* STYLE D'IMPRESSION FINALISÉ */}
                <style dangerouslySetInnerHTML={{ __html: `
                    @media print {
                        body * { visibility: hidden; }
                        #receipt-content, #receipt-content * { visibility: visible; }
                        
                        #receipt-content { 
                            position: fixed !important; 
                            top: 0 !important; 
                            left: 0 !important; 
                            width: 210mm !important; 
                            height: 99mm !important;
                            max-height: 99mm !important;
                            margin: 0 !important;
                            padding: 10mm 12mm !important;
                            box-sizing: border-box !important;
                            display: flex !important;
                            flex-direction: column !important;
                            justify-content: space-between !important;
                        }

                        @page { 
                            size: A4 portrait; 
                            margin: 0; 
                        }
                        
                        body { margin: 0; padding: 0; background: white; }
                    }
                `}} />
            </div>
        </div>
    );
};

export default ReceiptPayment;