import React, { useState, useEffect } from 'react';
import { studentService } from '../../services/studentService';

const AddStudentForm = ({ onStudentAdded, initialData }) => {
    const [student, setStudent] = useState({
        permanentNumber: '', lastName: '', postName: '', firstName: '',
        gender: 'MASCULIN', birthDate: '', birthPlace: '',
        commune: '', quartier: '', fatherName: '', fatherProfession: '', 
        motherName: '', motherProfession: '', photoUrl: '', status: 'ACTIF'
    });

    useEffect(() => {
        if (initialData) {
            setStudent(initialData);
        } else {
            setStudent({
                permanentNumber: '', lastName: '', postName: '', firstName: '',
                gender: 'MASCULIN', birthDate: '', birthPlace: '',
                commune: '', quartier: '', fatherName: '', fatherProfession: '', 
                motherName: '', motherProfession: '', photoUrl: '', status: 'ACTIF'
            });
        }
    }, [initialData]);

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setStudent({ ...student, photoUrl: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (student.id) {
                await studentService.update(student.id, student);
            } else {
                await studentService.create(student);
            }
            onStudentAdded();
        } catch (error) { 
            console.error(error);
            alert("Erreur lors de l'enregistrement"); 
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-h-[70vh] overflow-y-auto px-4 py-2">
            <div className="flex items-center gap-6 bg-blue-50 p-6 rounded-3xl border-2 border-dashed border-blue-200">
                <div className="h-28 w-28 bg-white rounded-2xl shadow-lg overflow-hidden flex-shrink-0">
                    {student.photoUrl ? <img src={student.photoUrl} className="h-full w-full object-cover" alt="Student Preview" /> : <div className="h-full w-full flex items-center justify-center text-blue-200 text-4xl">👤</div>}
                </div>
                <div className="space-y-2">
                    <h3 className="text-blue-900 font-black text-xs uppercase italic">Photo de l'élève</h3>
                    <label className="inline-block bg-blue-700 text-white text-[10px] font-black px-4 py-2 rounded-lg cursor-pointer uppercase hover:bg-blue-800 transition-colors">
                        📸 Choisir la photo
                        <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                    </label>
                </div>
            </div>

            <div className="border-l-4 border-blue-900 pl-4">
                <h3 className="text-blue-900 font-bold uppercase text-[11px] mb-3">Identité</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <label className="text-[10px] font-bold text-slate-400">N° Permanent National</label>
                        <input 
                            required 
                            className="w-full border-b-2 border-slate-200 outline-none p-2 font-mono text-sm focus:border-blue-900" 
                            value={student.permanentNumber} 
                            onChange={(e) => setStudent({...student, permanentNumber: e.target.value})} 
                        />
                    </div>
                    <input 
                        placeholder="NOM" 
                        required 
                        className="border p-3 rounded-xl bg-slate-50 uppercase font-black text-sm" 
                        value={student.lastName} 
                        onChange={(e) => setStudent({...student, lastName: e.target.value.toUpperCase()})} 
                    />
                    <input 
                        placeholder="POST-NOM" 
                        required 
                        className="border p-3 rounded-xl bg-slate-50 uppercase font-black text-sm" 
                        value={student.postName} 
                        onChange={(e) => setStudent({...student, postName: e.target.value.toUpperCase()})} 
                    />
                    <input 
                        placeholder="PRÉNOM" 
                        required 
                        className="border p-3 rounded-xl bg-slate-50 font-bold text-sm" 
                        value={student.firstName} 
                        onChange={(e) => setStudent({...student, firstName: e.target.value})} 
                    />
                    <select 
                        className="border p-3 rounded-xl bg-blue-900 text-white font-black text-sm outline-none" 
                        value={student.gender} 
                        onChange={(e) => setStudent({...student, gender: e.target.value})}
                    >
                        <option value="MASCULIN">MASCULIN</option>
                        <option value="FEMININ">FÉMININ</option>
                    </select>
                </div>
            </div>

            <div className="border-l-4 border-blue-400 pl-4">
                <h3 className="text-blue-600 font-bold uppercase text-[11px] mb-3">Origine & Localisation</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input 
                        type="date" 
                        required 
                        className="border p-3 rounded-xl bg-slate-50 font-bold text-sm" 
                        value={student.birthDate} 
                        onChange={(e) => setStudent({...student, birthDate: e.target.value})} 
                    />
                    <input 
                        placeholder="LIEU DE NAISSANCE" 
                        required 
                        className="border p-3 rounded-xl bg-slate-50 uppercase font-bold text-sm" 
                        value={student.birthPlace} 
                        onChange={(e) => setStudent({...student, birthPlace: e.target.value.toUpperCase()})} 
                    />
                    <input 
                        placeholder="COMMUNE" 
                        className="border p-3 rounded-xl bg-slate-50 uppercase font-bold text-sm" 
                        value={student.commune} 
                        onChange={(e) => setStudent({...student, commune: e.target.value.toUpperCase()})} 
                    />
                    <input 
                        placeholder="QUARTIER" 
                        className="border p-3 rounded-xl bg-slate-50 uppercase font-bold text-sm" 
                        value={student.quartier} 
                        onChange={(e) => setStudent({...student, quartier: e.target.value.toUpperCase()})} 
                    />
                </div>
            </div>

            <div className="border-l-4 border-slate-400 pl-4">
                <h3 className="text-slate-600 font-bold uppercase text-[11px] mb-3">Filiation</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input 
                        placeholder="NOM DU PÈRE" 
                        className="border p-3 rounded-xl bg-slate-50 uppercase font-bold text-sm" 
                        value={student.fatherName} 
                        onChange={(e) => setStudent({...student, fatherName: e.target.value.toUpperCase()})} 
                    />
                    <input 
                        placeholder="PROFESSION DU PÈRE" 
                        className="border p-3 rounded-xl bg-slate-50 uppercase font-bold text-sm" 
                        value={student.fatherProfession} 
                        onChange={(e) => setStudent({...student, fatherProfession: e.target.value.toUpperCase()})} 
                    />
                    <input 
                        placeholder="NOM DE LA MÈRE" 
                        className="border p-3 rounded-xl bg-slate-50 uppercase font-bold text-sm" 
                        value={student.motherName} 
                        onChange={(e) => setStudent({...student, motherName: e.target.value.toUpperCase()})} 
                    />
                    <input 
                        placeholder="PROFESSION DE LA MÈRE" 
                        className="border p-3 rounded-xl bg-slate-50 uppercase font-bold text-sm" 
                        value={student.motherProfession} 
                        onChange={(e) => setStudent({...student, motherProfession: e.target.value.toUpperCase()})} 
                    />
                </div>
            </div>

            <button type="submit" className="w-full bg-blue-900 text-white font-black py-4 rounded-2xl shadow-xl uppercase tracking-widest text-xs hover:bg-blue-950 transition-all">
                {student.id ? "Sauvegarder les modifications" : "Finaliser l'enregistrement"}
            </button>
        </form>
    );
};

export default AddStudentForm;