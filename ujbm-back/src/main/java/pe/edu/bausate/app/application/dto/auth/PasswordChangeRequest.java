package pe.edu.bausate.app.application.dto.auth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record PasswordChangeRequest(
        @NotBlank(message = "La contraseña actual es requerida")
        String currentPassword,

        @NotBlank(message = "La nueva contraseña es requerida")
        @Size(min = 8, message = "La contraseña debe tener al menos 8 caracteres")
        String newPassword,

        @NotBlank(message = "La confirmación de contraseña es requerida")
        String confirmPassword
) {}
