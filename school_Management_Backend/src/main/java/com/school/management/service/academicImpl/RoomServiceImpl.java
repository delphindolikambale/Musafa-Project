package com.school.management.service.academicImpl;

import com.school.management.dto.academic.RoomRequestDTO;
import com.school.management.dto.academic.RoomResponseDTO;
import com.school.management.model.academic.Room;
import com.school.management.repository.academic.RoomRepository;
import com.school.management.service.academic.RoomService;
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

    @Override
    @Transactional
    public RoomResponseDTO create(RoomRequestDTO request) {
        // 1. Nettoyage du nom et vérification d'unicité (insensible à la casse)
        String cleanName = request.getName().trim();
        if (roomRepository.existsByNameIgnoreCase(cleanName)) {
            throw new RuntimeException("Une salle nommée '" + cleanName + "' existe déjà.");
        }

        // 2. Mapping et configuration manuelle pour assurer la propreté
        Room room = modelMapper.map(request, Room.class);
        room.setName(cleanName);
        room.setActive(true); // Par défaut active à la création

        // 3. Sauvegarde
        Room savedRoom = roomRepository.save(room);

        return modelMapper.map(savedRoom, RoomResponseDTO.class);
    }

    @Override
    @Transactional(readOnly = true)
    public List<RoomResponseDTO> getAvailableRooms(Long excludeClassroomId) {
        List<Room> rooms;
        // Point d'entrée pour filtrer les salles déjà occupées
        if (excludeClassroomId != null) {
            rooms = roomRepository.findAvailableRoomsForEdit(excludeClassroomId);
        } else {
            rooms = roomRepository.findAvailableRooms();
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

        // 2. Vérifier si le nouveau nom n'est pas pris par une AUTRE salle
        String newName = request.getName().trim();
        if (roomRepository.existsByNameIgnoreCaseAndIdNot(newName, id)) {
            throw new RuntimeException("Le nom '" + newName + "' est déjà utilisé par une autre salle.");
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
        return modelMapper.map(room, RoomResponseDTO.class);
    }

    @Override
    @Transactional(readOnly = true)
    public List<RoomResponseDTO> getAll() {
        return roomRepository.findAll().stream()
                .map(room -> modelMapper.map(room, RoomResponseDTO.class))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<RoomResponseDTO> getAllActive() {
        return roomRepository.findByActiveTrue().stream()
                .map(room -> modelMapper.map(room, RoomResponseDTO.class))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void delete(Long id) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Impossible de supprimer : Salle introuvable."));

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

        room.setActive(!room.isActive());
        roomRepository.save(room);
    }
}
