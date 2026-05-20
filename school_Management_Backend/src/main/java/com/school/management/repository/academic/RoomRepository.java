package com.school.management.repository.academic;

import com.school.management.model.academic.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository

public interface RoomRepository extends JpaRepository<Room, Long> {

    // ✅ Vérification stricte sans tenir compte des majuscules/minuscules
    boolean existsByNameIgnoreCase(String name);

    // ✅ Utile pour la modification : existe-t-il une AUTRE salle avec ce nom ?
    boolean existsByNameIgnoreCaseAndIdNot(String name, Long id);

    List<Room> findByActiveTrue();

    List<Room> findByBuildingContainingIgnoreCase(String building);

    @Query("SELECT r FROM Room r WHERE r.id NOT IN (SELECT c.room.id FROM Classroom c WHERE c.room IS NOT NULL)")
    List<Room> findAvailableRooms();

    @Query("SELECT r FROM Room r WHERE r.id NOT IN (SELECT c.room.id FROM Classroom c WHERE c.room IS NOT NULL AND c.id <> :classroomId)")
    List<Room> findAvailableRoomsForEdit(@Param("classroomId") Long classroomId);
}