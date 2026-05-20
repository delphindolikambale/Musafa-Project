package com.school.management.controller.academic;

import com.school.management.dto.academic.RoomRequestDTO;
import com.school.management.dto.academic.RoomResponseDTO;
import com.school.management.model.academic.Room;
import com.school.management.service.academic.RoomService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/rooms")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class RoomController {

    private final RoomService roomService;

    /**
     * Récupère les salles disponibles.
     * Si excludeClassroomId est fourni, inclut la salle actuellement occupée par cette classe (utile pour l'édition).
     */
    @GetMapping("/available")
    public ResponseEntity<List<RoomResponseDTO>> getAvailableRooms(
            @RequestParam(required = false) Long excludeClassroomId) {
        return ResponseEntity.ok(roomService.getAvailableRooms(excludeClassroomId));
    }

    /**
     * Récupère la liste de toutes les salles (actives et inactives).
     */
    @GetMapping
    public ResponseEntity<List<RoomResponseDTO>> getAllRooms() {
        return ResponseEntity.ok(roomService.getAll());
    }

    /**
     * Récupère uniquement les salles marquées comme actives.
     */
    @GetMapping("/active")
    public ResponseEntity<List<RoomResponseDTO>> getActiveRooms() {
        return ResponseEntity.ok(roomService.getAllActive());
    }

    /**
     * Récupère les détails d'une salle spécifique par son ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<RoomResponseDTO> getRoomById(@PathVariable Long id) {
        return ResponseEntity.ok(roomService.getById(id));
    }

    /**
     * Crée une nouvelle salle.
     * @Valid assure que les contraintes du DTO (NotNull, Size, etc.) sont respectées.
     */
    @PostMapping
    public ResponseEntity<RoomResponseDTO> createRoom(@Valid @RequestBody RoomRequestDTO request) {
        RoomResponseDTO createdRoom = roomService.create(request);
        return new ResponseEntity<>(createdRoom, HttpStatus.CREATED);
    }

    /**
     * Met à jour une salle existante.
     * Gère l'unicité du nom au sein du ServiceImpl.
     */
    @PutMapping("/{id}")
    public ResponseEntity<RoomResponseDTO> updateRoom(
            @PathVariable Long id,
            @Valid @RequestBody RoomRequestDTO request) {
        return ResponseEntity.ok(roomService.update(id, request));
    }

    /**
     * Alterne l'état (actif/inactif) d'une salle sans supprimer ses données.
     */
    @PatchMapping("/{id}/toggle-status")
    public ResponseEntity<Void> toggleRoomStatus(@PathVariable Long id) {
        roomService.toggleStatus(id);
        return ResponseEntity.ok().build();
    }

    /**
     * Supprime définitivement une salle.
     * Le ServiceImpl vérifiera si la salle est liée à une classe avant d'autoriser la suppression.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRoom(@PathVariable Long id) {
        roomService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
