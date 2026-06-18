import React, { useState } from "react";
import FeesStructure from "./FeesStructure";
import PricingConfig from "./PricingConfig";

const FinanceAdmin = () => {
    const [activeTab, setActiveTab] = useState("structure");

    return (
        <div className="p-6 bg-slate-50 dark:bg-slate-900 min-h-screen transition-colors duration-300">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-slate-100">Administration Financière</h1>
                <p className="text-gray-500 dark:text-slate-400">Gérez la structure des frais et les tarifs de l'établissement.</p>
            </div>

            {/* Menu Onglets */}
            <div className="flex border-b border-gray-200 dark:border-slate-700 mb-6">
                <button
                    onClick={() => setActiveTab("structure")}
                    className={`py-2 px-4 font-medium transition-colors ${activeTab === "structure" 
                        ? "border-b-2 border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400" 
                        : "text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200"}`}
                >
                    Structure des Frais
                </button>
                <button
                    onClick={() => setActiveTab("pricing")}
                    className={`py-2 px-4 font-medium transition-colors ${activeTab === "pricing" 
                        ? "border-b-2 border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400" 
                        : "text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200"}`}
                >
                    Configuration des Prix
                </button>
            </div>

            {/* Contenu dynamique */}
            <div className="mt-4">
                {activeTab === "structure" ? <FeesStructure /> : <PricingConfig />}
            </div>
        </div>
    );
};

export default FinanceAdmin;