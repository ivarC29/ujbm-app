package pe.edu.bausate.app.application.dto.coursesection;

import lombok.Builder;

import java.util.List;

@Builder
public record CourseSectionBatchUploadResponse(
        int totalRecords,
        int successCount,
        int errorCount,
        List<String> errors
) {}
