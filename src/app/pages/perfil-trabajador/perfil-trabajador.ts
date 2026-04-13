import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { TrabajadorNavbarComponent } from '../../components/trabajador-navbar/trabajador-navbar';
import { mapUsuarioMe } from '../../services/usuarios/map-usuario-me';
import { TrabajadorService } from '../../services/trabajador/trabajador.service';

@Component({
  selector: 'app-perfil-trabajador',
  imports: [FormsModule, TrabajadorNavbarComponent],
  templateUrl: './perfil-trabajador.html',
  styleUrl: './perfil-trabajador.css',
})
export class PerfilTrabajadorComponent implements OnInit {
  private readonly trabajadorService = inject(TrabajadorService);

  readonly nombre = signal('Usuario');
  readonly documento = signal('—');
  readonly tipo = signal('Trabajador');
  readonly telefono = signal('—');
  readonly parqueaderoNombre = signal('Parqueadero Biblioteca');
  readonly parqueaderoDesde = signal('19/02/2026');
  readonly perfilCargando = signal(true);
  readonly perfilError = signal<string | null>(null);

  modalEditar = false;
  editNombre = '';
  editDocumento = '';
  editTipo = '';
  editTelefono = '';

  ngOnInit(): void {
    this.trabajadorService.getCurrentTrabajador().subscribe({
      next: (raw) => {
        const v = mapUsuarioMe(raw);
        this.nombre.set(v.nombre);
        this.documento.set(v.documento);
        this.tipo.set(v.tipo);
        this.telefono.set(v.telefono);
        if (v.parqueaderoNombre) this.parqueaderoNombre.set(v.parqueaderoNombre);
        if (v.parqueaderoDesde) this.parqueaderoDesde.set(v.parqueaderoDesde);
        this.perfilError.set(null);
        this.perfilCargando.set(false);
      },
      error: () => {
        this.perfilError.set('No se pudo cargar el perfil. ¿Iniciaste sesión?');
        this.perfilCargando.set(false);
      },
    });
  }

  openEditar(): void {
    this.editNombre = this.nombre();
    this.editDocumento = this.documento();
    this.editTipo = this.tipo();
    this.editTelefono = this.telefono();
    this.modalEditar = true;
  }

  closeEditar(): void {
    this.modalEditar = false;
  }

  guardar(): void {
    this.nombre.set(this.editNombre.trim() || this.nombre());
    this.documento.set(this.editDocumento.trim() || this.documento());
    this.tipo.set(this.editTipo.trim() || this.tipo());
    this.telefono.set(this.editTelefono.trim() || this.telefono());
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
