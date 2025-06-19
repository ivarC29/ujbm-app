package pe.edu.bausate.app.infraestructure.config.security;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.auth0.jwt.interfaces.DecodedJWT;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import java.util.Date;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Component
@Slf4j
public class JwtUtil {
    @Value("${app.security.jwt.secret}")
    private String secretKey;

    @Value("${app.security.jwt.expiration-minutes}")
    private int expirationMinutes;

    @Value("${app.security.jwt.issuer}")
    private String issuer;

    @Value("${app.security.jwt.audience}")
    private String audience;

    private Algorithm getAlgorithm() {
        return Algorithm.HMAC256(secretKey);
    }

    public String create(UserDetails userDetails) {
        List<String> roles = userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .toList();

        return JWT.create()
                .withSubject(userDetails.getUsername())
                .withIssuer(issuer)
                .withAudience(audience)
                .withIssuedAt(new Date())
                .withExpiresAt(new Date(System.currentTimeMillis() + TimeUnit.MINUTES.toMillis(expirationMinutes)))
                .withJWTId(UUID.randomUUID().toString())
                .withClaim("roles", roles)
                .sign(getAlgorithm());
    }

    public boolean isValid(String jwt) {
        try {
            JWT.require(getAlgorithm())
                    .withIssuer(issuer)
                    .withAudience(audience)
                    .build()
                    .verify(jwt);
            log.info("JWT validated successfully");
            return true;
        } catch (JWTVerificationException e) {
            log.warn("JWT validation failed: {}", e.getMessage());
            return false;
        }
    }

    public String getUsername(String jwt) {
        DecodedJWT decodedJWT = JWT.require(getAlgorithm())
                .withIssuer(issuer)
                .withAudience(audience)
                .build()
                .verify(jwt);
        return decodedJWT.getSubject();
    }

    public List<String> getRoles(String jwt) {
        DecodedJWT decodedJWT = JWT.require(getAlgorithm())
                .withIssuer(issuer)
                .withAudience(audience)
                .build()
                .verify(jwt);
        return decodedJWT.getClaim("roles").asList(String.class);
    }

}
