import React from 'react';
import { X, Save, Loader2, Calendar } from 'lucide-react';

const EvaluationCarnetAdd = ({ isOpen, onClose, evalForm, setEvalForm, onSave, isSaving, period }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-scale-in border border-slate-200">
                <div className="bg-slate-50 border-b border-slate-200 p-5 flex items-center justify-between">
                    <h3 className="font-black text-slate-800 uppercase tracking-widest text-sm">
                        {evalForm.id ? "Modifier la Colonne" : "Nouvelle Colonne"}
                    </h3>
                    <button 
                        onClick={onClose} 
                        className="p-2 bg-white hover:bg-slate-200 text-slate-500 rounded-xl transition-all"
                    >
                        <X size={18} />
                    </button>
                </div>
                <form onSubmit={onSave} className="p-6 space-y-5">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
                                Type d'évaluation
                            </label>
                            <select
                                required
                                value={evalForm.type}
                                onChange={(e) => setEvalForm({...evalForm, type: e.target.value})}
                                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all cursor-pointer appearance-none"
                            >
                                <option value="IE">I.E (Interrogation Écrite)</option>
                                <option value="IO">I.O (Interrogation Orale)</option>
                                <option value="DEV">DEV (Devoir)</option>
                                <option value="CC">C.C (Contrôle Continu)</option>
                                {/* L'option EXAMEN n'apparaît que pour les Périodes 2 et 4 */}
                                {(period === 2 || period === 4) && <option value="EXAMEN">EXAMEN</option>}
                            </select>
                        </div>
                        
                        <div>
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
                                Points Maximum
                            </label>
                            <input
                                type="number"
                                required
                                min="0.5"
                                step="0.5"
                                value={evalForm.maxPoints}
                                onChange={(e) => setEvalForm({...evalForm, maxPoints: e.target.value})}
                                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
                                placeholder="Ex: 10"
                            />
                        </div>

                        <div>
                            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
                                Date de l'évaluation
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Calendar size={16} className="text-slate-400" />
                                </div>
                                <input
                                    type="date"
                                    required
                                    value={evalForm.date}
                                    onChange={(e) => setEvalForm({...evalForm, date: e.target.value})}
                                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-3 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all cursor-pointer"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="w-full py-3.5 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white shadow-lg transition-all duration-200 active:scale-[0.98] disabled:opacity-50"
                        >
                            {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                            Valider
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EvaluationCarnetAdd;