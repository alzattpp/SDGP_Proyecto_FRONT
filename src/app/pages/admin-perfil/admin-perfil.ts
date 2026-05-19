import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminNavbarComponent } from '../../components/admin-navbar/admin-navbar';
import { AdministradorService } from '../../services/administrador/administrador.service';
import { mapUsuarioMe } from '../../services/usuarios/map-usuario-me';

@Component({
  selector: 'app-admin-perfil',
  imports: [FormsModule, AdminNavbarComponent],
  templateUrl: './admin-perfil.html',
  styleUrl: './admin-perfil.css',
})
export class AdminPerfilComponent implements OnInit {
  private readonly administradorService = inject(AdministradorService);

  nombre = '—';
  documento = '—';
  telefono = '—';
  tipo = 'Administrador';
  ultimoAcceso = '—';
  perfilCargando = true;
  perfilError: string | null = null;

  modalEditar = false;
  editNombre = '';
  editDocumento = '';
  editTelefono = '';
  editTipo = '';

  modalClave = false;
  nuevaClave = '';
  repetirClave = '';

  ngOnInit(): void {
    this.administradorService.getCurrentAdministrador().subscribe({
      next: (raw) => {
        const v = mapUsuarioMe(raw);
        this.nombre = v.nombre;
        this.documento = v.documento;
        this.telefono = v.telefono;
        this.tipo = v.tipo;
        this.perfilError = null;
        this.perfilCargando = false;
      },
      error: () => {
        this.perfilError = 'No se pudo cargar el perfil. ¿Iniciaste sesión como administrador?';
        this.perfilCargando = false;
      },
    });
  }

  openEditar(): void {
    this.editNombre = this.nombre;
    this.editDocumento = this.documento;
    this.editTelefono = this.telefono;
    this.editTipo = this.tipo;
    this.modalEditar = true;
  }

  closeEditar(): void {
    this.modalEditar = false;
  }

  guardarDatos(): void {
    this.nombre = this.editNombre.trim() || this.nombre;
    this.documento = this.editDocumento.trim() || this.documento;
    this.telefono = this.editTelefono.trim() || this.telefono;
    this.tipo = this.editTipo.trim() || this.tipo;
    this.closeEditar();
  }

  openClave(): void {
    this.nuevaClave = '';
    this.repetirClave = '';
    this.modalClave = true;
  }

  closeClave(): void {
    this.modalClave = false;
  }

  guardarClave(): void {
    if (!this.nuevaClave || this.nuevaClave !== this.repetirClave) return;
    this.closeClave();
  }

  modalReporte = false;
  reporteCategoria = 'Sistema / acceso';
  reportePrioridad = 'Media';
  reporteDescripcion = '';
  reporteCorreo = '';
  reporteEnviado = false;

  openReporte(): void {
    this.reporteCategoria = 'Sistema / acceso';
    this.reportePrioridad = 'Media';
    this.reporteDescripcion = '';
    this.reporteCorreo = '';
    this.reporteEnviado = false;
    this.modalReporte = true;
  }

  closeReporte(): void {
    this.modalReporte = false;
  }

  enviarReporte(): void {
    if (!this.reporteDescripcion.trim()) return;
    this.reporteEnviado = true;
  }

  nuevaQueja(): void {
    this.reporteEnviado = false;
    this.reporteDescripcion = '';
  }
}
