package enaa.sway3i.service;

import enaa.sway3i.dto.request.AdminRequest;
import enaa.sway3i.dto.response.AdminResponse;
import enaa.sway3i.mapper.AdminMapper;
import enaa.sway3i.model.Admin;
import enaa.sway3i.model.Role;
import enaa.sway3i.repository.AdminRepository;
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
    private final AdminMapper adminMapper;
    private final PasswordEncoder passwordEncoder;

    public Page<AdminResponse> getAllAdmins(Pageable pageable) {
        Page<Admin> admins = adminRepository.findAll(pageable);
        return admins.map(adminMapper::toResponse);
    }

    public AdminResponse getAdminById(Long id) {
        Admin admin = adminRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("admin with this " + id + " does not exist"));
        return adminMapper.toResponse(admin);
    }

    public AdminResponse createAdmin(AdminRequest request) {
        Admin admin = adminMapper.toEntity(request);
        admin.setPassword(passwordEncoder.encode(admin.getPassword()));
        admin.setRole(Role.ADMIN);
        admin.setCreatedAt(LocalDateTime.now());
        Admin savedAdmin = adminRepository.save(admin);
        return adminMapper.toResponse(savedAdmin);
    }

    public AdminResponse updateAdmin(Long id, AdminRequest request) {
        Admin existingAdmin = adminRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("admin with this " + id + " does not exist"));

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
            throw new RuntimeException("admin with this " + id + " does not exist");
        }
        adminRepository.deleteById(id);
    }
}
