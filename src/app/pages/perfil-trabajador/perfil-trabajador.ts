import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { TrabajadorNavbarComponent } from '../../components/trabajador-navbar/trabajador-navbar';

@Component({
  selector: 'app-perfil-trabajador',
  imports: [FormsModule, TrabajadorNavbarComponent],
  templateUrl: './perfil-trabajador.html',
  styleUrl: './perfil-trabajador.css',
})
export class PerfilTrabajadorComponent {
  nombre = 'Usuario';
  documento = '5555555555';
  tipo = 'Trabajador';
  telefono = '3148752222';

  parqueaderoNombre = 'Parqueadero Biblioteca';
  parqueaderoDesde = '19/02/2026';

  modalEditar = false;
  editNombre = '';
  editDocumento = '';
  editTipo = '';
  editTelefono = '';

  openEditar(): void {
    this.editNombre = this.nombre;
    this.editDocumento = this.documento;
    this.editTipo = this.tipo;
    this.editTelefono = this.telefono;
    this.modalEditar = true;
  }

  closeEditar(): void {
    this.modalEditar = false;
  }

  guardar(): void {
    this.nombre = this.editNombre.trim() || this.nombre;
    this.documento = this.editDocumento.trim() || this.documento;
    this.tipo = this.editTipo.trim() || this.tipo;
    this.telefono = this.editTelefono.trim() || this.telefono;
    this.closeEditar();
  }

  async solicitarCambio(): Promise<void> {
    await Swal.fire({
      title: 'Solicitud enviada',
      text: 'Tu solicitud de cambio de parqueadero fue registrada para revisión.',
      icon: 'info',
      confirmButtonText: 'ACEPTAR',
      confirmButtonColor: '#0069a3',
    });
  }

  async reportarProblema(): Promise<void> {
    await Swal.fire({
      title: 'Reporte',
      text: 'Se abrirá el canal de soporte para reportar incidencias (demo).',
      icon: 'warning',
      confirmButtonText: 'ACEPTAR',
      confirmButtonColor: '#f2d03b',
      color: '#1a2d4d',
    });
  }

  async verReglas(): Promise<void> {
    await Swal.fire({
      title: 'Reglas del parqueadero',
      text: 'Consulta el reglamento institucional de parqueaderos en la intranet UAM (contenido de demostración).',
      icon: 'info',
      confirmButtonText: 'ACEPTAR',
      confirmButtonColor: '#0069a3',
    });
  }
}
