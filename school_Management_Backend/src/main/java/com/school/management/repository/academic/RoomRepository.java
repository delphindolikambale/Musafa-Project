package com.school.management.repository.academic;

import com.school.management.model.academic.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface RoomRepository extends JpaRepository<Room, Long> {

    // ✅ ADAPTATION MULTI-TENANT : Vérifications d'existences cloisonnées par école
    boolean existsByNameIgnoreCaseAndSchoolId(String name, Long schoolId);

    boolean existsByNameIgnoreCaseAndIdNotAndSchoolId(String name, Long id, Long schoolId);

    List<Room> findBySchoolId(Long schoolId);

    List<Room> findByActiveTrueAndSchoolId(Long schoolId);

    List<Room> findByBuildingContainingIgnoreCaseAndSchoolId(String building, Long schoolId);

    // ✅ SÉCURISATION DES REQUÊTES COMPOSÉES : Filtrage sur le scope de l'établissement courant
    @Query("SELECT r FROM Room r WHERE r.school.id = :schoolId AND r.id NOT IN (SELECT c.room.id FROM Classroom c WHERE c.room IS NOT NULL AND c.school.id = :schoolId)")
    List<Room> findAvailableRooms(@Param("schoolId") Long schoolId);

    @Query("SELECT r FROM Room r WHERE r.school.id = :schoolId AND r.id NOT IN (SELECT c.room.id FROM Classroom c WHERE c.room IS NOT NULL AND c.id <> :classroomId AND c.school.id = :schoolId)")
    List<Room> findAvailableRoomsForEdit(@Param("classroomId") Long classroomId, @Param("schoolId") Long schoolId);
}