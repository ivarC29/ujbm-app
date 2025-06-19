
INSERT INTO role (name, create_at, modified_at, created_by, modified_by) VALUES ('ROLE_STUDENT', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system', 'system') ON CONFLICT DO NOTHING;
INSERT INTO role (name, create_at, modified_at, created_by, modified_by) VALUES ('ROLE_TEACHER', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system', 'system') ON CONFLICT DO NOTHING;
INSERT INTO role (name, create_at, modified_at, created_by, modified_by) VALUES ('ROLE_ADMIN', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system', 'system') ON CONFLICT DO NOTHING;
INSERT INTO role (name, create_at, modified_at, created_by, modified_by) VALUES ('ROLE_DEV', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system', 'system') ON CONFLICT DO NOTHING;
INSERT INTO role (name, create_at, modified_at, created_by, modified_by) VALUES ('ROLE_INTERVIEWER', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system', 'system') ON CONFLICT DO NOTHING;

INSERT INTO users (username, password, enabled, locked, email, create_at, modified_at, created_by, modified_by) VALUES
('student_tmp', '$2y$10$YdeY6ay/y/PhmwBtggfZ.ednJBjkjsPmRrkj6yWhNI9XkOSPYQtcG', 1, 0,'usuario1@example.com', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system', 'system'),
('teacher_tmp', '$2y$10$dEOu1rNlPVEaOWEVFriN3OtO8HI0trn4DlVNhMUb.ka.Eb/jt.fEW', 1, 0,'usuario2@example.com', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system', 'system'),
('dev', '$2y$10$WN/N9SrB1TgsbstdQCVzDukeNzl9F6DmJ0iRoRYW1w8Ew8dz8kGQu', 1, 0,'ivar.n.c.29@gmail.com', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system', 'system'),
('admin', '$2y$10$7yo/1aeKs3zO2V2G7JC87urtz9LgqQIrpYJn44geVoiTBAAzStW0u', 1, 0,'noldia12@gmail.com', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system', 'system'),
('interviewer', '$2y$10$7yo/1aeKs3zO2V2G7JC87urtz9LgqQIrpYJn44geVoiTBAAzStW0u', 1, 0,'interviewer@gmail.com', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system', 'system');

INSERT INTO users_roles (user_id, roles_id) VALUES
((SELECT id FROM users WHERE username = 'student_tmp'), (SELECT id FROM role WHERE name = 'ROLE_STUDENT')),
((SELECT id FROM users WHERE username = 'teacher_tmp'), (SELECT id FROM role WHERE name = 'ROLE_TEACHER')),
((SELECT id FROM users WHERE username = 'admin'), (SELECT id FROM role WHERE name = 'ROLE_ADMIN')),
((SELECT id FROM users WHERE username = 'dev'), (SELECT id FROM role WHERE name = 'ROLE_DEV')),
((SELECT id FROM users WHERE username = 'interviewer'), (SELECT id FROM role WHERE name = 'ROLE_INTERVIEWER'));

-- interviewer_availability
INSERT INTO interviewer_availability (user_id, start_time, end_time, day_of_week, recurring, available, create_at, modified_at, created_by, modified_by)
VALUES
((SELECT id FROM users WHERE username = 'interviewer'), '2025-01-01 09:00:00', '2025-01-01 16:00:00', 1, 1, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system', 'system'),
((SELECT id FROM users WHERE username = 'interviewer'), '2025-01-01 09:00:00', '2025-01-01 16:00:00', 2, 1, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system', 'system'),
((SELECT id FROM users WHERE username = 'interviewer'), '2025-01-01 09:00:00', '2025-01-01 16:00:00', 3, 1, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system', 'system'),
((SELECT id FROM users WHERE username = 'interviewer'), '2025-01-01 09:00:00', '2025-01-01 16:00:00', 4, 1, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system', 'system'),
((SELECT id FROM users WHERE username = 'interviewer'), '2025-01-01 09:00:00', '2025-01-01 16:00:00', 5, 1, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system', 'system');


INSERT INTO faculty (code, type, name, description, create_at, modified_at, created_by, modified_by, available)
VALUES
(2, '01', 'Ciencias de la Comunicación Social', 'Facultad dedicada a las ciencias de la comunicación y periodismo', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system', 'system',1),
(4, '02', 'Escuela de Posgrado', 'Unidad de Posgrado - Escuela de Posgrado', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system', 'system',1),
(8, '01', 'Facultad de Ingeniería de la Información y Comunicación', 'Facultad que abarca diversas ingenierías incluyendo informática', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system', 'system',1);

INSERT INTO program (code, academic_level, name, authorization_type, available, has_efi, duration_in_semesters, degree_awarded, faculty_id, create_at, modified_at, created_by, modified_by)
VALUES
    (4, '01', 'Administración', 'Declarado por la universidad', 1, 0, 10, 'Bachiller en Administración', (SELECT id FROM faculty WHERE code = 8), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system', 'system'),
    (1, '01', 'Comunicación Audiovisual', 'Reconocido por Lic.', 1, 0, 10, 'Bachiller en Comunicación Audiovisual', (SELECT id FROM faculty WHERE code = 2), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system', 'system'),
    (3, '01', 'Periodismo', 'Reconocido por Lic.', 1, 0, 10, 'Bachiller en Periodismo', (SELECT id FROM faculty WHERE code = 2), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system', 'system'),
    (2, '02', 'Maestría en Comunicación y Marketing', 'Reconocido por Lic.', 1, 0, 4, 'Magíster en Comunicación y Marketing', (SELECT id FROM faculty WHERE code = 4), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system', 'system'),
    (5, '02', 'Maestría en Gerencia Pública', 'Declarado por la universidad', 1, 0, 4, 'Magíster en Gerencia Pública', (SELECT id FROM faculty WHERE code = 4), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system', 'system'),
    (6, '01', 'Ingeniería Informática - Sistemas de Información', 'Declarado por la universidad', 1, 0, 10, 'Bachiller en Ingeniería Informática', (SELECT id FROM faculty WHERE code = 8), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system', 'system'),
    (8, '03', 'Doctorado en Ciencias de la Comunicación', 'Declarado por la universidad', 1, 0, 6, 'Doctor en Ciencias de la Comunicación', (SELECT id FROM faculty WHERE code = 4), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system', 'system');

INSERT INTO academic_period( create_at, created_by, modified_at, modified_by, available, end_date, name, start_date, status)
	VALUES (CURRENT_TIMESTAMP,'admin', CURRENT_TIMESTAMP, 'admin', 1, '2025-07-31', '2025-I', '2025-03-01', '01');

INSERT INTO academic_period( create_at, created_by, modified_at, modified_by, available, end_date, name, start_date, status)
	VALUES (CURRENT_TIMESTAMP,'admin', CURRENT_TIMESTAMP, 'admin', 1, '2025-12-31', '2025-II', '2025-08-01', '01');


INSERT INTO course (code, name, credits, cycle, available, program_id, create_at, modified_at, created_by, modified_by)
VALUES
    ('PER101', 'Introducción al Periodismo', 4, 1, 1, (SELECT id FROM program WHERE code = 3), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system', 'system'),
    ('PER102', 'Redacción Periodística I', 3, 1, 1, (SELECT id FROM program WHERE code = 3), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system', 'system'),
    ('PER103', 'Ética y Deontología Periodística', 3, 1, 1, (SELECT id FROM program WHERE code = 3), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system', 'system'),
    ('PER104', 'Historia del Periodismo', 3, 1, 1, (SELECT id FROM program WHERE code = 3), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system', 'system'),
	('PER105', 'Técnicas de Entrevista Periodística', 3, 1, 1, (SELECT id FROM program WHERE code = 3), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system', 'system'),
    ('PER106', 'Géneros Periodísticos', 4, 1, 1, (SELECT id FROM program WHERE code = 3), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system', 'system');

INSERT INTO system_parameter (key, value, description, create_at, modified_at, created_by, modified_by, value_type, editable, available)
VALUES
('filial.name', 'Sede Central-Jesús María', 'Nombre de la sede principal de la Universidad Jaime Bausate y Meza.',
 CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system', 'system', 0, 1, 1),

('matricula.cost', 300.23, 'Monto establecido para pago de matricula.',
 CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system', 'system', 2, 1, 1),

('university.logo.path', '/static/images/logo.png', 'Recursos estaticos de logo Bausate',
 CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system', 'system', 0, 1, 1),

('university.name', 'Universidad Jaime Bausate y Meza', 'Nombre de la universidad',
 CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system', 'system', 0, 1, 1),

('admission.exam.fee', 150, 'Costo del examen de admision',
 CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system', 'system', 1, 1, 1),

('current.academic.period', '2025-I', 'Periodo académico actual',
 CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system', 'system', 0, 1, 1),

('admission.exam.mail.send.date', '2025-06-18', 'Hora del envío de los emails para el examen de admisión Formato esperado: 0 MINUTO HORA * * * ',
 CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system', 'system', 4, 1, 1),

('admission.exam.hour.send', '0 12 21 * * *', 'Hora del envío de los emails para el examen de admisión',
 CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system', 'system', 0, 1, 1),

('admission.exam.score.display.time', '21:41', 'Hora para visualizar la página de notas',
 CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system', 'system', 0, 1, 1),

('interview.duration.minutes', '60', 'Duración de cada entrevista en minutos',
 CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system', 'system', 1, 1, 1),

('interview.max.appointments.per.day', '5', 'Número de entrevistas por día',
 CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system', 'system', 1, 1, 1),

('interview.link.url', 'https://utpvirtual.zoom.us/j/83040484866', 'Link de entrevistas',
 CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system', 'system', 0, 1, 1);

INSERT INTO course (code, name, credits, cycle, available, program_id, create_at, modified_at, created_by, modified_by)
VALUES
    ('INF101', 'Programación I', 4, 1, 1, (SELECT id FROM program WHERE code = 6), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system', 'system'),
    ('INF102', 'Matemática Discreta', 3, 1, 1, (SELECT id FROM program WHERE code = 6), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system', 'system'),
    ('INF103', 'Arquitectura de Computadoras', 4, 2, 1, (SELECT id FROM program WHERE code = 6), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system', 'system'),
    ('INF104', 'Estructura de Datos', 4, 2, 1, (SELECT id FROM program WHERE code = 6), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system', 'system'),
    ('INF105', 'Bases de Datos I', 3, 3, 1, (SELECT id FROM program WHERE code = 6), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system', 'system'),
    ('INF106', 'Sistemas Operativos', 3, 3, 1, (SELECT id FROM program WHERE code = 6), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system', 'system'),
    ('INF107', 'Programación Web', 4, 4, 1, (SELECT id FROM program WHERE code = 6), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system', 'system'),
    ('INF108', 'Redes de Computadoras', 3, 4, 1, (SELECT id FROM program WHERE code = 6), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system', 'system'),
    ('INF109', 'Ingeniería de Software', 4, 5, 1, (SELECT id FROM program WHERE code = 6), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system', 'system'),
    ('INF110', 'Seguridad Informática', 3, 5, 1, (SELECT id FROM program WHERE code = 6), CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'system', 'system');