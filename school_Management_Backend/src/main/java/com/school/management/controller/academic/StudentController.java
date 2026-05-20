package com.school.management.controller.academic;

import com.school.management.model.academic.Student;
import com.school.management.model.enums.StudentStatus;
import com.school.management.service.academic.StudentService;
import com.school.management.service.academicImpl.StudentServiceImpl;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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

    /**
     * ✅ AJOUT : Mise à jour complète (Corrige l'erreur 405 PUT)
     * Cette méthode permet de modifier toutes les infos de l'élève (Nom, Photo, etc.)
     */
    @PutMapping("/{id}")
    public ResponseEntity<Student> updateStudent(@PathVariable Long id, @RequestBody Student student) {
        // On s'assure que l'ID passé dans l'URL est bien celui appliqué à l'objet
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

    /**
     * 🔄 Mettre à jour le statut d'un élève
     */
    @PatchMapping("/{id}/status")
    public ResponseEntity<Student> updateStatus(@PathVariable Long id, @RequestParam StudentStatus status) {
        return ResponseEntity.ok(studentService.updateStudentStatus(id, status));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStudent(@PathVariable Long id) {
        studentService.deleteStudent(id);
        return ResponseEntity.noContent().build();
    }

}
