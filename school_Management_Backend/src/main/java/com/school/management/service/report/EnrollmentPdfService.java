package com.school.management.service.report;

import com.lowagie.text.*;
import com.lowagie.text.Font;
import com.lowagie.text.pdf.*;
import com.lowagie.text.Element;
import com.school.management.model.academic.Enrollment;
import org.springframework.stereotype.Service;


import java.awt.*;
import java.io.ByteArrayOutputStream;
import java.util.List;

import com.lowagie.text.Document;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.pdf.PdfWriter;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfPCell;

@Service

public class EnrollmentPdfService {
    public byte[] generateEnrollmentReport(
            List<Enrollment> enrollments,
            String classroomName,
            String academicYear) {

        Document document = new Document(PageSize.A4);
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            PdfWriter.getInstance(document, out);
            document.open();

            // 🏫 Titre
            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16);
            Paragraph title = new Paragraph(
                    "LISTE DES ÉLÈVES INSCRITS",
                    titleFont
            );
            title.setAlignment(Element.ALIGN_CENTER);
            document.add(title);

            document.add(new Paragraph(" "));

            // ℹ️ Infos générales
            document.add(new Paragraph("Classe : " + classroomName));
            document.add(new Paragraph("Année Scolaire : " + academicYear));
            document.add(new Paragraph(" "));

            // 📋 Tableau
            PdfPTable table = new PdfPTable(4);
            table.setWidthPercentage(100);
            table.setWidths(new int[]{1, 4, 4, 3});

            addHeader(table, "N°");
            addHeader(table, "Nom");
            addHeader(table, "Prénom");
            addHeader(table, "Numéro d'inscription");

            int index = 1;
            for (Enrollment e : enrollments) {
                table.addCell(String.valueOf(index++));
                table.addCell(e.getStudent().getLastName());
                table.addCell(e.getStudent().getFirstName());
                table.addCell(e.getEnrollmentNumber());
            }

            document.add(table);
            document.close();

        } catch (Exception e) {
            throw new RuntimeException("Erreur lors de la génération du PDF", e);
        }

        return out.toByteArray();
    }

    private void addHeader(PdfPTable table, String text) {
        PdfPCell cell = new PdfPCell(new Phrase(text));
        cell.setBackgroundColor(Color.LIGHT_GRAY);
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        table.addCell(cell);
    }
}
