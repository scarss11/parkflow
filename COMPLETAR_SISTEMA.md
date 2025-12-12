# 🔧 COMPLETAR PARKFLOW - PÁGINAS FALTANTES

## 📋 ESTADO ACTUAL

### ✅ COMPLETO:
- ✅ Backend 100% funcional (6 controllers)
- ✅ Base de datos completa (7 tablas)
- ✅ CSS con diseño ParkFlow
- ✅ JavaScript compartido (app.js)
- ✅ index.html (Login) - FUNCIONAL
- ✅ dashboard.html - FUNCIONAL
- ✅ entrada.html - FUNCIONAL CON LAYOUT CORRECTO

### ⚠️ POR COMPLETAR:
- ⏳ salida.html - Tiene contenido pero SIN sidebar
- ⏳ activos.html - Tiene contenido pero SIN sidebar  
- ❌ cupos.html - VACÍO (0 bytes)
- ❌ tarifas.html - VACÍO (0 bytes)
- ❌ usuarios.html - VACÍO (0 bytes)
- ❌ reportes.html - VACÍO (0 bytes)

---

## 🎯 OBJETIVO

Que TODAS las páginas tengan:
1. **Sidebar izquierda** (como entrada.html)
2. **Contenido derecha** (como dashboard)
3. **Mismo diseño** (cards, stats, tablas)
4. **Conectadas a BD** (con endpoints del backend)

---

## 📝 PLANTILLA BASE

Cada página debe empezar así:

```html
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>[TÍTULO] - ParkFlow</title>
    <link rel="stylesheet" href="css/styles.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body>
    <div class="app-layout">
        <!-- COPIAR SIDEBAR COMPLETO DE entrada.html -->
        <aside class="sidebar" id="sidebar">
            ...TODO EL SIDEBAR...
        </aside>

        <!-- MAIN CONTENT -->
        <main class="main-content">
            <div class="topbar">
                <div>
                    <div class="topbar-title">[ICONO] [TÍTULO DE LA PÁGINA]</div>
                    <div class="topbar-subtitle">[DESCRIPCIÓN]</div>
                </div>
            </div>

            <div class="content-area">
                <!-- AQUÍ VA EL CONTENIDO ESPECÍFICO -->
            </div>
        </main>
    </div>

    <script src="js/app.js"></script>
    <script>
        // JavaScript específico de la página
    </script>
</body>
</html>
```

---

## 🔨 PÁGINAS POR CREAR

### 1️⃣ CUPOS.HTML

**Título:** 🅿️ Consultar Cupos Disponibles

**Contenido:**
```html
<div class="content-area">
    <!-- Stats Grid -->
    <div class="stats-grid">
        <div class="stat-card">
            <div class="stat-icon purple"><i class="fas fa-car"></i></div>
            <div class="stat-label">Sedanes</div>
            <div class="stat-value" id="sedanDisponible">0</div>
            <small>de 15 espacios</small>
        </div>
        <!-- Repetir para Camioneta y Moto -->
    </div>

    <!-- Cards de Disponibilidad -->
    <div class="card">
        <div class="card-header">
            <div class="card-title">
                <i class="fas fa-square-parking"></i> Disponibilidad por Tipo
            </div>
        </div>
        <div id="disponibilidadDetalle"></div>
    </div>
</div>
```

**JavaScript:**
```javascript
async function cargarCupos() {
    const response = await fetch(`${API_URL}/vehiculos/estadisticas`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    
    if (data.success) {
        // Actualizar stats
        data.estadisticas.disponibilidad.forEach(disp => {
            // Mostrar en cards
        });
    }
}

// Auto-refresh
setInterval(cargarCupos, 30000);
```

---

### 2️⃣ TARIFAS.HTML

**Título:** 🏷️ Gestión de Tarifas

**Contenido:**
```html
<div class="content-area">
    <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 24px;">
        <!-- Tabla de tarifas -->
        <div class="card">
            <div class="card-header">
                <div class="card-title">
                    <i class="fas fa-list"></i> Tarifas Configuradas
                </div>
            </div>
            <table class="table">
                <thead>
                    <tr>
                        <th>Tipo Vehículo</th>
                        <th>Tipo Cobro</th>
                        <th>Valor</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody id="tablaTarifas"></tbody>
            </table>
        </div>

        <!-- Formulario -->
        <div class="card">
            <div class="card-header">
                <div class="card-title">
                    <i class="fas fa-plus"></i> <span id="formTitulo">Nueva Tarifa</span>
                </div>
            </div>
            <form id="tarifaForm">
                <!-- Campos del formulario -->
            </form>
        </div>
    </div>
</div>
```

**JavaScript:**
```javascript
async function cargarTarifas() {
    const response = await fetch(`${API_URL}/tarifas`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    
    if (data.success) {
        mostrarTarifas(data.tarifas);
    }
}

async function crearTarifa(datos) {
    const response = await fetch(`${API_URL}/tarifas`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(datos)
    });
    // Manejar respuesta
}
```

---

### 3️⃣ USUARIOS.HTML

**Título:** 👥 Gestión de Usuarios

**Contenido:**
```html
<div class="content-area">
    <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 24px;">
        <!-- Tabla de usuarios -->
        <div class="card">
            <div class="card-header">
                <div class="card-title">
                    <i class="fas fa-users"></i> Usuarios del Sistema
                </div>
            </div>
            <table class="table">
                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>Email</th>
                        <th>Rol</th>
                        <th>Estado</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody id="tablaUsuarios"></tbody>
            </table>
        </div>

        <!-- Formulario -->
        <div class="card">
            <div class="card-header">
                <div class="card-title">
                    <i class="fas fa-user-plus"></i> Nuevo Usuario
                </div>
            </div>
            <form id="usuarioForm">
                <!-- Campos: nombre, email, password, rol -->
            </form>
        </div>
    </div>
</div>
```

**JavaScript:**
```javascript
async function cargarUsuarios() {
    const response = await fetch(`${API_URL}/usuarios`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    
    if (data.success) {
        mostrarUsuarios(data.usuarios);
    }
}
```

---

### 4️⃣ REPORTES.HTML

**Título:** 📊 Reportes y Estadísticas

**Contenido:**
```html
<div class="content-area">
    <!-- Filtros -->
    <div class="card">
        <div class="card-header">
            <div class="card-title">
                <i class="fas fa-filter"></i> Filtros
            </div>
        </div>
        <form id="filtrosForm" style="display: grid; grid-template-columns: 1fr 1fr 1fr auto; gap: 16px;">
            <input type="date" id="fechaInicio" class="form-input">
            <input type="date" id="fechaFin" class="form-input">
            <button type="submit" class="btn btn-primary">
                <i class="fas fa-search"></i> Buscar
            </button>
        </form>
    </div>

    <!-- Stats -->
    <div class="stats-grid">
        <div class="stat-card">
            <div class="stat-icon green"><i class="fas fa-dollar-sign"></i></div>
            <div class="stat-label">Total Ingresos</div>
            <div class="stat-value" id="totalIngresos">$0</div>
        </div>
        <!-- Más stats -->
    </div>

    <!-- Tabla de registros -->
    <div class="card">
        <div class="card-header">
            <div class="card-title">
                <i class="fas fa-table"></i> Historial de Transacciones
            </div>
        </div>
        <table class="table">
            <thead>
                <tr>
                    <th>Fecha</th>
                    <th>Placa</th>
                    <th>Tipo</th>
                    <th>Tiempo</th>
                    <th>Monto</th>
                </tr>
            </thead>
            <tbody id="tablaHistorial"></tbody>
        </table>
    </div>
</div>
```

**JavaScript:**
```javascript
async function cargarReportes(fechaInicio, fechaFin) {
    const response = await fetch(
        `${API_URL}/reportes/ingresos?fecha_inicio=${fechaInicio}&fecha_fin=${fechaFin}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
    );
    const data = await response.json();
    
    if (data.success) {
        mostrarReportes(data.reporte);
    }
}
```

---

## 🔄 ADAPTAR SALIDA.HTML Y ACTIVOS.HTML

Estas páginas YA tienen contenido, solo necesitan:

1. **Agregar el sidebar completo** (copiar de entrada.html)
2. **Cambiar estructura:**

```html
<!-- ANTES -->
<body>
    <nav>...</nav>
    <div class="container">
        ...contenido...
    </div>
</body>

<!-- DESPUÉS -->
<body>
    <div class="app-layout">
        <aside class="sidebar">...</aside>
        <main class="main-content">
            <div class="topbar">...</div>
            <div class="content-area">
                ...contenido...
            </div>
        </main>
    </div>
</body>
```

---

## ✅ CHECKLIST

Para cada página:
- [ ] Tiene `<div class="app-layout">`
- [ ] Tiene `<aside class="sidebar">` completo
- [ ] Sidebar marca página activa con `class="active"`
- [ ] Tiene `<main class="main-content">`
- [ ] Tiene `<div class="topbar">` con título
- [ ] Tiene `<div class="content-area">` con contenido
- [ ] Incluye `<script src="js/app.js"></script>`
- [ ] Está conectada a endpoints del backend
- [ ] Tiene auto-refresh (si aplica)

---

## 🎯 RESULTADO ESPERADO

Cuando termines, TODAS las páginas deben verse así:

```
┌─────────────┬──────────────────────────────┐
│             │  📊 [TÍTULO DE LA PÁGINA]    │
│   SIDEBAR   │  [Subtítulo]                 │
│   MORADO    ├──────────────────────────────┤
│             │                              │
│ Dashboard ← │   [Stats Cards]              │
│ Entrada     │                              │
│ Salida      │   [Contenido Principal]      │
│ Activos     │                              │
│ Cupos       │   [Tablas / Formularios]     │
│ Tarifas     │                              │
│ Usuarios    │                              │
│ Reportes    │                              │
│             │                              │
│ [Colapsar]  │                              │
│ [Salir]     │                              │
└─────────────┴──────────────────────────────┘
```

---

## 📞 SOPORTE

**Referencia:**
- Ver `frontend/entrada.html` para estructura completa
- Ver `frontend/css/styles.css` para clases disponibles
- Ver `frontend/js/app.js` para funciones compartidas

**Endpoints backend:**
- Ver `backend/routes/` para rutas disponibles
- Ver `backend/controllers/` para lógica de negocio

---

¡Éxito completando el sistema! 🚀
