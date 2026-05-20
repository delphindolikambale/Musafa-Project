package com.school.management.controller.academic;

import com.school.management.dto.academic.StudentAcademicHistoryDTO;
import com.school.management.model.academic.StudentAcademicHistory;
import com.school.management.service.academic.StudentAcademicHistoryService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/academic-history")
public class StudentAcademicHistoryController {
    private final StudentAcademicHistoryService historyService;

    public StudentAcademicHistoryController(
            StudentAcademicHistoryService historyService) {
        this.historyService = historyService;
    }

    @PostMapping
    public ResponseEntity<StudentAcademicHistory> create(
            @RequestBody StudentAcademicHistoryDTO dto) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(historyService.create(dto));
    }

}
