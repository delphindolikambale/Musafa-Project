import api from '../api';

const BulletinHeaderService = {
    /**
     * Récupère la configuration de l'en-tête du bulletin.
     * Mappe le comportement 200 OK / 204 No Content du BulletinHeaderController.java
     */
    getHeader: async () => {
        try {
            const response = await api.get('/bulletin-headers');
            if (response.status === 204 || !response.data) {
                return null;
            }
            return response.data?.data || response.data;
        } catch (error) {
            console.error("Erreur lors du chargement de l'en-tête du bulletin :", error);
            throw error;
        }
    },

    /**
     * Sauvegarde ou met à jour l'en-tête via FormMultipart avec Blob JSON 'headerData'
     * Correspond exactement à la signature de BulletinHeaderController.java
     */
    saveOrUpdateHeader: async (data, flagImage, ministryLogo, watermarkLogo) => {
        const formData = new FormData();
        
        // Envoi du JSON sous la clé 'headerData' réclamée par @RequestPart("headerData")
        formData.append('headerData', new Blob([JSON.stringify(data)], {
            type: "application/json"
        }));

        if (flagImage) formData.append('flagImage', flagImage);
        if (ministryLogo) formData.append('ministryLogo', ministryLogo);
        if (watermarkLogo) formData.append('watermarkLogo', watermarkLogo);

        const response = await api.post('/bulletin-headers', formData, {
            transformRequest: [(data, headers) => {
                delete headers['Content-Type'];
                delete headers.common['Content-Type'];
                return data;
            }]
        });
        
        return response.data?.data || response.data;
    }
};

export default BulletinHeaderService;