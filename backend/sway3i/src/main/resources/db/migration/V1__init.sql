CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    last_name VARCHAR(255),
    first_name VARCHAR(255),
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255),
    phone VARCHAR(255),
    city VARCHAR(255),
    role VARCHAR(255),
    created_at DATETIME(6)
);

CREATE TABLE admins (
    id BIGINT PRIMARY KEY,
    CONSTRAINT fk_admins_users FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE students (
    id BIGINT PRIMARY KEY,
    level VARCHAR(255),
    school VARCHAR(255),
    CONSTRAINT fk_students_users FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE tutors (
    id BIGINT PRIMARY KEY,
    biography VARCHAR(255),
    degree VARCHAR(255),
    national_id VARCHAR(255),
    is_verified BIT,
    average_rating DOUBLE,
    CONSTRAINT fk_tutors_users FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE subjects (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255),
    description VARCHAR(255)
);

CREATE TABLE course_listings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255),
    description VARCHAR(255),
    course_type VARCHAR(255),
    course_format VARCHAR(255),
    monthly_price DECIMAL(38,2),
    max_capacity INT,
    location_or_link VARCHAR(255),
    is_active BIT,
    tutor_id BIGINT NOT NULL,
    subject_id BIGINT NOT NULL,
    CONSTRAINT fk_course_listings_tutors FOREIGN KEY (tutor_id) REFERENCES tutors(id) ON DELETE CASCADE,
    CONSTRAINT fk_course_listings_subjects FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
);

CREATE TABLE weekly_slots (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    day_of_week VARCHAR(255),
    start_time TIME(6),
    end_time TIME(6),
    course_listing_id BIGINT,
    CONSTRAINT fk_weekly_slots_course_listings FOREIGN KEY (course_listing_id) REFERENCES course_listings(id) ON DELETE CASCADE
);

CREATE TABLE enrollments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    requested_at DATETIME(6),
    start_date DATE,
    end_date DATE,
    monthly_price DECIMAL(38,2),
    status VARCHAR(255),
    rejection_reason VARCHAR(255),
    student_id BIGINT NOT NULL,
    course_listing_id BIGINT NOT NULL,
    CONSTRAINT fk_enrollments_students FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    CONSTRAINT fk_enrollments_course_listings FOREIGN KEY (course_listing_id) REFERENCES course_listings(id) ON DELETE CASCADE
);
CREATE TABLE payments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    reference VARCHAR(255),
    amount DECIMAL(38,2),
    billing_month VARCHAR(255),
    paid_at DATETIME(6),
    payment_method VARCHAR(255),
    status VARCHAR(255),
    enrollment_id BIGINT NOT NULL,
    CONSTRAINT fk_payments_enrollments FOREIGN KEY (enrollment_id) REFERENCES enrollments(id) ON DELETE CASCADE
);
CREATE TABLE reviews (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    rating INT,
    comment VARCHAR(255),
    published_at DATETIME(6),
    enrollment_id BIGINT NOT NULL,
    CONSTRAINT fk_reviews_enrollments FOREIGN KEY (enrollment_id) REFERENCES enrollments(id) ON DELETE CASCADE
);

CREATE TABLE sessions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    date DATE,
    start_time TIME(6),
    end_time TIME(6),
    status VARCHAR(255),
    course_listing_id BIGINT NOT NULL,
    CONSTRAINT fk_sessions_course_listings FOREIGN KEY (course_listing_id) REFERENCES course_listings(id) ON DELETE CASCADE
);
