import React, { useState, useEffect } from 'react';
import ArchiveService from '../../services/ArchiveService'; 
import { Search, FolderOpen, User, GraduationCap } from 'lucide-react';
import StudentArchiveDetail from './StudentArchiveDetail'; 

const ArchiveDashboard = () => {
    const [students, setStudents] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [selectedStudent, setSelectedStudent] = useState(null);

    useEffect(() => {
        loadStudents();
    }, []);

    const loadStudents = async () => {
        try {
            const data = await ArchiveService.getAllStudentsSummary();
            setStudents(data || []);
        } catch (error) {
            console.error("Erreur de chargement", error);
        } finally {
            setLoading(false);
        }
    };

    const handleStudentClick = (student) => {
        setSelectedStudent(student.matricule);
    };

    const filteredStudents = students.filter(s => 
        (s.fullName && s.fullName.toLowerCase().includes(searchTerm.toLowerCase())) || 
        (s.matricule && s.matricule.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (loading) return <div className="p-10 text-center text-blue-600 font-bold italic">Chargement de la base des archives...</div>;

    if (selectedStudent) {
        return (
            <StudentArchiveDetail 
                selectedMatricule={selectedStudent} 
                onBack={() => setSelectedStudent(null)} 
            />
        );
    }

    return (
        <div className="bg-gray-50 h-screen flex flex-col overflow-hidden">
            {/* ZONE FIXE : En-tête et Barre de recherche */}
            <div className="w-full bg-gray-50 pt-8 px-8 pb-4">
                <div className="max-w-6xl mx-auto">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-3xl font-extrabold text-gray-800 flex items-center gap-3">
                                <FolderOpen className="text-blue-600 w-10 h-10" />
                                Archives des Dossiers Élèves
                            </h1>
                            <p className="text-gray-500 mt-2">Consultez l'historique complet et les documents par année scolaire.</p>
                        </div>
                    </div>

                    <div className="relative mb-4">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="Rechercher un élève par nom ou matricule..." 
                            className="w-full pl-12 pr-4 py-4 rounded-2xl border-none shadow-md focus:ring-2 focus:ring-blue-500 text-lg"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* ZONE SCROLLABLE : Grille des dossiers */}
            <div className="flex-1 overflow-y-auto px-8 pb-8 custom-scrollbar">
                <div className="max-w-6xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
                        {filteredStudents.map((student) => (
                            <div 
                                key={student.matricule}
                                onClick={() => handleStudentClick(student)}
                                className="bg-white p-6 rounded-2xl shadow-sm border border-transparent hover:border-blue-500 hover:shadow-xl transition-all cursor-pointer group"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center overflow-hidden border-2 border-white shadow-inner">
                                        {student.photoUrl ? (
                                            <img src={student.photoUrl} alt="Photo" className="w-full h-full object-cover" />
                                        ) : (
                                            <User className="text-blue-300 w-8 h-8" />
                                        )}
                                    </div>
                                    <div>
                                        <h2 className="font-bold text-gray-800 group-hover:text-blue-600 transition-colors uppercase">
                                            {student.fullName}
                                        </h2>
                                        <p className="text-blue-500 font-mono text-sm">{student.matricule}</p>
                                    </div>
                                </div>
                                
                                <div className="mt-4 pt-4 border-t border-gray-50 flex justify-between items-center text-sm text-gray-500">
                                    <span className="flex items-center gap-1">
                                        <GraduationCap size={16} /> Historique disponible
                                    </span>
                                    <span className="text-blue-600 font-semibold group-hover:translate-x-1 transition-transform">
                                        Ouvrir le dossier →
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {filteredStudents.length === 0 && (
                        <div className="text-center py-20 bg-white rounded-3xl shadow-inner border-2 border-dashed border-gray-200 mt-4">
                            <p className="text-gray-400 text-xl italic">Aucun élève trouvé pour cette recherche.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ArchiveDashboard;