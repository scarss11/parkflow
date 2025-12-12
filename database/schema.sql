-- ============================================
-- SISTEMA DE PARQUEADERO - BASE DE DATOS
-- SENA - NODO TIC 2025
-- ============================================

DROP DATABASE IF EXISTS parqueadero_sena;
CREATE DATABASE parqueadero_sena CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE parqueadero_sena;

-- ============================================
-- TABLA: ROLES
-- ============================================
CREATE TABLE roles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion VARCHAR(255),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLA: USUARIOS
-- ============================================
CREATE TABLE usuarios (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    rol_id INT NOT NULL,
    telefono VARCHAR(20),
    activo TINYINT(1) DEFAULT 1,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    ultima_sesion DATETIME,
    FOREIGN KEY (rol_id) REFERENCES roles(id) ON DELETE RESTRICT,
    INDEX idx_email (email),
    INDEX idx_activo (activo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLA: TIPOS_VEHICULO
-- ============================================
CREATE TABLE tipos_vehiculo (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion VARCHAR(255),
    capacidad_total INT NOT NULL,
    icono VARCHAR(50),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLA: ESPACIOS
-- ============================================
CREATE TABLE espacios (
    id INT PRIMARY KEY AUTO_INCREMENT,
    codigo VARCHAR(20) NOT NULL UNIQUE,
    tipo_vehiculo_id INT NOT NULL,
    disponible TINYINT(1) DEFAULT 1,
    piso INT DEFAULT 1,
    zona VARCHAR(10),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tipo_vehiculo_id) REFERENCES tipos_vehiculo(id) ON DELETE RESTRICT,
    INDEX idx_disponible (disponible),
    INDEX idx_tipo (tipo_vehiculo_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLA: TARIFAS
-- ============================================
CREATE TABLE tarifas (
    id INT PRIMARY KEY AUTO_INCREMENT,
    tipo_vehiculo_id INT NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    tipo_cobro ENUM('POR_MINUTO', 'POR_HORA', 'POR_DIA', 'FRACCION') DEFAULT 'POR_HORA',
    valor DECIMAL(10,2) NOT NULL,
    valor_fraccion DECIMAL(10,2),
    minutos_fraccion INT,
    activo TINYINT(1) DEFAULT 1,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE,
    descripcion TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tipo_vehiculo_id) REFERENCES tipos_vehiculo(id) ON DELETE RESTRICT,
    INDEX idx_activo (activo),
    INDEX idx_tipo (tipo_vehiculo_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLA: REGISTROS
-- ============================================
CREATE TABLE registros (
    id INT PRIMARY KEY AUTO_INCREMENT,
    placa VARCHAR(10) NOT NULL,
    tipo_vehiculo_id INT NOT NULL,
    espacio_id INT,
    fecha_hora_entrada DATETIME NOT NULL,
    fecha_hora_salida DATETIME,
    minutos_totales INT,
    tarifa_id INT,
    valor_calculado DECIMAL(10,2),
    descuento_porcentaje DECIMAL(5,2) DEFAULT 0,
    descuento_valor DECIMAL(10,2) DEFAULT 0,
    valor_final DECIMAL(10,2),
    estado ENUM('EN_CURSO', 'FINALIZADO', 'CANCELADO') DEFAULT 'EN_CURSO',
    observaciones TEXT,
    usuario_entrada_id INT NOT NULL,
    usuario_salida_id INT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tipo_vehiculo_id) REFERENCES tipos_vehiculo(id),
    FOREIGN KEY (espacio_id) REFERENCES espacios(id),
    FOREIGN KEY (tarifa_id) REFERENCES tarifas(id),
    FOREIGN KEY (usuario_entrada_id) REFERENCES usuarios(id),
    FOREIGN KEY (usuario_salida_id) REFERENCES usuarios(id),
    INDEX idx_placa (placa),
    INDEX idx_estado (estado),
    INDEX idx_fecha_entrada (fecha_hora_entrada),
    INDEX idx_usuario_entrada (usuario_entrada_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLA: TICKETS
-- ============================================
CREATE TABLE tickets (
    id INT PRIMARY KEY AUTO_INCREMENT,
    registro_id INT NOT NULL UNIQUE,
    codigo_ticket VARCHAR(50) NOT NULL UNIQUE,
    tipo_ticket ENUM('ENTRADA', 'SALIDA') NOT NULL,
    email_cliente VARCHAR(100),
    enviado_email TINYINT(1) DEFAULT 0,
    impreso TINYINT(1) DEFAULT 0,
    fecha_emision DATETIME DEFAULT CURRENT_TIMESTAMP,
    datos_json TEXT,
    FOREIGN KEY (registro_id) REFERENCES registros(id) ON DELETE CASCADE,
    INDEX idx_codigo (codigo_ticket),
    INDEX idx_registro (registro_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLA: TURNOS (Cierre de turno)
-- ============================================
CREATE TABLE turnos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id INT NOT NULL,
    fecha_inicio DATETIME NOT NULL,
    fecha_fin DATETIME,
    vehiculos_ingresados INT DEFAULT 0,
    vehiculos_egresados INT DEFAULT 0,
    total_recaudado DECIMAL(10,2) DEFAULT 0,
    estado ENUM('ABIERTO', 'CERRADO') DEFAULT 'ABIERTO',
    observaciones TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    INDEX idx_usuario (usuario_id),
    INDEX idx_estado (estado),
    INDEX idx_fecha_inicio (fecha_inicio)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- TABLA: MENSUALIDADES (Clientes frecuentes)
-- ============================================
CREATE TABLE mensualidades (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre_cliente VARCHAR(100) NOT NULL,
    telefono VARCHAR(20),
    email VARCHAR(100),
    placa VARCHAR(10) NOT NULL,
    tipo_vehiculo_id INT NOT NULL,
    valor_mensual DECIMAL(10,2) NOT NULL,
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE NOT NULL,
    activo TINYINT(1) DEFAULT 1,
    observaciones TEXT,
    usuario_registro_id INT NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tipo_vehiculo_id) REFERENCES tipos_vehiculo(id),
    FOREIGN KEY (usuario_registro_id) REFERENCES usuarios(id),
    INDEX idx_placa (placa),
    INDEX idx_activo (activo),
    INDEX idx_vigencia (fecha_inicio, fecha_fin)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- INSERTAR DATOS INICIALES
-- ============================================

-- ROLES
INSERT INTO roles (nombre, descripcion) VALUES
('Administrador', 'Acceso total al sistema'),
('Operario', 'Registro de entrada/salida de vehículos');

-- TIPOS DE VEHÍCULO (según documento: 30 autos, 15 motos)
INSERT INTO tipos_vehiculo (nombre, descripcion, capacidad_total, icono) VALUES
('Sedán', 'Vehículo tipo sedán', 15, 'fa-car'),
('Camioneta', 'Vehículo tipo camioneta o SUV', 15, 'fa-truck-pickup'),
('Motocicleta', 'Motocicleta', 15, 'fa-motorcycle');

-- ESPACIOS (30 autos: 15 sedán + 15 camioneta, 15 motos)
-- Sedán (1-15)
INSERT INTO espacios (codigo, tipo_vehiculo_id, piso, zona) 
SELECT CONCAT('S', LPAD(n, 3, '0')), 1, 
       CASE WHEN n <= 8 THEN 1 ELSE 2 END,
       CASE WHEN n <= 8 THEN 'A' ELSE 'B' END
FROM (
    SELECT 1 n UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5
    UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10
    UNION SELECT 11 UNION SELECT 12 UNION SELECT 13 UNION SELECT 14 UNION SELECT 15
) numbers;

-- Camioneta (16-30)
INSERT INTO espacios (codigo, tipo_vehiculo_id, piso, zona) 
SELECT CONCAT('C', LPAD(n, 3, '0')), 2,
       CASE WHEN n <= 8 THEN 1 ELSE 2 END,
       CASE WHEN n <= 8 THEN 'A' ELSE 'B' END
FROM (
    SELECT 1 n UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5
    UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10
    UNION SELECT 11 UNION SELECT 12 UNION SELECT 13 UNION SELECT 14 UNION SELECT 15
) numbers;

-- Motocicleta (1-15)
INSERT INTO espacios (codigo, tipo_vehiculo_id, piso, zona) 
SELECT CONCAT('M', LPAD(n, 3, '0')), 3, 1, 'M'
FROM (
    SELECT 1 n UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5
    UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9 UNION SELECT 10
    UNION SELECT 11 UNION SELECT 12 UNION SELECT 13 UNION SELECT 14 UNION SELECT 15
) numbers;

-- TARIFAS INICIALES
INSERT INTO tarifas (tipo_vehiculo_id, nombre, tipo_cobro, valor, valor_fraccion, minutos_fraccion, activo, fecha_inicio) VALUES
(1, 'Tarifa Sedán por Hora', 'POR_HORA', 3000.00, 500.00, 15, 1, '2025-01-01'),
(2, 'Tarifa Camioneta por Hora', 'POR_HORA', 4000.00, 700.00, 15, 1, '2025-01-01'),
(3, 'Tarifa Moto por Hora', 'POR_HORA', 2000.00, 400.00, 15, 1, '2025-01-01');

-- USUARIOS INICIALES (password: admin123 y operario123)
-- Nota: Los passwords se encriptarán con bcrypt en el seed script
INSERT INTO usuarios (nombre, email, password_hash, rol_id, telefono, activo) VALUES
('Administrador Sistema', 'admin@parking.com', '$2b$10$placeholder', 1, '3001234567', 1),
('Operario Principal', 'operario@parking.com', '$2b$10$placeholder', 2, '3009876543', 1);

-- ============================================
-- VISTAS ÚTILES
-- ============================================

-- Vista de espacios disponibles por tipo
CREATE VIEW vista_disponibilidad AS
SELECT 
    tv.id,
    tv.nombre as tipo_vehiculo,
    tv.capacidad_total,
    COUNT(e.id) as total_espacios,
    SUM(CASE WHEN e.disponible = 1 THEN 1 ELSE 0 END) as disponibles,
    SUM(CASE WHEN e.disponible = 0 THEN 1 ELSE 0 END) as ocupados,
    ROUND((SUM(CASE WHEN e.disponible = 1 THEN 1 ELSE 0 END) / COUNT(e.id)) * 100, 2) as porcentaje_disponible
FROM tipos_vehiculo tv
LEFT JOIN espacios e ON tv.id = e.tipo_vehiculo_id
GROUP BY tv.id, tv.nombre, tv.capacidad_total;

-- Vista de vehículos activos
CREATE VIEW vista_vehiculos_activos AS
SELECT 
    r.id,
    r.placa,
    tv.nombre as tipo_vehiculo,
    e.codigo as espacio,
    r.fecha_hora_entrada,
    TIMESTAMPDIFF(MINUTE, r.fecha_hora_entrada, NOW()) as minutos_transcurridos,
    t.nombre as tarifa,
    t.tipo_cobro,
    t.valor as valor_tarifa,
    u.nombre as operario_entrada
FROM registros r
INNER JOIN tipos_vehiculo tv ON r.tipo_vehiculo_id = tv.id
LEFT JOIN espacios e ON r.espacio_id = e.id
LEFT JOIN tarifas t ON r.tarifa_id = t.id
INNER JOIN usuarios u ON r.usuario_entrada_id = u.id
WHERE r.estado = 'EN_CURSO'
ORDER BY r.fecha_hora_entrada DESC;

-- ============================================
-- PROCEDIMIENTOS ALMACENADOS
-- ============================================

DELIMITER $$

-- Procedimiento para calcular tarifa
CREATE PROCEDURE sp_calcular_tarifa(
    IN p_minutos INT,
    IN p_tarifa_id INT,
    OUT p_valor_total DECIMAL(10,2)
)
BEGIN
    DECLARE v_tipo_cobro VARCHAR(20);
    DECLARE v_valor DECIMAL(10,2);
    DECLARE v_valor_fraccion DECIMAL(10,2);
    DECLARE v_minutos_fraccion INT;
    
    SELECT tipo_cobro, valor, valor_fraccion, minutos_fraccion
    INTO v_tipo_cobro, v_valor, v_valor_fraccion, v_minutos_fraccion
    FROM tarifas WHERE id = p_tarifa_id;
    
    IF v_tipo_cobro = 'POR_HORA' THEN
        SET p_valor_total = CEIL(p_minutos / 60.0) * v_valor;
    ELSEIF v_tipo_cobro = 'POR_MINUTO' THEN
        SET p_valor_total = p_minutos * v_valor;
    ELSEIF v_tipo_cobro = 'FRACCION' THEN
        SET p_valor_total = CEIL(p_minutos / v_minutos_fraccion) * v_valor_fraccion;
    ELSEIF v_tipo_cobro = 'POR_DIA' THEN
        SET p_valor_total = CEIL(p_minutos / 1440.0) * v_valor;
    END IF;
END$$

DELIMITER ;

-- ============================================
-- ÍNDICES ADICIONALES PARA PERFORMANCE
-- ============================================

CREATE INDEX idx_registros_entrada_fecha ON registros(fecha_hora_entrada);
CREATE INDEX idx_registros_salida_fecha ON registros(fecha_hora_salida);
CREATE INDEX idx_tickets_fecha ON tickets(fecha_emision);

-- ============================================
-- FIN DEL SCRIPT
-- ============================================
