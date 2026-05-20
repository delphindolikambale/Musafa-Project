import React, { useState } from "react";
import FeesStructure from "./FeesStructure";
import PricingConfig from "./PricingConfig";

const FinanceAdmin = () => {
    const [activeTab, setActiveTab] = useState("structure");

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800">Administration Financière</h1>
                <p className="text-gray-500">Gérez la structure des frais et les tarifs de l'établissement.</p>
            </div>

            {/* Menu Onglets */}
            <div className="flex border-b border-gray-200 mb-6">
                <button
                    onClick={() => setActiveTab("structure")}
                    className={`py-2 px-4 font-medium ${activeTab === "structure" 
                        ? "border-b-2 border-blue-600 text-blue-600" 
                        : "text-gray-500 hover:text-gray-700"}`}
                >
                    Structure des Frais
                </button>
                <button
                    onClick={() => setActiveTab("pricing")}
                    className={`py-2 px-4 font-medium ${activeTab === "pricing" 
                        ? "border-b-2 border-blue-600 text-blue-600" 
                        : "text-gray-500 hover:text-gray-700"}`}
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