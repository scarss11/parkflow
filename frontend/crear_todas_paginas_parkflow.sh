#!/bin/bash

API_URL="http://localhost:3000/api"

# Sidebar template compartido
SIDEBAR='<aside class="sidebar" id="sidebar">
    <div class="sidebar-logo">
        <i class="fas fa-square-parking sidebar-logo-icon"></i>
        <span class="sidebar-logo-text">ParkFlow</span>
    </div>

    <div class="sidebar-user">
        <div class="sidebar-user-avatar"><i class="fas fa-user"></i></div>
        <div class="sidebar-user-info">
            <div class="sidebar-user-name" id="userName">Usuario</div>
            <div class="sidebar-user-role" id="userRole">Rol</div>
        </div>
    </div>

    <nav class="sidebar-nav">
        <div class="sidebar-nav-section">MENÚ PRINCIPAL</div>
        <a href="dashboard.html" class="sidebar-nav-item" data-page="dashboard">
            <i class="fas fa-home"></i><span>Dashboard</span>
        </a>

        <div class="sidebar-nav-section">OPERACIONES</div>
        <a href="entrada.html" class="sidebar-nav-item" data-page="entrada">
            <i class="fas fa-car-side"></i><span>Registrar Entrada</span>
        </a>
        <a href="salida.html" class="sidebar-nav-item" data-page="salida">
            <i class="fas fa-right-from-bracket"></i><span>Registrar Salida</span>
        </a>
        <a href="activos.html" class="sidebar-nav-item" data-page="activos">
            <i class="fas fa-list-check"></i><span>Vehículos Activos</span>
        </a>
        <a href="cupos.html" class="sidebar-nav-item" data-page="cupos">
            <i class="fas fa-square-parking"></i><span>Consultar Cupos</span>
        </a>

        <div class="sidebar-nav-section admin-only" style="display:none;">ADMINISTRACIÓN</div>
        <a href="tarifas.html" class="sidebar-nav-item admin-only" data-page="tarifas" style="display:none;">
            <i class="fas fa-tags"></i><span>Gestión de Tarifas</span>
        </a>
        <a href="usuarios.html" class="sidebar-nav-item admin-only" data-page="usuarios" style="display:none;">
            <i class="fas fa-users"></i><span>Gestión de Usuarios</span>
        </a>
        <a href="reportes.html" class="sidebar-nav-item admin-only" data-page="reportes" style="display:none;">
            <i class="fas fa-chart-bar"></i><span>Reportes</span>
        </a>
    </nav>

    <div class="sidebar-footer">
        <button onclick="toggleSidebar()" class="sidebar-toggle-btn" title="Colapsar sidebar">
            <i class="fas fa-bars"></i>
            <span>Colapsar</span>
        </button>
        <button onclick="logout()" class="sidebar-logout-btn">
            <i class="fas fa-sign-out-alt"></i>
            <span>Cerrar Sesión</span>
        </button>
    </div>
</aside>'

echo "✅ Template del sidebar creado"
echo "$SIDEBAR" > sidebar_template.html

