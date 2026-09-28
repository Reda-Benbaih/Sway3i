package enaa.sway3i.controller;

import enaa.sway3i.dto.validation.OnCreate;
import org.springframework.validation.annotation.Validated;
import enaa.sway3i.dto.request.AdminRequest;
import enaa.sway3i.dto.response.AdminResponse;
import enaa.sway3i.service.AdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admins")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;

    @GetMapping
    public ResponseEntity<Page<AdminResponse>> getAllAdmins(Pageable pageable) {
        return ResponseEntity.ok(adminService.getAllAdmins(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AdminResponse> getAdminById(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.getAdminById(id));
    }

    @PostMapping
    public ResponseEntity<AdminResponse> createAdmin(@Validated(OnCreate.class) @RequestBody AdminRequest request) {
        return new ResponseEntity<>(adminService.createAdmin(request), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<AdminResponse> updateAdmin(@PathVariable Long id, @Valid @RequestBody AdminRequest request) {
        return ResponseEntity.ok(adminService.updateAdmin(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAdmin(@PathVariable Long id) {
        adminService.deleteAdmin(id);
        return ResponseEntity.noContent().build();
    }
}
