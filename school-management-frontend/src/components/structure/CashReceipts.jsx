import React, { useState } from 'react';
import CashReceiptDashboard from '../dashboard/CashReceiptDashboard';
import CashReceiptReports from './CashReceiptReports';
import CashBookDashboard from '../dashboard/CashBookDashboard'; // Assurez-vous que le chemin est correct
import DetailsCashTransaction from '../structure/DetailsCashTransaction'; // IMPORT DE LA NOUVELLE INTERFACE

const CashReceipts = () => {
    // Vues possibles : 'DASHBOARD', 'REPORT', 'CASHBOOK', 'DETAILS'
    const [currentView, setCurrentView] = useState('DASHBOARD');
    const [reportCriteria, setReportCriteria] = useState(null);

    // Navigation vers les rapports A4
    const handleNavigateToReport = (criteria) => {
        setReportCriteria(criteria);
        setCurrentView('REPORT');
    };

    // Navigation vers le Livre de Caisse
    const handleNavigateToCashBook = () => {
        setCurrentView('CASHBOOK');
    };

    // CORRECTION : Navigation vers les Détails de Transactions
    const handleNavigateToDetails = () => {
        setCurrentView('DETAILS');
    };

    // Retour au Dashboard principal
    const handleBackToDashboard = () => {
        setReportCriteria(null);
        setCurrentView('DASHBOARD');
    };

    return (
        <div className="w-full min-h-screen bg-white overflow-x-hidden print:bg-white">
            <div className="px-4 pb-4 pt-0 md:px-8 md:pb-8 md:pt-0">
                {currentView === 'REPORT' && reportCriteria && (
                    <CashReceiptReports 
                        reportCriteria={reportCriteria} 
                        onBack={handleBackToDashboard} 
                    />
                )}

                {currentView === 'CASHBOOK' && (
                    <CashBookDashboard 
                        onBack={handleBackToDashboard} 
                        onNavigateToDetails={handleNavigateToDetails} // CORRECTION : Transmission de la prop
                    />
                )}

                {/* CORRECTION : Affichage de la nouvelle interface Détails */}
                {currentView === 'DETAILS' && (
                    <DetailsCashTransaction 
                        onBack={handleNavigateToCashBook} // Le retour renvoie vers le Livre de Caisse
                    />
                )}

                {currentView === 'DASHBOARD' && (
                    <CashReceiptDashboard 
                        onNavigateToReport={handleNavigateToReport} 
                        onNavigateToCashBook={handleNavigateToCashBook}
                    />
                )}
            </div>
        </div>
    );
};

export default CashReceipts;