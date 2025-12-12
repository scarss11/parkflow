# 🚀 PARKFLOW - INSTALACIÓN PASO A PASO

## SENA - NODO TIC 2025

---

## ⚡ INSTALACIÓN RÁPIDA (5 MINUTOS)

### PASO 1: Extraer (30 seg)
```bash
tar -xzf parkflow-COMPLETO.tar.gz
cd parkflow
```

### PASO 2: Base de Datos (2 min)
```bash
mysql -u root -p < database/schema.sql
```

### PASO 3: Backend (2 min)
```bash
cd backend
npm install
cp .env.example .env
notepad .env  # Cambiar DB_PASSWORD
npm run seed
npm start
```

### PASO 4: Frontend (30 seg)
```
Abrir frontend/index.html con Live Server
```

### PASO 5: Login (10 seg)
```
http://localhost:5500
admin@parking.com / admin123
```

---

## 📋 AJUSTES IMPLEMENTADOS

### ✅ AJUSTE 1: Estilo Dashboard en TODO

**Antes:** Solo el dashboard tenía buen diseño
**Ahora:** TODAS las páginas tienen el mismo estilo profesional

- ✅ entrada.html
- ✅ salida.html
- ✅ activos.html
- ✅ cupos.html
- ✅ tarifas.html
- ✅ usuarios.html
- ✅ reportes.html

**Características:**
- Cards con sombra
- Stats cards con iconos de colores
- Tablas profesionales
- Botones consistentes
- Formularios bien diseñados

---

### ✅ AJUSTE 2: Conexión a Base de Datos

**Todas las páginas consumen datos reales:**

#### Usuarios (usuarios.html)
```javascript
// Muestra usuarios creados en la BD
GET /api/usuarios
- Lista completa de usuarios
- Roles asignados
- Estado activo/inactivo
- Opciones: crear, editar, eliminar
```

#### Tarifas (tarifas.html)
```javascript
// Muestra tarifas configuradas
GET /api/tarifas
- Tarifa por tipo de vehículo
- Tipo de cobro (hora/minuto/día)
- Valor configurado
- Fechas de vigencia
- Opciones: crear, editar, eliminar
```

#### Cupos (cupos.html)
```javascript
// Disponibilidad en tiempo real
GET /api/vehiculos/estadisticas
- Sedanes: X/15 disponibles
- Camionetas: X/15 disponibles
- Motos: X/15 disponibles
- Gráficos de ocupación
- Auto-refresh cada 30 seg
```

#### Reportes (reportes.html)
```javascript
// Datos reales de registros
GET /api/reportes/ingresos
GET /api/reportes/historial
- Ingresos por fecha
- Vehículos atendidos
- Tiempo promedio
- Gráficos y estadísticas
```

---

### ✅ AJUSTE 3: Sidebar Mejorado

#### Problema 1: Scroll Extraño
**Antes:** Scroll visible todo el tiempo
**Ahora:** 
```css
.sidebar-nav {
    overflow-y: auto;  /* Solo cuando sea necesario */
    overflow-x: hidden;
}

/* Scrollbar sutil */
.sidebar-nav::-webkit-scrollbar {
    width: 4px;
}
```

#### Problema 2: Botón Colapsar
**Antes:** Mostraba texto al colapsar
**Ahora:** Solo muestra el icono
```css
.sidebar.collapsed .sidebar-toggle-btn span {
    opacity: 0;
    width: 0;
}
```

#### Problema 3: Página Activa
**Antes:** No se sabía dónde estabas
**Ahora:** Sombreado y marca visual
```css
.sidebar-nav-item.active {
    background: rgba(255,255,255,0.15);
    font-weight: 600;
    box-shadow: inset 4px 0 0 white;
}
```

**JavaScript automático:**
```javascript
// Marca la página actual
function marcarPaginaActiva() {
    const currentPage = window.location.pathname.split('/').pop();
    document.querySelectorAll('.sidebar-nav-item').forEach(item => {
        if (item.getAttribute('data-page') === currentPage) {
            item.classList.add('active');
        }
    });
}
```

---

### ✅ AJUSTE 4: Nombre Único

**Antes:** "Parqueadero NU"
**Ahora:** **ParkFlow**

Flujo inteligente de parqueadero

Cambiado en:
- ✅ Todos los archivos HTML
- ✅ CSS
- ✅ JavaScript
- ✅ Documentación
- ✅ Backend

---

### ✅ AJUSTE 5: Backend Completo

**Cada módulo tiene su controller:**

#### 1. authController.js
```javascript
POST /api/auth/login          // Login JWT
GET  /api/auth/verify         // Verificar token
POST /api/auth/change-password // Cambiar password
```

#### 2. vehiculoController.js
```javascript
GET  /api/vehiculos/estadisticas // Dashboard stats
GET  /api/vehiculos/activos      // Vehículos activos
GET  /api/vehiculos/tipos        // Tipos disponibles
GET  /api/vehiculos/buscar/:placa // Buscar vehículo
POST /api/vehiculos/entrada      // Registrar entrada
POST /api/vehiculos/salida       // Registrar salida
```

#### 3. tarifaController.js
```javascript
GET    /api/tarifas     // Listar tarifas
POST   /api/tarifas     // Crear tarifa
PUT    /api/tarifas/:id // Actualizar tarifa
DELETE /api/tarifas/:id // Eliminar tarifa
```

#### 4. turnoController.js
```javascript
POST /api/turnos/abrir    // Abrir turno
GET  /api/turnos/activo   // Turno actual
POST /api/turnos/cerrar   // Cerrar turno
GET  /api/turnos/historial // Historial
```

#### 5. usuarioController.js
```javascript
GET    /api/usuarios           // Listar usuarios
GET    /api/usuarios/roles     // Listar roles
POST   /api/usuarios           // Crear usuario
PUT    /api/usuarios/:id       // Actualizar usuario
DELETE /api/usuarios/:id       // Eliminar usuario
PUT    /api/usuarios/:id/password // Cambiar password
```

#### 6. reporteController.js
```javascript
GET /api/reportes/ingresos  // Reporte de ingresos
GET /api/reportes/historial // Historial completo
GET /api/reportes/turnos    // Reporte de turnos
```

---

## 🎯 PRUEBA COMPLETA DEL SISTEMA

### 1. Login
```
http://localhost:5500
admin@parking.com / admin123
```

### 2. Dashboard
- ✅ Ver estadísticas
- ✅ Disponibilidad de espacios
- ✅ Vehículos activos (vacío inicialmente)

### 3. Registrar Entrada
- Click "Registrar Entrada"
- Placa: ABC123
- Tipo: Sedán
- ✅ Se asigna espacio automáticamente

### 4. Ver Vehículos Activos
- Click "Vehículos Activos"
- ✅ ABC123 aparece en la lista
- ✅ Se actualiza solo cada 30 seg

### 5. Consultar Cupos
- Click "Consultar Cupos"
- ✅ Sedán: 14/15 (uno ocupado)
- ✅ Actualización en tiempo real

### 6. Gestión de Tarifas (Admin)
- Click "Gestión de Tarifas"
- ✅ Lista de tarifas actuales
- ✅ Crear/Editar/Eliminar

### 7. Gestión de Usuarios (Admin)
- Click "Gestión de Usuarios"
- ✅ Lista de usuarios
- ✅ Crear nuevos usuarios
- ✅ Cambiar roles

### 8. Registrar Salida
- Click "Registrar Salida"
- Buscar: ABC123
- ✅ Muestra tiempo transcurrido
- ✅ Calcula monto automáticamente
- Cobrar
- ✅ Libera el espacio

### 9. Reportes (Admin)
- Click "Reportes"
- ✅ Ingresos del día
- ✅ Ingresos del mes
- ✅ Vehículos atendidos
- ✅ Gráficos

### 10. Volver al Dashboard
- ✅ Estadísticas actualizadas
- ✅ Ingresos reflejados
- ✅ Cupos disponibles: 15/15

---

## 📱 RESPONSIVE

✅ Desktop (1920px+)
✅ Laptop (1366px)
✅ Tablet (768px)
✅ Móvil (375px)

En móvil:
- Sidebar oculto por defecto
- Botón de menú para mostrar
- Todo funcional

---

## 🎨 DISEÑO

### Colores ParkFlow
```css
--primary: #820AD1;      /* Morado */
--primary-dark: #6B0BB3; /* Morado oscuro */
--success: #00C853;      /* Verde */
--warning: #FFB300;      /* Naranja */
--info: #00B0FF;         /* Azul */
```

### Sidebar
```
235px (normal) → 70px (colapsado)
Animación: 0.3s cubic-bezier
```

---

## ❌ SOLUCIÓN DE PROBLEMAS

### Backend no inicia
```bash
# Verificar MySQL
services.msc → MySQL debe estar "Iniciado"

# Verificar .env
notepad backend/.env
# DB_PASSWORD debe ser correcta

# Puerto ocupado
netstat -ano | findstr :3000
taskkill /PID [NUMERO] /F
```

### Frontend no carga datos
```bash
# Verificar backend esté corriendo
# Ver terminal: debe decir "Servidor iniciado"

# Abrir consola navegador (F12)
# Ver errores en rojo

# Verificar API_URL en js/app.js
const API_URL = 'http://localhost:3000/api';
```

### Página activa no se marca
```bash
# Verificar que cada página tenga:
<script src="js/app.js"></script>

# Y que los links tengan data-page:
<a href="dashboard.html" data-page="dashboard">
```

---

## 📦 CONTENIDO DEL PAQUETE

```
parkflow-COMPLETO.tar.gz
├── backend/
│   ├── config/database.js
│   ├── controllers/ (6 archivos)
│   ├── middleware/auth.js
│   ├── routes/ (6 archivos)
│   ├── models/seed.js
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── css/styles.css
│   ├── js/app.js
│   ├── index.html (login)
│   ├── dashboard.html
│   ├── entrada.html
│   ├── salida.html
│   ├── activos.html
│   ├── cupos.html
│   ├── tarifas.html
│   ├── usuarios.html
│   └── reportes.html
├── database/schema.sql
├── README.md
└── INSTALACION.md
```

---

## 🎓 PARA PRESENTACIÓN SENA

**Mencionar:**
- ✅ "Sistema ParkFlow con diseño profesional"
- ✅ "Sidebar minimalista en todas las páginas"
- ✅ "Página activa con sombreado visual"
- ✅ "Sin botones de actualizar innecesarios"
- ✅ "Auto-refresh inteligente cada 30 segundos"
- ✅ "Backend completo con 6 controllers"
- ✅ "Base de datos normalizada con 7 tablas"
- ✅ "Seguridad con JWT y Bcrypt"

**Demostrar:**
1. Login con diseño limpio
2. Dashboard con estadísticas
3. Sidebar que colapsa
4. Página activa marcada
5. Registrar entrada
6. Ver actualización automática
7. Registrar salida con cálculo
8. Gestión de tarifas (admin)
9. Gestión de usuarios (admin)
10. Reportes con gráficos

---

## ✅ CHECKLIST FINAL

- ✅ Todas las páginas con mismo diseño
- ✅ Todas las páginas conectadas a BD
- ✅ Sidebar sin scroll extraño
- ✅ Colapsar solo muestra icono
- ✅ Página activa con sombreado
- ✅ Nombre único: ParkFlow
- ✅ Backend completo para cada módulo
- ✅ Auto-refresh funcionando
- ✅ Responsive completo
- ✅ Documentación detallada

---

**¡SISTEMA 100% COMPLETO!**

*Desarrollado con ❤️ para SENA - NODO TIC 2025*
