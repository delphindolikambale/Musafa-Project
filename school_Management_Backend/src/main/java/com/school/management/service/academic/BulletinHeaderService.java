package com.school.management.service.academic;

import com.school.management.dto.academic.BulletinHeaderRequestDTO;
import com.school.management.dto.academic.BulletinHeaderResponseDTO;
import org.springframework.web.multipart.MultipartFile;

public interface BulletinHeaderService {

    BulletinHeaderResponseDTO getBulletinHeader();

    BulletinHeaderResponseDTO saveOrUpdateBulletinHeader(
            BulletinHeaderRequestDTO requestDTO,
            MultipartFile flagImage,
            MultipartFile ministryLogo,
            MultipartFile watermarkLogo
    );
}