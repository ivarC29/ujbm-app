package pe.edu.bausate.app.domain.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pe.edu.bausate.app.domain.enumerate.ExamFileType;
import pe.edu.bausate.app.domain.models.ExamFile;

import java.util.List;

public interface ExamFileRepository extends JpaRepository<ExamFile, Long> {
    List<ExamFile> findByExamIdAndFileCategoryAndAvailableTrue(Long examId, ExamFileType fileCategory);
    List<ExamFile> findByExamIdAndAvailableTrue(Long examId);
    void deleteByExamIdAndFileCategory(Long examId, ExamFileType fileCategory);
}