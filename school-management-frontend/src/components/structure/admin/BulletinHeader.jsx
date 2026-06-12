import React from 'react';

const BulletinHeader = ({ header, studentInfo, formatType }) => {
    // Générateur de cases à cocher / caractères pour les codes officiels
    const renderCodeBoxes = (codeString, length = 15) => {
        const chars = (codeString || "").padEnd(length, " ").substring(0, length).split("");
        return (
            <div className="flex border-t border-l border-black inline-flex">
                {chars.map((ch, idx) => (
                    <span key={idx} className="w-[11px] h-[14px] border-b border-r border-black text-center font-mono text-[10px] leading-none flex items-center justify-center font-bold">
                        {ch !== " " ? ch : ""}
                    </span>
                ))}
            </div>
        );
    };

    return (
        <div className="w-full text-black font-serif text-[10px] leading-tight print:text-black">
            
            {/* 1. Bloc Supérieur : Drapeau, Ministère, Armoiries */}
            <div className="grid grid-cols-12 items-center gap-2 mb-2">
                <div className="col-span-3 flex flex-col items-start">
                    {header?.flagImagePath ? (
                        <img src={`http://localhost:8080/${header.flagImagePath}`} alt="Drapeau RDC" className="w-16 h-10 border border-black object-cover" />
                    ) : (
                        <div className="w-16 h-10 border border-black bg-gray-100 flex items-center justify-center text-[8px]">DRAP.</div>
                    )}
                </div>
                
                <div className="col-span-6 text-center">
                    <h1 className="font-bold text-[11px] uppercase tracking-wide">
                        {header?.country || "REPUBLIQUE DEMOCRATIQUE DU CONGO"}
                    </h1>
                    <p className="text-[9px] uppercase font-bold tracking-tight leading-none mt-0.5">
                        {header?.ministry || "MINISTERE DE L'EDUCATION NATIONALE ET NOUVELLE CITOYENNETE"}
                    </p>
                </div>

                <div className="col-span-3 flex justify-end">
                    {header?.ministryLogoPath ? (
                        <img src={`http://localhost:8080/${header.ministryLogoPath}`} alt="Sceau National" className="w-12 h-12 object-contain" />
                    ) : (
                        <div className="w-12 h-12 border border-dashed border-gray-400 rounded-full flex items-center justify-center text-[8px]">LOGO</div>
                    )}
                </div>
            </div>

            {/* 2. Ligne du Numéro d'Identifiant National (N° ID.) */}
            <div className="flex items-center gap-2 mb-2 border border-black p-1 bg-gray-50/50">
                <span className="font-bold text-[10px] shrink-0">N° ID.</span>
                {renderCodeBoxes(studentInfo?.matricule, 25)}
            </div>

            {/* 3. Grille Bilatérale de Renseignements */}
            <div className="grid grid-cols-2 border border-black">
                
                {/* Bloc Gauche : Coordonnées de l'Établissement */}
                <div className="border-r border-black p-1.5 space-y-1 text-[10px]">
                    <p className="truncate">PROVINCE EDUCATIONNELLE : <span className="font-bold uppercase">{header?.educationalProvince || "................................................"}</span></p>
                    <p className="truncate">VILLE : <span className="font-bold uppercase">{header?.city || "................................................"}</span></p>
                    <p className="truncate">COMMUNE / TERRITOIRE : <span className="font-bold uppercase">{header?.communeTerritory || "................................................"}</span></p>
                    <p className="truncate">ECOLE : <span className="font-bold uppercase text-blue-900">{header?.schoolName || "................................................"}</span></p>
                    <div className="flex items-center gap-1 mt-1">
                        <span className="text-[9px]">CODE :</span>
                        {renderCodeBoxes(header?.schoolCode, 14)}
                    </div>
                </div>

                {/* Bloc Droite : Identification de l'Élève */}
                <div className="p-1.5 space-y-1 text-[10px]">
                    <p className="truncate">ELEVE : <span className="font-bold uppercase text-base font-sans tracking-wide">{studentInfo?.lastName} {studentInfo?.postName} {studentInfo?.firstName}</span></p>
                    <div className="grid grid-cols-12 gap-1">
                        <p className="col-span-8 truncate">NE(E) A : <span className="font-bold uppercase">{studentInfo?.birthPlace || "..........................."}</span></p>
                        <p className="col-span-4 truncate text-right">SEXE : <span className="font-bold uppercase">{studentInfo?.gender || "..."}</span></p>
                    </div>
                    <p>LE : <span className="font-bold">{studentInfo?.birthDate || "..../..../........"}</span></p>
                    <p>CLASSE : <span className="font-bold uppercase">{studentInfo?.classLevel || "................................................"}</span></p>
                    <div className="flex items-center gap-1 mt-1">
                        <span className="text-[9px]">N° PERM. :</span>
                        {renderCodeBoxes(studentInfo?.permanentNumber, 12)}
                    </div>
                </div>
            </div>

            {/* 4. Libellé Central du Bulletin */}
            <div className="text-center mt-2">
                <div className="inline-block border-2 border-black px-4 py-1 bg-white font-sans font-black text-[12px] uppercase tracking-wider">
                    BULLETIN DE LA {studentInfo?.classLevel || "..."} — ANNEE SCOLAIRE {studentInfo?.schoolYear || "20... - 20..."}
                </div>
                {(studentInfo?.section || studentInfo?.option) && (
                    <p className="text-[10px] font-bold uppercase tracking-tight mt-1">
                        SECTION : {studentInfo?.section || "............."} | OPTION : {studentInfo?.option || "............."}
                    </p>
                )}
            </div>

        </div>
    );
};

export default BulletinHeader;