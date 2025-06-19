package pe.edu.bausate.app.application.controller;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.User;
import org.springframework.web.bind.annotation.*;
import pe.edu.bausate.app.application.dto.auth.*;
import pe.edu.bausate.app.domain.service.UserDetailsServiceImpl;
import pe.edu.bausate.app.domain.service.UserService;
import pe.edu.bausate.app.infraestructure.config.ApiPaths;
import pe.edu.bausate.app.infraestructure.config.security.JwtUtil;
import pe.edu.bausate.app.infraestructure.config.security.RefreshTokenService;
import pe.edu.bausate.app.infraestructure.config.security.TokenBlacklistService;

@RestController
@RequestMapping(ApiPaths.AUTH)
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Punto de authenticacion del usuario.")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final RefreshTokenService refreshTokenService;
    private final TokenBlacklistService tokenBlacklistService;
    private final UserDetailsServiceImpl userDetailsService;
    private final UserService userService;

    @PostMapping("/login")
    public ResponseEntity<TokenResponse> login(@RequestBody LoginRequest loginRequest) {
        UsernamePasswordAuthenticationToken login = new UsernamePasswordAuthenticationToken(
                loginRequest.username(), loginRequest.password()
        );
        Authentication authentication = this.authenticationManager.authenticate(login);
        User user = (User) authentication.getPrincipal();

        String accessToken = this.jwtUtil.create(user);
        String refreshToken = this.refreshTokenService.createRefreshToken(user.getUsername());

        TokenResponse response = new TokenResponse(accessToken, refreshToken);
        return ResponseEntity.ok()
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
                .body(response);
    }

    @PostMapping("/refresh")
    public ResponseEntity<TokenResponse> refreshToken(@RequestBody RefreshTokenRequest request) {
        // Validar refresh token
        String username = refreshTokenService.validateRefreshToken(request.refreshToken());
        User user = (User) userDetailsService.loadUserByUsername(username);

        // Crear nuevo access token
        String accessToken = this.jwtUtil.create(user);

        TokenResponse response = new TokenResponse(accessToken, request.refreshToken());
        return ResponseEntity.ok()
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + accessToken)
                .body(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@RequestBody LogoutRequest request) {
        // Agregar token a la lista negra
        tokenBlacklistService.blacklist(request.token());

        // Invalidar refresh token si se proporciona
        if (request.refreshToken() != null) {
            refreshTokenService.revokeRefreshToken(request.refreshToken());
        }

        return ResponseEntity.ok().build();
    }

    @PostMapping("/change-password")
    public ResponseEntity<Void> changePassword(
            @Valid @RequestBody PasswordChangeRequest request,
            Authentication authentication,
            @RequestHeader(HttpHeaders.AUTHORIZATION) String authorizationHeader) {

        String username = authentication.getName();

        // Verificar si la contraseña actual es correcta
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(username, request.currentPassword()));
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(null);
        }

        // Verificar que las nuevas contraseñas coincidan
        if (!request.newPassword().equals(request.confirmPassword())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(null);
        }

        userService.updatePassword(username, request.newPassword());
        refreshTokenService.revokeAllUserTokens(username);

        // Incluir token actual en lista negra
        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            String accessToken = authorizationHeader.substring(7);
            tokenBlacklistService.blacklist(accessToken);
        }

        return ResponseEntity.ok().build();
    }

}
