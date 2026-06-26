import React, { useState, useEffect } from 'react';
import SuperAdminSystemService from '../../../services/multitenantService/SuperAdminSystemService';

const Abonnement = () => {
    const [schools, setSchools] = useState([]);
    const [selectedSchool, setSelectedSchool] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    
    // État du formulaire de paiement d'abonnement
    const [formData, setFormData] = useState({
        endDate: '',
        amount: '',
        currency: 'USD',
        paymentMode: 'CASH',
        referenceNumber: '' // Géré localement au niveau de la vue (masqué en mode CASH)
    });

    // Stockage temporaire des données du reçu après succès pour impression immédiate
    const [receiptData, setReceiptData] = useState(null);

    useEffect(() => {
        fetchSchools();
    }, []);

    const fetchSchools = async () => {
        try {
            setLoading(true);
            const data = await SuperAdminSystemService.getAllSchools();
            setSchools(data);
        } catch (error) {
            setMessage({ type: 'error', text: 'Impossible de récupérer la liste des établissements.' });
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const openPaymentModal = (school) => {
        setSelectedSchool(school);
        setReceiptData(null);
        // Initialisation de la date de fin par défaut à +1 mois à partir d'aujourd'hui
        const defaultEndDate = new Date();
        defaultEndDate.setMonth(defaultEndDate.getMonth() + 1);
        
        setFormData({
            endDate: defaultEndDate.toISOString().split('T')[0],
            amount: '',
            currency: 'USD',
            paymentMode: 'CASH',
            referenceNumber: ''
        });
    };

    const handleProcessPayment = async (e) => {
        e.preventDefault();
        if (!selectedSchool) return;

        // Préparation stricte du payload attendu par le SystemAdminController du Backend
        const paymentPayload = {
            endDate: formData.endDate,
            amount: parseFloat(formData.amount),
            currency: formData.currency,
            paymentMode: formData.paymentMode // Envoyé pour de futures évolutions, bien que forcé dans le service
        };

        try {
            setLoading(true);
            setMessage({ type: '', text: '' });

            // Appel de l'API de validation financière
            const updatedSchool = await SuperAdminSystemService.collectSubscriptionPayment(selectedSchool.id, paymentPayload);
            
            // Stockage des informations nécessaires à l'impression immédiate du reçu
            setReceiptData({
                receiptNo: 'REC-' + Math.floor(100000 + Math.random() * 900000),
                schoolName: updatedSchool.name,
                schoolCode: updatedSchool.code,
                email: updatedSchool.contactEmail,
                amount: formData.amount,
                currency: formData.currency,
                paymentMode: formData.paymentMode,
                referenceNumber: formData.paymentMode !== 'CASH' ? formData.referenceNumber : 'AUTO_GENERATED_CASH',
                activationCode: updatedSchool.activationCode, // Clé générée par le backend
                date: new Date().toLocaleDateString('fr-FR')
            });

            setMessage({ 
                type: 'success', 
                text: `Paiement enregistré avec succès. Le code d'activation a été envoyé à ${updatedSchool.contactEmail}.` 
            });
            
            fetchSchools(); // Rafraîchir le tableau principal
        } catch (error) {
            setMessage({ type: 'error', text: error.error || 'Une erreur est survenue lors du traitement du paiement.' });
        } finally {
            setLoading(false);
        }
    };

    const triggerPrint = () => {
        window.print();
    };

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
            {/* SECTION STYLES POUR L'IMPRESSION PROPRE DU REÇU */}
            <style>{`
                @media print {
                    body * { display: none; }
                    .printable-receipt, .printable-receipt * { display: block; }
                    .printable-receipt { position: absolute; left: 0; top: 0; width: 100%; border: none; }
                    .no-print { display: none !important; }
                }
                .status-badge { padding: 4px 8px; border-radius: 4px; font-weight: bold; font-size: 12px; }
                .status-ACTIF { background-color: #d4edda; color: #155724; }
                .status-SUSPENDU { background-color: #f8d7da; color: #721c24; }
            `}</style>

            <div className="no-print">
                <h2>Gestion des Abonnements Établissements (Super Admin)</h2>
                <hr />

                {message.text && (
                    <div style={{ 
                        padding: '10px', 
                        marginBottom: '15px', 
                        borderRadius: '4px',
                        backgroundColor: message.type === 'success' ? '#d4edda' : '#f8d7da',
                        color: message.type === 'success' ? '#155724' : '#721c24'
                    }}>
                        {message.text}
                    </div>
                )}

                {/* TABLEAU DES ECOLES */}
                <table border="1" cellPadding="10" cellSpacing="0" style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '30px' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f2f2f2' }}>
                            <th>Code</th>
                            <th>Nom de l'école</th>
                            <th>Email de Contact</th>
                            <th>Expiration de Licence</th>
                            <th>Statut Actuel</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {schools.map((school) => (
                            <tr key={school.id}>
                                <td><strong>{school.code}</strong></td>
                                <td>{school.name}</td>
                                <td>{school.contactEmail}</td>
                                <td>{school.subscriptionEndDate ? new Date(school.subscriptionEndDate).toLocaleDateString('fr-FR') : 'Aucun paiement'}</td>
                                <td>
                                    <span className={`status-badge status-${school.currentSubscriptionStatus}`}>
                                        {school.currentSubscriptionStatus}
                                    </span>
                                </td>
                                <td>
                                    <button 
                                        onClick={() => openPaymentModal(school)}
                                        style={{ backgroundColor: '#007bff', color: 'white', border: 'none', padding: '6px 12px', cursor: 'pointer', borderRadius: '4px' }}
                                    >
                                        Enregistrer Paiement
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* MODAL / FORMULAIRE DE PAIEMENT D'ABONNEMENT */}
                {selectedSchool && (
                    <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px', backgroundColor: '#fafafa', maxWidth: '500px' }}>
                        <h3>Enregistrement Financier pour : <span style={{ color: '#007bff' }}>{selectedSchool.name}</span></h3>
                        
                        <form onSubmit={handleProcessPayment}>
                            <div style={{ marginBottom: '12px' }}>
                                <label style={{ display: 'block', marginBottom: '5px' }}>Date d'expiration ciblée :</label>
                                <input 
                                    type="date" 
                                    name="endDate" 
                                    required
                                    value={formData.endDate} 
                                    onChange={handleInputChange}
                                    style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                                />
                            </div>

                            <div style={{ marginBottom: '12px' }}>
                                <label style={{ display: 'block', marginBottom: '5px' }}>Montant perçu :</label>
                                <input 
                                    type="number" 
                                    name="amount" 
                                    step="0.01"
                                    required
                                    placeholder="Ex: 150.00"
                                    value={formData.amount} 
                                    onChange={handleInputChange}
                                    style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                                />
                            </div>

                            <div style={{ marginBottom: '12px' }}>
                                <label style={{ display: 'block', marginBottom: '5px' }}>Devise :</label>
                                <select 
                                    name="currency" 
                                    value={formData.currency} 
                                    onChange={handleInputChange}
                                    style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                                >
                                    <option value="USD">USD - Dollar Américain</option>
                                    <option value="CDF">CDF - Franc Congolais</option>
                                </select>
                            </div>

                            <div style={{ marginBottom: '12px' }}>
                                <label style={{ display: 'block', marginBottom: '5px' }}>Mode de paiement :</label>
                                <select 
                                    name="paymentMode" 
                                    value={formData.paymentMode} 
                                    onChange={handleInputChange}
                                    style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                                >
                                    <option value="CASH">CASH (Génération reçu auto)</option>
                                    <option value="AIRTEL_MONEY">Airtel Money</option>
                                    <option value="MPESA">M-Pesa</option>
                                    <option value="ORANGE_MONEY">Orange Money</option>
                                    <option value="CARTE_BANCAIRE">Carte Bancaire</option>
                                </select>
                            </div>

                            {/* LIEN LOGIQUE STRICT : Le champ n'apparaît que si le mode n'est pas CASH */}
                            {formData.paymentMode !== 'CASH' && (
                                <div style={{ marginBottom: '12px', padding: '10px', backgroundColor: '#fff3cd', border: '1px solid #ffeeba', borderRadius: '4px' }}>
                                    <label style={{ display: 'block', marginBottom: '5px', color: '#856404', fontWeight: 'bold' }}>
                                        Référence de transaction Opérateur Mobile / Banque :
                                    </label>
                                    <input 
                                        type="text" 
                                        name="referenceNumber" 
                                        required
                                        placeholder="Ex: TX-90872A"
                                        value={formData.referenceNumber} 
                                        onChange={handleInputChange}
                                        style={{ width: '100%', padding: '8px', boxSizing: 'border-box', border: '1px solid #dc3545' }}
                                    />
                                </div>
                            )}

                            <div style={{ marginTop: '20px' }}>
                                <button 
                                    type="submit" 
                                    disabled={loading}
                                    style={{ backgroundColor: '#28a745', color: 'white', border: 'none', padding: '10px 20px', cursor: 'pointer', borderRadius: '4px', marginRight: '10px' }}
                                >
                                    {loading ? 'Traitement en cours...' : 'Valider le Paiement & Générer la Clé'}
                                </button>
                                <button 
                                    type="button" 
                                    onClick={() => setSelectedSchool(null)}
                                    style={{ backgroundColor: '#6c757d', color: 'white', border: 'none', padding: '10px 15px', cursor: 'pointer', borderRadius: '4px' }}
                                >
                                    Annuler
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>

            {/* BLOCK DE REÇU UNIQUE DE LICENCE IMPRIMABLE (VISIBLE À L'ÉCRAN APRÈS VALIDATION OU À L'IMPRESSION) */}
            {receiptData && (
                <div className="printable-receipt" style={{ 
                    marginTop: '30px', 
                    padding: '25px', 
                    border: '2px dashed #333', 
                    backgroundColor: '#fff', 
                    maxWidth: '600px',
                    borderRadius: '4px'
                }}>
                    <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                        <h2>REÇU OFFICIEL DE CONFIGURATION DE LICENCE SAAS</h2>
                        <p style={{ fontSize: '14px', color: '#666' }}>Numéro de reçu : <strong>{receiptData.receiptNo}</strong></p>
                        <p>Date d'émission : {receiptData.date}</p>
                    </div>
                    <hr />
                    <div style={{ margin: '15px 0', lineHeight: '1.6' }}>
                        <p><strong>Établissement Bénéficiaire :</strong> {receiptData.schoolName} ({receiptData.schoolCode})</p>
                        <p><strong>Email Administrateur :</strong> {receiptData.email}</p>
                        <p><strong>Mode de Règlement :</strong> {receiptData.paymentMode}</p>
                        <p><strong>Règlement Référence :</strong> {receiptData.referenceNumber}</p>
                        <p style={{ fontSize: '18px' }}><strong>Montant Payé :</strong> <span style={{ color: '#28a745', fontWeight: 'bold' }}>{receiptData.amount} {receiptData.currency}</span></p>
                    </div>
                    <hr />
                    <div style={{ 
                        backgroundColor: '#e2e3e5', 
                        padding: '15px', 
                        textAlign: 'center', 
                        borderRadius: '4px', 
                        margin: '20px 0',
                        border: '1px solid #d6d8db'
                    }}>
                        <h4 style={{ margin: '0 0 5px 0', color: '#383d41' }}>CLÉ SECRÈTE D'ACTIVATION DU SYSTÈME D'ÉCOLE</h4>
                        <p style={{ fontFamily: 'monospace', fontSize: '22px', fontWeight: 'bold', letterSpacing: '2px', margin: '5px 0', color: '#1b1e21' }}>
                            {receiptData.activationCode}
                        </p>
                        <small style={{ color: '#6c757d' }}>Ce code est à introduire sur la page d'activation de l'école pour débloquer les accès.</small>
                    </div>
                    <div style={{ fontSize: '11px', textAlign: 'center', color: '#777', marginTop: '20px' }}>
                        Document généré automatiquement. Une copie conforme de cette clé de licence unique a été transmise à l'adresse e-mail de l'administration scolaire.
                    </div>
                    
                    <button 
                        onClick={triggerPrint} 
                        className="no-print"
                        style={{ 
                            marginTop: '15px', 
                            backgroundColor: '#17a2b8', 
                            color: 'white', 
                            border: 'none', 
                            padding: '10px 15px', 
                            cursor: 'pointer', 
                            borderRadius: '4px',
                            width: '100%' 
                        }}
                    >
                        🖨️ Lancer l'Impression Physique du Reçu
                    </button>
                </div>
            )}
        </div>
    );
};

export default Abonnement;