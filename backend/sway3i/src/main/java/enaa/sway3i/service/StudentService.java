package enaa.sway3i.service;

import enaa.sway3i.dto.request.StudentRequest;
import enaa.sway3i.dto.response.StudentResponse;
import enaa.sway3i.mapper.StudentMapper;
import enaa.sway3i.model.Student;
import enaa.sway3i.repository.StudentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class StudentService {

    private final StudentRepository studentRepository;
    private final StudentMapper studentMapper;

    public Page<StudentResponse> getAllStudents(Pageable pageable) {
        Page<Student> students = studentRepository.findAll(pageable);
        return students.map(studentMapper::toResponse);
    }

    public StudentResponse getStudentById(Long id) {
        Student student = studentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("student with this " + id + " does not exist"));
        return studentMapper.toResponse(student);
    }

    public StudentResponse createStudent(StudentRequest request) {
        Student student = studentMapper.toEntity(request);
        Student savedStudent = studentRepository.save(student);
        return studentMapper.toResponse(savedStudent);
    }

    public StudentResponse updateStudent(Long id, StudentRequest request) {
        Student existingStudent = studentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("student with this " + id + "  not exist"));

        existingStudent.setFirstName(request.getFirstName());
        existingStudent.setLastName(request.getLastName());
        existingStudent.setEmail(request.getEmail());
        existingStudent.setPassword(request.getPassword());
        existingStudent.setPhone(request.getPhone());
        existingStudent.setCity(request.getCity());
        existingStudent.setLevel(request.getLevel());
        existingStudent.setSchool(request.getSchool());

        Student updatedStudent = studentRepository.save(existingStudent);
        return studentMapper.toResponse(updatedStudent);
    }

    public void deleteStudent(Long id) {
        if (!studentRepository.existsById(id)) {
            throw new RuntimeException("student with this " + id + " does not exist");
        }
        studentRepository.deleteById(id);
    }
}
