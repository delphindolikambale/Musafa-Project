package com.school.management.service.academicImpl;

import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class NotificationSseService {

    // Structure de stockage : Map<schoolId_teacherId, SseEmitter>
    private final Map<String, SseEmitter> emitters = new ConcurrentHashMap<>();

    private String buildKey(Long schoolId, Long teacherId) {
        return schoolId + "_" + teacherId;
    }

    public SseEmitter registerTeacher(Long schoolId, Long teacherId) {
        SseEmitter emitter = new SseEmitter(Long.MAX_VALUE);
        String key = buildKey(schoolId, teacherId);

        this.emitters.put(key, emitter);

        emitter.onCompletion(() -> this.emitters.remove(key));
        emitter.onTimeout(() -> this.emitters.remove(key));
        emitter.onError((e) -> this.emitters.remove(key));

        // Envoi d'un commentaire initial (Handshake) pour valider immédiatement la connexion
        // et éviter que les navigateurs ou proxys coupent le flux SSE par inactivité.
        try {
            emitter.send(SseEmitter.event()
                    .comment("connection_established"));
        } catch (IOException e) {
            this.emitters.remove(key);
        }

        return emitter;
    }

    public void sendNotificationToTeacher(Long schoolId, Long teacherId, Object payload) {
        String key = buildKey(schoolId, teacherId);
        SseEmitter emitter = this.emitters.get(key);

        if (emitter != null) {
            try {
                // CORRECTION CRUCIALE : Suppression de .name("BULLETIN_RECEIVED")
                // En ne spécifiant pas de nom d'événement personnalisé, le flux est envoyé comme
                // un message standard. Cela permet à React de le capter directement via 'eventSource.onmessage'.
                emitter.send(SseEmitter.event()
                        .data(payload));
            } catch (IOException e) {
                this.emitters.remove(key);
            }
        }
    }
}