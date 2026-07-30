package com.school.management.service.academicImpl;

import com.school.management.dto.academic.HourSlotCreateDTO;
import com.school.management.dto.academic.HourSlotResponseDTO;
import com.school.management.exception.BadRequestException;
import com.school.management.model.academic.HourSlot;
import com.school.management.repository.academic.HourSlotRepository;
import com.school.management.service.academic.HourSlotService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HourSlotServiceImpl implements HourSlotService {

    private final HourSlotRepository hourSlotRepository;

    @Override
    @Transactional
    public HourSlotResponseDTO addHourSlot(HourSlotCreateDTO dto) {
        if (hourSlotRepository.existsBySchoolIdAndSlotNumber(dto.getSchoolId(), dto.getSlotNumber())) {
            throw new BadRequestException("Ce numéro de créneau horaire est déjà configuré dans cet établissement.");
        }

        HourSlot hourSlot = HourSlot.builder()
                .schoolId(dto.getSchoolId())
                .slotNumber(dto.getSlotNumber())
                .label(dto.getLabel())
                .build();

        return mapToResponseDTO(hourSlotRepository.save(hourSlot));
    }

    @Override
    @Transactional(readOnly = true)
    public List<HourSlotResponseDTO> getSchoolHourSlots(Long schoolId) {
        return hourSlotRepository.findBySchoolIdOrderBySlotNumberAsc(schoolId)
                .stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public HourSlotResponseDTO updateHourSlot(Long schoolId, Long id, HourSlotCreateDTO dto) {
        HourSlot hourSlot = hourSlotRepository.findById(id)
                .orElseThrow(() -> new BadRequestException("Tranche horaire introuvable."));

        if (!hourSlot.getSchoolId().equals(schoolId)) {
            throw new BadRequestException("Action non autorisée sur les données de cette école.");
        }

        // Si le numéro de créneau a changé, vérifier qu'il n'entre pas en conflit avec un autre créneau
        if (!hourSlot.getSlotNumber().equals(dto.getSlotNumber())) {
            if (hourSlotRepository.existsBySchoolIdAndSlotNumber(schoolId, dto.getSlotNumber())) {
                throw new BadRequestException("Ce numéro de créneau horaire est déjà configuré dans cet établissement.");
            }
        }

        hourSlot.setSlotNumber(dto.getSlotNumber());
        hourSlot.setLabel(dto.getLabel());

        return mapToResponseDTO(hourSlotRepository.save(hourSlot));
    }

    @Override
    @Transactional
    public void deleteHourSlot(Long schoolId, Long id) {
        HourSlot hourSlot = hourSlotRepository.findById(id)
                .orElseThrow(() -> new BadRequestException("Tranche horaire introuvable."));

        if (!hourSlot.getSchoolId().equals(schoolId)) {
            throw new BadRequestException("Action non autorisée sur les données de cette école.");
        }
        hourSlotRepository.delete(hourSlot);
    }

    private HourSlotResponseDTO mapToResponseDTO(HourSlot hourSlot) {
        return HourSlotResponseDTO.builder()
                .id(hourSlot.getId())
                .schoolId(hourSlot.getSchoolId())
                .slotNumber(hourSlot.getSlotNumber())
                .label(hourSlot.getLabel())
                .build();
    }
}