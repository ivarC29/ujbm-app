package pe.edu.bausate.app.domain.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import pe.edu.bausate.app.domain.enumerate.EnrollmentStatus;
import pe.edu.bausate.app.domain.models.Enrollment;

import java.util.List;
import java.util.Optional;

public interface EnrollmentRepository extends JpaRepository<Enrollment, Long>, JpaSpecificationExecutor<Enrollment> {
    /**
     * Verifica si existe una matrícula para un estudiante con un estado específico
     * @param studentId ID del estudiante
     * @param status Estado de la matrícula
     * @return true si existe una matrícula con esas características
     */
    boolean existsByStudentIdAndStatus(Long studentId, EnrollmentStatus status);

    /**
     * Busca todas las matrículas de un estudiante
     * @param studentId ID del estudiante
     * @return Lista de matrículas
     */
    List<Enrollment> findByStudentId(Long studentId);

    /**
     * Busca una matrícula específica para un estudiante
     * @param enrollmentId ID de la matrícula
     * @param studentId ID del estudiante
     * @return Matrícula si existe
     */
    Optional<Enrollment> findByIdAndStudentId(Long enrollmentId, Long studentId);

    /**
     * Busca matrículas por ID de estudiante y estado
     * @param studentId ID del estudiante
     * @param status Estado de la matrícula
     * @return Lista de matrículas que coinciden con los criterios
     */
    List<Enrollment> findByStudentIdAndStatus(Long studentId, EnrollmentStatus status);
}
