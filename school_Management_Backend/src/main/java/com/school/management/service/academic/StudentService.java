package com.school.management.service.academic;

import com.school.management.model.academic.Student;
import com.school.management.model.enums.StudentStatus;

import java.util.List;

public interface StudentService {

    Student createStudent(Student student);
    List<Student> getAllStudents();
    Student getStudentById(Long id);
    Student getStudentByPermanentNumber(String permanentNumber);

    // Nouvelles méthodes pour le suivi du parcours
    Student getStudentByMatricule(String matricule);
    Student updateStudentStatus(Long id, StudentStatus status);
    // Dans StudentService.java
    void deleteStudent(Long id);
    Student updateStudent(Student student);

    List<Student> searchStudentsWithAccount(String query);
}
