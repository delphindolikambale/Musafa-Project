import { toast } from 'react-hot-toast';

class ProviseurNotificationService {
    constructor() {
        this.pollingInterval = null;
        // Utilisation d'un son d'alerte clair et fort. Vous pouvez remplacer l'URL par un fichier local '/sounds/alert.mp3'
        this.alertSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
        this.alertSound.volume = 1.0; // Volume maximum
    }

    startListening() {
        // Simulation d'une écoute en temps réel (Polling ou WebSocket)
        // À remplacer par votre vraie logique WebSocket ou Polling API vers le backend
        console.log("Service de notification du Proviseur activé.");
        
        /* // Exemple de Polling (décommentez et adaptez selon votre endpoint Backend)
        this.pollingInterval = setInterval(async () => {
            try {
                // const response = await axios.get('/api/v1/grade-sheets/pending/count');
                // if (response.data.hasNew) {
                //     this.triggerAlert("Une nouvelle Fiche de Notes vient d'être soumise pour validation !");
                // }
            } catch (error) {
                console.error("Erreur de synchronisation des notifications", error);
            }
        }, 30000); // Vérifie toutes les 30 secondes
        */
    }

    stopListening() {
        if (this.pollingInterval) {
            clearInterval(this.pollingInterval);
        }
        console.log("Service de notification du Proviseur désactivé.");
    }

    // Méthode pour déclencher l'alerte sonore et visuelle
    triggerAlert(message) {
        // Joue le son très fort
        this.alertSound.play().catch(e => console.log("La lecture audio a été bloquée par le navigateur:", e));
        
        // Affiche la notification visuelle persistante
        toast(message, {
            duration: 10000, // Reste affiché 10 secondes
            icon: '🔔',
            style: {
                background: '#1e293b', // ardoise sombre
                color: '#fff',
                fontWeight: '900',
                fontSize: '15px',
                border: '2px solid #3b82f6', // bordure bleue
                padding: '16px'
            },
        });
    }
}

export default new ProviseurNotificationService();