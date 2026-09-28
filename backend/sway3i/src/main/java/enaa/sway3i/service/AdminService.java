package enaa.sway3i.service;

import enaa.sway3i.exception.ConflictException;
import enaa.sway3i.exception.ResourceNotFoundException;
import enaa.sway3i.dto.request.AdminRequest;
import enaa.sway3i.dto.response.AdminResponse;
import enaa.sway3i.mapper.AdminMapper;
import enaa.sway3i.model.Admin;
import enaa.sway3i.model.Role;
import enaa.sway3i.repository.AdminRepository;
import enaa.sway3i.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final AdminRepository adminRepository;
    private final UserRepository userRepository;
    private final AdminMapper adminMapper;
    private final PasswordEncoder passwordEncoder;

    public Page<AdminResponse> getAllAdmins(Pageable pageable) {
        Page<Admin> admins = adminRepository.findAll(pageable);
        return admins.map(adminMapper::toResponse);
    }

    public AdminResponse getAdminById(Long id) {
        Admin admin = adminRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("admin with this " + id + " does not exist"));
        return adminMapper.toResponse(admin);
    }

    public AdminResponse registerFirstAdmin(AdminRequest request) {
        if (adminRepository.count() > 0) {
            throw new ConflictException("An admin account already exists");
        }
        return createAdmin(request);
    }

    public AdminResponse createAdmin(AdminRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ConflictException("An account with the email " + request.getEmail() + " already exists");
        }

        Admin admin = adminMapper.toEntity(request);
        admin.setPassword(passwordEncoder.encode(admin.getPassword()));
        admin.setRole(Role.ADMIN);
        admin.setCreatedAt(LocalDateTime.now());
        Admin savedAdmin = adminRepository.save(admin);
        return adminMapper.toResponse(savedAdmin);
    }

    public AdminResponse updateAdmin(Long id, AdminRequest request) {
        Admin existingAdmin = adminRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("admin with this " + id + " does not exist"));

        if (!existingAdmin.getEmail().equals(request.getEmail()) && userRepository.existsByEmail(request.getEmail())) {
            throw new ConflictException("An account with the email " + request.getEmail() + " already exists");
        }

        existingAdmin.setFirstName(request.getFirstName());
        existingAdmin.setLastName(request.getLastName());
        existingAdmin.setEmail(request.getEmail());
        if (request.getPassword() != null && !request.getPassword().isEmpty()) {
            existingAdmin.setPassword(passwordEncoder.encode(request.getPassword()));
        }
        existingAdmin.setPhone(request.getPhone());
        existingAdmin.setCity(request.getCity());

        Admin updatedAdmin = adminRepository.save(existingAdmin);
        return adminMapper.toResponse(updatedAdmin);
    }

    public void deleteAdmin(Long id) {
        if (!adminRepository.existsById(id)) {
            throw new ResourceNotFoundException("admin with this " + id + " does not exist");
        }
        adminRepository.deleteById(id);
    }
}
