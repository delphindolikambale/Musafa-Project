import axios from 'axios';

const API_BASE_URL = "http://localhost:8080/api"; 

export const RecouvrementFraisService = {
    /**
     * Récupère la liste de toutes les classes pour le ComboBox
     */
    getClassrooms: async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/classrooms`, {
                withCredentials: true
            });
            return response.data;
        } catch (error) {
            console.error("Erreur lors de la récupération des classes:", error);
            return [];
        }
    },

    /**
     * Récupère tous les profils financiers d'une classe et filtre selon la tranche.
     */
    getSituationRecouvrement: async (classId, trancheValue) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/v1/annual-profiles/classroom/${classId}`, {
                withCredentials: true
            });

            const profilesData = response.data;
            let availableInstallments = [];

            if (profilesData && profilesData.length > 0) {
                const firstProfile = profilesData[0];
                if (firstProfile.installments && firstProfile.installments.length > 0) {
                    const sortedInstallments = [...firstProfile.installments].sort((a, b) => a.installmentNumber - b.installmentNumber);
                    availableInstallments = sortedInstallments.map(inst => ({
                        value: inst.installmentNumber.toString(),
                        label: `Tranche ${inst.installmentNumber} (${inst.amount} ${firstProfile.currency})`
                    }));
                }
            }

            const formattedProfiles = profilesData.map(profile => {
                let expected = 0;
                let paid = 0;
                let status = "Non Payé";

                if (trancheValue === 'solde') {
                    expected = profile.totalAmountDue;
                    paid = profile.totalAmountPaid;
                } else {
                    const trancheNumber = parseInt(trancheValue);
                    const targetInstallment = profile.installments.find(
                        inst => inst.installmentNumber === trancheNumber
                    );

                    if (targetInstallment) {
                        expected = targetInstallment.amount;
                        paid = targetInstallment.amountPaid;
                        status = targetInstallment.status;
                    }
                }

                const uiStatus = trancheValue === 'solde' 
                    ? (paid >= expected ? "Payé" : (paid > 0 ? "Partiel" : "Non Payé"))
                    : (status === "PAYÉ" ? "Payé" : (status === "PARTIEL" ? "Partiel" : "Non Payé"));

                return {
                    id: profile.id,
                    nom: profile.studentFullName.split(' ')[0], 
                    postnom: profile.studentFullName.split(' ').slice(1).join(' '),
                    expected: expected,
                    paid: paid,
                    remaining: expected - paid,
                    status: uiStatus,
                    currency: profile.currency // On passe la devise réelle du profil
                };
            });

            return {
                profiles: formattedProfiles,
                installments: availableInstallments
            };

        } catch (error) {
            console.error("Erreur API Recouvrement:", error);
            throw error;
        }
    }
};