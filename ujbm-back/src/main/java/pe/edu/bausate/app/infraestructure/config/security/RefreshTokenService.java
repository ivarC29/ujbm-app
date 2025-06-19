package pe.edu.bausate.app.infraestructure.config.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import pe.edu.bausate.app.domain.models.RefreshToken;
import pe.edu.bausate.app.domain.repository.RefreshTokenRepository;
import pe.edu.bausate.app.domain.repository.UserRepository;
import pe.edu.bausate.app.infraestructure.exception.TokenRefreshException;

import java.time.Instant;
import java.util.UUID;

@Service
public class RefreshTokenService {
//    @Value("${app.security.refresh-token.expiration-days}")
//    private int refreshTokenExpirationDays;

    private final RefreshTokenRepository refreshTokenRepository;
    private final UserRepository userRepository;
    private final int refreshTokenExpirationDays;

    public RefreshTokenService(
            RefreshTokenRepository refreshTokenRepository,
            UserRepository userRepository,
            @Value("${app.security.refresh-token.expiration-days}") int refreshTokenExpirationDays
    ) {
        this.refreshTokenRepository = refreshTokenRepository;
        this.userRepository = userRepository;
        this.refreshTokenExpirationDays = refreshTokenExpirationDays;
    }

    public String createRefreshToken(String username) {
        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setUser(userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado: " + username)));
        refreshToken.setExpiryDate(Instant.now().plusSeconds((long) refreshTokenExpirationDays * 24 * 60 * 60));
        refreshToken.setToken(UUID.randomUUID().toString());

        refreshToken = refreshTokenRepository.save(refreshToken);
        return refreshToken.getToken();
    }

    public String validateRefreshToken(String token) {
        RefreshToken refreshToken = refreshTokenRepository.findByToken(token)
                .orElseThrow(() -> new TokenRefreshException("Refresh token no encontrado"));

        // Verificar si el token ha expirado
        if (refreshToken.getExpiryDate().isBefore(Instant.now())) {
            refreshTokenRepository.delete(refreshToken);
            throw new TokenRefreshException("Refresh token expirado");
        }

        return refreshToken.getUser().getUsername();
    }

    public void revokeRefreshToken(String token) {
        refreshTokenRepository.findByToken(token)
                .ifPresent(refreshTokenRepository::delete);
    }

    @Transactional
    public void revokeAllUserTokens(String username) {
        userRepository.findByUsername(username)
                .ifPresent(refreshTokenRepository::deleteByUser);
    }
}
