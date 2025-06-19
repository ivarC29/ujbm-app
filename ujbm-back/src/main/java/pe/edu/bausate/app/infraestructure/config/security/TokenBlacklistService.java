package pe.edu.bausate.app.infraestructure.config.security;

import com.auth0.jwt.JWT;
import com.auth0.jwt.interfaces.DecodedJWT;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Service
public class TokenBlacklistService {
    private final Map<String, Date> blacklistedTokens = new ConcurrentHashMap<>();

    public TokenBlacklistService(@Value("${app.security.jwt.blacklist-cleanup-interval}") long cleanupIntervalMs) {

        Thread cleanupThread = new Thread(() -> {
            while (true) {
                try {
                    cleanupExpiredTokens();
                    Thread.sleep(cleanupIntervalMs);
                } catch (InterruptedException e) {
                    log.warn("Token blacklist cleanup thread interrupted", e);
                    Thread.currentThread().interrupt();
                    break;
                }
            }
        });
        cleanupThread.setDaemon(true);
        cleanupThread.start();
    }

    public void blacklist(String token) {
        try {
            DecodedJWT jwt = JWT.decode(token);
            blacklistedTokens.put(jwt.getId(), jwt.getExpiresAt());
            log.info("Token added to blacklist: {}", jwt.getId());
        } catch (Exception e) {
            log.error("Error blacklisting token", e);
        }
    }

    public boolean isBlacklisted(String token) {
        try {
            DecodedJWT jwt = JWT.decode(token);
            return blacklistedTokens.containsKey(jwt.getId());
        } catch (Exception e) {
            log.error("Error checking blacklisted token", e);
            return true;
        }
    }

    private void cleanupExpiredTokens() {
        Date now = new Date();
        blacklistedTokens.entrySet().removeIf(entry -> entry.getValue().before(now));
        log.debug("Cleaned up expired tokens from blacklist. Current size: {}", blacklistedTokens.size());
    }
}
