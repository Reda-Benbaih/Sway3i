package enaa.sway3i.controller;

import enaa.sway3i.dto.request.LoginRequest;
import enaa.sway3i.dto.request.StudentRequest;
import enaa.sway3i.dto.request.TutorRequest;
import enaa.sway3i.dto.response.AuthResponse;
import enaa.sway3i.model.User;
import enaa.sway3i.repository.UserRepository;
import enaa.sway3i.security.CustomUserDetails;
import enaa.sway3i.security.JwtUtil;
import enaa.sway3i.service.StudentService;
import enaa.sway3i.service.TutorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final StudentService studentService;
    private final TutorService tutorService;
    private final UserRepository userRepository;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        return ResponseEntity.ok(buildAuthResponse(userDetails.getUser()));
    }

    @PostMapping("/register/student")
    public ResponseEntity<AuthResponse> registerStudent(@Valid @RequestBody StudentRequest request) {
        studentService.createStudent(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(buildAuthResponse(request.getEmail()));
    }

    @PostMapping("/register/tutor")
    public ResponseEntity<AuthResponse> registerTutor(@Valid @RequestBody TutorRequest request) {
        tutorService.createTutor(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(buildAuthResponse(request.getEmail()));
    }

    private AuthResponse buildAuthResponse(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("user with this " + email + " does not exist"));
        return buildAuthResponse(user);
    }

    private AuthResponse buildAuthResponse(User user) {
        String token = jwtUtil.generateToken(new CustomUserDetails(user));
        return new AuthResponse(
                token,
                "Bearer",
                86400,
                user.getId(),
                user.getEmail(),
                user.getRole().name()
        );
    }
}
