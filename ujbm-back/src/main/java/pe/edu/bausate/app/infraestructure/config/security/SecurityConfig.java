package pe.edu.bausate.app.infraestructure.config.security;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import pe.edu.bausate.app.domain.service.UserDetailsServiceImpl;
import pe.edu.bausate.app.infraestructure.config.ApiPaths;


@Configuration
@EnableMethodSecurity(securedEnabled = true)
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtFilter jwtFilter;
    private final UserDetailsServiceImpl userDetailsService;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors( Customizer.withDefaults() )
                .sessionManagement( (session) ->  session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(authorize -> authorize
                        .requestMatchers(
                                ApiPaths.AUTH + "/login",
                                ApiPaths.AUTH + "/refresh",
                                ApiPaths.AUTH + "/logout",
                                ApiPaths.PUBLIC_LEVEL + "/**",
                                ApiPaths.DOCUMENTATION + "/**",
                                ApiPaths.SWAGGER_UI + "/**",
                                ApiPaths.SWAGGER_RESOURCES + "/**",
                                ApiPaths.ACTUATOR + "/**"
                                ).permitAll()
                        .requestMatchers(
                                ApiPaths.STUDENT_LEVEL + "/**"
                        ).hasRole("STUDENT")
                        .requestMatchers(
                                ApiPaths.TEACHER_LEVEL + "/**"
                        ).hasRole("TEACHER")
                        .requestMatchers(
                                ApiPaths.ADMIN_LEVEL + "/**"
                        ).hasRole("ADMIN")
                        .requestMatchers(
                                ApiPaths.INTERVIEWER_LEVEL + "/**"
                        ).hasRole("INTERVIEWER")
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

}
