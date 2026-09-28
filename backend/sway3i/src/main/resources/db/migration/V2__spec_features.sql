ALTER TABLE tutors ADD COLUMN hourly_rate DECIMAL(10,2);
ALTER TABLE tutors ADD COLUMN teaching_zones VARCHAR(255);

CREATE TABLE tutor_subjects (
    tutor_id BIGINT NOT NULL,
    subject_id BIGINT NOT NULL,
    PRIMARY KEY (tutor_id, subject_id),
    CONSTRAINT fk_tutor_subjects_tutors FOREIGN KEY (tutor_id) REFERENCES tutors(id) ON DELETE CASCADE,
    CONSTRAINT fk_tutor_subjects_subjects FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
);

ALTER TABLE students ADD COLUMN preferences VARCHAR(500);

ALTER TABLE course_listings ADD COLUMN level VARCHAR(255);

ALTER TABLE enrollments ADD COLUMN weekly_slot_id BIGINT;
ALTER TABLE enrollments ADD CONSTRAINT fk_enrollments_weekly_slots
    FOREIGN KEY (weekly_slot_id) REFERENCES weekly_slots(id) ON DELETE SET NULL;
