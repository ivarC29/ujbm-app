package pe.edu.bausate.app.application.dto.auth;

public record LogoutRequest(String token, String refreshToken) {}
