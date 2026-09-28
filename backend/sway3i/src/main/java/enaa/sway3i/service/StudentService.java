package enaa.sway3i.service;

import enaa.sway3i.dto.request.StudentRequest;
import enaa.sway3i.dto.response.StudentResponse;
import enaa.sway3i.exception.ConflictException;
import enaa.sway3i.exception.ResourceNotFoundException;
import enaa.sway3i.mapper.StudentMapper;
import enaa.sway3i.model.Role;
import enaa.sway3i.model.Student;
import enaa.sway3i.repository.StudentRepository;
import enaa.sway3i.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class StudentService {

    private final StudentRepository studentRepository;
    private final UserRepository userRepository;
    private final StudentMapper studentMapper;
    private final PasswordEncoder passwordEncoder;

    public Page<StudentResponse> getAllStudents(Pageable pageable) {
        Page<Student> students = studentRepository.findAll(pageable);
        return students.map(studentMapper::toResponse);
    }

    public StudentResponse getStudentById(Long id) {
        return studentMapper.toResponse(findStudent(id));
    }

    public StudentResponse createStudent(StudentRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ConflictException("An account with the email " + request.getEmail() + " already exists");
        }

        Student student = studentMapper.toEntity(request);
        student.setPassword(passwordEncoder.encode(student.getPassword()));
        student.setRole(Role.STUDENT);
        student.setCreatedAt(LocalDateTime.now());

        Student savedStudent = studentRepository.save(student);
        return studentMapper.toResponse(savedStudent);
    }

    public StudentResponse updateStudent(Long id, StudentRequest request) {
        Student existingStudent = findStudent(id);

        if (!existingStudent.getEmail().equals(request.getEmail()) && userRepository.existsByEmail(request.getEmail())) {
            throw new ConflictException("An account with the email " + request.getEmail() + " already exists");
        }

        existingStudent.setFirstName(request.getFirstName());
        existingStudent.setLastName(request.getLastName());
        existingStudent.setEmail(request.getEmail());
        if (request.getPassword() != null && !request.getPassword().isEmpty()) {
            existingStudent.setPassword(passwordEncoder.encode(request.getPassword()));
        }
        existingStudent.setPhone(request.getPhone());
        existingStudent.setCity(request.getCity());
        existingStudent.setLevel(request.getLevel());
        existingStudent.setSchool(request.getSchool());
        existingStudent.setPreferences(request.getPreferences());

        Student updatedStudent = studentRepository.save(existingStudent);
        return studentMapper.toResponse(updatedStudent);
    }

    public void deleteStudent(Long id) {
        if (!studentRepository.existsById(id)) {
            throw new ResourceNotFoundException("student with this " + id + " does not exist");
        }
        studentRepository.deleteById(id);
    }

    private Student findStudent(Long id) {
        return studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("student with this " + id + " does not exist"));
    }
}
