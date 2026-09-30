package enaa.sway3i.service;

import enaa.sway3i.dto.request.GoogleLoginRequest;
import enaa.sway3i.exception.BadRequestException;
import enaa.sway3i.exception.ResourceNotFoundException;
import enaa.sway3i.model.Role;
import enaa.sway3i.model.Student;
import enaa.sway3i.model.Tutor;
import enaa.sway3i.model.User;
import enaa.sway3i.repository.StudentRepository;
import enaa.sway3i.repository.TutorRepository;
import enaa.sway3i.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidatorResult;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.security.oauth2.jwt.JwtTimestampValidator;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class GoogleAuthService {

    private static final String GOOGLE_KEYS_URL = "https://www.googleapis.com/oauth2/v3/certs";
    private static final Set<String> GOOGLE_ISSUERS = Set.of("https://accounts.google.com", "accounts.google.com");

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final TutorRepository tutorRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.google.client-id:}")
    private String clientId;

    private JwtDecoder jwtDecoder;

    public User authenticate(GoogleLoginRequest request) {
        if (clientId == null || clientId.isBlank()) {
            throw new BadRequestException("Google sign-in is not configured on this server");
        }

        Jwt idToken = verify(request.getToken());
        String email = idToken.getClaimAsString("email");

        return userRepository.findByEmail(email)
                .orElseGet(() -> createAccount(idToken, email, request.getRole()));
    }

    private Jwt verify(String token) {
        try {
            Jwt jwt = decoder().decode(token);
            if (!Boolean.TRUE.equals(jwt.getClaimAsBoolean("email_verified")) || jwt.getClaimAsString("email") == null) {
                throw new BadRequestException("Your Google email address is not verified");
            }
            return jwt;
        } catch (JwtException e) {
            throw new BadRequestException("Invalid Google token");
        }
    }

    private User createAccount(Jwt idToken, String email, Role role) {
        if (role == null) {
            throw new ResourceNotFoundException("No account is linked to this Google email yet");
        }
        if (role == Role.ADMIN) {
            throw new BadRequestException("You can only sign up as a student or a teacher");
        }

        String firstName = valueOr(idToken.getClaimAsString("given_name"), email.substring(0, email.indexOf('@')));
        String lastName = valueOr(idToken.getClaimAsString("family_name"), "-");
        String password = passwordEncoder.encode(UUID.randomUUID().toString());

        if (role == Role.TUTOR) {
            Tutor tutor = new Tutor();
            fill(tutor, firstName, lastName, email, password, Role.TUTOR);
            tutor.setIsVerified(false);
            return tutorRepository.save(tutor);
        }

        Student student = new Student();
        fill(student, firstName, lastName, email, password, Role.STUDENT);
        return studentRepository.save(student);
    }

    private void fill(User user, String firstName, String lastName, String email, String password, Role role) {
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setEmail(email);
        user.setPassword(password);
        user.setRole(role);
        user.setCreatedAt(LocalDateTime.now());
    }

    private String valueOr(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value;
    }

    private synchronized JwtDecoder decoder() {
        if (jwtDecoder == null) {
            NimbusJwtDecoder decoder = NimbusJwtDecoder.withJwkSetUri(GOOGLE_KEYS_URL).build();
            OAuth2TokenValidator<Jwt> issuer = jwt -> GOOGLE_ISSUERS.contains(jwt.getClaimAsString("iss"))
                    ? OAuth2TokenValidatorResult.success()
                    : OAuth2TokenValidatorResult.failure(new OAuth2Error("invalid_token", "Wrong issuer", null));
            OAuth2TokenValidator<Jwt> audience = jwt -> jwt.getAudience() != null && jwt.getAudience().contains(clientId)
                    ? OAuth2TokenValidatorResult.success()
                    : OAuth2TokenValidatorResult.failure(new OAuth2Error("invalid_token", "Token was not issued for this app", null));
            decoder.setJwtValidator(new DelegatingOAuth2TokenValidator<>(new JwtTimestampValidator(), issuer, audience));
            jwtDecoder = decoder;
        }
        return jwtDecoder;
    }
}
