package com.school.management.service.academic;

import com.school.management.dto.academic.BulletinDataResponseDTO;

public interface BulletinService {
    BulletinDataResponseDTO generateBulletin(Long studentId, Long academicYearId);
}