package com.school.management.service.academicImpl;

import com.school.management.dto.academic.RoomRequestDTO;
import com.school.management.dto.academic.RoomResponseDTO;
import com.school.management.model.academic.Room;
import com.school.management.repository.academic.RoomRepository;
import com.school.management.service.academic.RoomService;
import com.school.management.security.services.UserDetailsImpl; // ✅ AJOUT
import org.springframework.security.core.context.SecurityContextHolder; // ✅ AJOUT
import org.springframework.security.access.AccessDeniedException; // ✅ AJOUT
import org.modelmapper.ModelMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RoomServiceImpl implements RoomService {

    private final RoomRepository roomRepository;
    private final ModelMapper modelMapper;

    /**
     * ✅ EXTRACTION DU CONTEXTE MUTLI-TENANT SECURISÉ
     */
    private UserDetailsImpl getCurrentUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof String) {
            throw new AccessDeniedException("❌ Session invalide ou expirée.");
        }
        return (UserDetailsImpl) principal;
    }

    private Long getCurrentSchoolId() {
        if (getCurrentUser().getSchool() == null) {
            throw new IllegalStateException("L'utilisateur actuel n'est relié à aucun établissement.");
        }
        return getCurrentUser().getSchool().getId();
    }

    @Override
    @Transactional
    public RoomResponseDTO create(RoomRequestDTO request) {
        // 1. Nettoyage du nom et vérification d'unicité au sein de l'école (insensible à la casse)
        String cleanName = request.getName().trim();
        if (roomRepository.existsByNameIgnoreCaseAndSchoolId(cleanName, getCurrentSchoolId())) {
            throw new RuntimeException("Une salle nommée '" + cleanName + "' existe déjà dans votre établissement.");
        }

        // 2. Mapping et configuration manuelle pour assurer la propreté
        Room room = modelMapper.map(request, Room.class);
        room.setName(cleanName);
        room.setActive(true); // Par défaut active à la création
        room.setSchool(getCurrentUser().getSchool()); // ✅ MULTI-TENANT : Attribution de l'école courante

        // 3. Sauvegarde
        Room savedRoom = roomRepository.save(room);

        return modelMapper.map(savedRoom, RoomResponseDTO.class);
    }

    @Override
    @Transactional(readOnly = true)
    public List<RoomResponseDTO> getAvailableRooms(Long excludeClassroomId) {
        List<Room> rooms;
        // Point d'entrée pour filtrer les salles déjà occupées au sein de l'établissement courant
        if (excludeClassroomId != null) {
            rooms = roomRepository.findAvailableRoomsForEdit(excludeClassroomId, getCurrentSchoolId());
        } else {
            rooms = roomRepository.findAvailableRooms(getCurrentSchoolId());
        }
        return rooms.stream()
                .map(room -> modelMapper.map(room, RoomResponseDTO.class))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public RoomResponseDTO update(Long id, RoomRequestDTO request) {
        // 1. Vérifier si la salle existe
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Salle introuvable avec l'ID : " + id));

        // ✅ SÉCURITÉ MULTI-TENANT : Vérifier l'appartenance de la salle cible
        if (!room.getSchool().getId().equals(getCurrentSchoolId())) {
            throw new AccessDeniedException("❌ Modification interdite : Cette salle appartient à une autre infrastructure.");
        }

        // 2. Vérifier si le nouveau nom n'est pas pris par une AUTRE salle de l'établissement
        String newName = request.getName().trim();
        if (roomRepository.existsByNameIgnoreCaseAndIdNotAndSchoolId(newName, id, getCurrentSchoolId())) {
            throw new RuntimeException("Le nom '" + newName + "' est déjà utilisé par une autre salle de votre établissement.");
        }

        // 3. Mise à jour manuelle pour plus de contrôle
        room.setName(newName);
        room.setCapacity(request.getCapacity());
        room.setBuilding(request.getBuilding());
        room.setActive(request.isActive());

        return modelMapper.map(roomRepository.save(room), RoomResponseDTO.class);
    }

    @Override
    @Transactional(readOnly = true)
    public RoomResponseDTO getById(Long id) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Salle introuvable."));

        // ✅ SÉCURITÉ MULTI-TENANT
        if (!room.getSchool().getId().equals(getCurrentSchoolId())) {
            throw new AccessDeniedException("❌ Accès refusé : Impossible de consulter les données transverses.");
        }

        return modelMapper.map(room, RoomResponseDTO.class);
    }

    @Override
    @Transactional(readOnly = true)
    public List<RoomResponseDTO> getAll() {
        // ✅ MULTI-TENANT : Filtrage local des salles
        return roomRepository.findBySchoolId(getCurrentSchoolId()).stream()
                .map(room -> modelMapper.map(room, RoomResponseDTO.class))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<RoomResponseDTO> getAllActive() {
        // ✅ MULTI-TENANT : Filtrage local des salles actives
        return roomRepository.findByActiveTrueAndSchoolId(getCurrentSchoolId()).stream()
                .map(room -> modelMapper.map(room, RoomResponseDTO.class))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void delete(Long id) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Impossible de supprimer : Salle introuvable."));

        // ✅ SÉCURITÉ MULTI-TENANT
        if (!room.getSchool().getId().equals(getCurrentSchoolId())) {
            throw new AccessDeniedException("❌ Suppression refusée : Droits d'accès insuffisants.");
        }

        // Vérification de l'usage avant suppression pour protéger les classes existantes
        try {
            roomRepository.delete(room);
        } catch (Exception e) {
            // Capturé si une contrainte d'intégrité (Foreign Key) est violée dans la DB
            throw new RuntimeException("Cette salle ne peut pas être supprimée car elle est actuellement occupée par une classe.");
        }
    }

    @Override
    @Transactional
    public void toggleStatus(Long id) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Salle introuvable."));

        // ✅ SÉCURITÉ MULTI-TENANT
        if (!room.getSchool().getId().equals(getCurrentSchoolId())) {
            throw new AccessDeniedException("❌ Action interdite : Ressource hors scope.");
        }

        room.setActive(!room.isActive());
        roomRepository.save(room);
    }
}