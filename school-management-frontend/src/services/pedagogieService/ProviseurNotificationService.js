import { toast } from 'react-hot-toast';
// L'import remonte de pedagogieService vers le dossier parent services
import { websocketService } from '../websocketService'; 

class ProviseurNotificationService {
    constructor() {
        // Utilisation d'un son d'alerte clair et fort
        this.alertSound = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
        this.alertSound.volume = 1.0; 
        
        // Liaison du contexte pour éviter la perte du 'this' dans le callback STOMP
        this.handleMessageReceived = this.handleMessageReceived.bind(this);
    }

    startListening() {
        console.log("Service de notification du Proviseur activé.");
        websocketService.connect(this.handleMessageReceived);
    }

    stopListening() {
        console.log("Service de notification du Proviseur désactivé.");
        websocketService.disconnect(this.handleMessageReceived);
    }

    handleMessageReceived(message) {
        // Validation stricte du type de payload reçu du backend
        if (message && message.type === 'NEW_GRADE_SHEET') {
            console.log("Notification de fiche de notes reçue :", message);
            const formattedAlert = `Fiche de notes reçue : ${message.subjectName} (${message.classroomName}) - Période ${message.period}. Soumise par M./Mme ${message.teacherName}.`;
            this.triggerAlert(formattedAlert);
        }
    }

    triggerAlert(message) {
        // Tentative de lecture audio (peut être bloquée si le proviseur n'a pas cliqué sur la page)
        const playPromise = this.alertSound.play();
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                console.log("L'Audio en Auto-play a été bloqué par le navigateur. Un clic utilisateur est requis sur la page.", error);
            });
        }
        
        // Affichage Toast (visuel)
        toast(message, {
            duration: 15000, // 15 secondes
            icon: '🔔',
            style: {
                background: '#1e293b', 
                color: '#fff',
                fontWeight: '900',
                fontSize: '15px',
                border: '2px solid #3b82f6', 
                padding: '16px'
            },
        });
    }
}

export default new ProviseurNotificationService();