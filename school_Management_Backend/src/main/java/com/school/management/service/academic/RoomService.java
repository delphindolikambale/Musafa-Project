package com.school.management.service.academic;

import com.school.management.dto.academic.RoomRequestDTO;
import com.school.management.dto.academic.RoomResponseDTO;

import java.util.List;

public interface RoomService {

    RoomResponseDTO create(RoomRequestDTO request);
    RoomResponseDTO update(Long id, RoomRequestDTO request);
    RoomResponseDTO getById(Long id);
    List<RoomResponseDTO> getAvailableRooms(Long excludeClassroomId);
    List<RoomResponseDTO> getAll();
    List<RoomResponseDTO> getAllActive();
    void delete(Long id);
    void toggleStatus(Long id);
}
