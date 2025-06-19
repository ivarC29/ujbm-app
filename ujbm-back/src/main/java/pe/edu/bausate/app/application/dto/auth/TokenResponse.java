package pe.edu.bausate.app.application.dto.auth;

public record TokenResponse(String accessToken, String refreshToken) {}