package com.school.management.controller.academic;

import com.school.management.model.academic.Student;
import com.school.management.model.enums.StudentStatus;
import com.school.management.service.academic.StudentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/students")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class StudentController {

    private final StudentService studentService;

    public StudentController(StudentService studentService) {
        this.studentService = studentService;
    }

    @PostMapping
    public ResponseEntity<Student> createStudent(@RequestBody Student student) {
        return ResponseEntity.status(HttpStatus.CREATED).body(studentService.createStudent(student));
    }

    @GetMapping
    public ResponseEntity<List<Student>> getAllStudents() {
        return ResponseEntity.ok(studentService.getAllStudents());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Student> getStudentById(@PathVariable Long id) {
        return ResponseEntity.ok(studentService.getStudentById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Student> updateStudent(@PathVariable Long id, @RequestBody Student student) {
        student.setId(id);
        return ResponseEntity.ok(studentService.updateStudent(student));
    }

    @GetMapping("/permanent/{permanentNumber}")
    public ResponseEntity<Student> getStudentByPermanentNumber(@PathVariable String permanentNumber) {
        return ResponseEntity.ok(studentService.getStudentByPermanentNumber(permanentNumber));
    }

    @GetMapping("/matricule/{matricule}")
    public ResponseEntity<Student> getStudentByMatricule(@PathVariable String matricule) {
        return ResponseEntity.ok(studentService.getStudentByMatricule(matricule));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Student> updateStatus(@PathVariable Long id, @RequestParam StudentStatus status) {
        return ResponseEntity.ok(studentService.updateStudentStatus(id, status));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStudent(@PathVariable Long id) {
        studentService.deleteStudent(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * ✅ NOUVEAU : Endpoint appelé par le Frontend pour lier le compte
     */
    @PostMapping("/link-account")
    public ResponseEntity<?> linkAccount(@RequestBody Map<String, String> payload) {
        try {
            Long userId = Long.valueOf(payload.get("userId"));
            String matricule = payload.get("matricule");
            String password = payload.get("schoolPassword");

            Student student = studentService.linkAccount(userId, matricule, password);

            // Création d'une réponse claire pour le Frontend
            Map<String, Object> response = new HashMap<>();
            response.put("isLinked", true);
            response.put("studentId", student.getId());
            response.put("matricule", student.getMatricule());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * ✅ NOUVEAU : Endpoint pour vérifier si le compte connecté est lié au chargement de l'app
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<Student> getStudentByUserId(@PathVariable Long userId) {
        return studentService.getStudentByUserId(userId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.noContent().build());
    }
}