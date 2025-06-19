package pe.edu.bausate.app.domain.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import pe.edu.bausate.app.domain.models.ApplicantFile;

import java.util.Optional;

public interface ApplicantFileRepository extends JpaRepository<ApplicantFile, Long> {

    Optional<ApplicantFile> findByFileName(String fileName);
}
