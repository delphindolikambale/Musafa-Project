import api from '../api';

const BulletinHeaderService = {
    /**
     * Récupère la configuration actuelle de l'en-tête du bulletin
     */
    getHeader: async () => {
        const response = await api.get('/bulletin-headers');
        return response.data;
    },

    /**
     * Sauvegarde ou met à jour la configuration de l'en-tête
     * @param {Object} data - Les données textes (pays, ministère, etc.)
     * @param {File} flagImage - Fichier image du drapeau
     * @param {File} ministryLogo - Fichier image du logo du ministère
     * @param {File} watermarkLogo - Fichier image du filigrane
     */
    saveOrUpdateHeader: async (data, flagImage, ministryLogo, watermarkLogo) => {
        const formData = new FormData();
        
        // Ajout de l'objet JSON (Stringifié car Spring Boot l'attend via @RequestPart)
        formData.append('headerData', new Blob([JSON.stringify(data)], {
            type: "application/json"
        }));

        // Ajout des fichiers physiques s'ils existent
        if (flagImage) formData.append('flagImage', flagImage);
        if (ministryLogo) formData.append('ministryLogo', ministryLogo);
        if (watermarkLogo) formData.append('watermarkLogo', watermarkLogo);

        // CORRECTION MAJEURE ICI :
        // On supprime délibérément l'en-tête Content-Type pour qu'Axios et le navigateur 
        // génèrent automatiquement le leur avec le "boundary" requis par Spring Boot.
        const response = await api.post('/bulletin-headers', formData, {
            transformRequest: [(data, headers) => {
                delete headers['Content-Type'];
                delete headers.common['Content-Type'];
                return data;
            }]
        });
        
        return response.data;
    }
};

export default BulletinHeaderService;