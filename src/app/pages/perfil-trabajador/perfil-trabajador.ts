import { Component, inject, OnInit, signal } from '@angular/core';
import { catchError, of } from 'rxjs';
import { TrabajadorNavbarComponent } from '../../components/trabajador-navbar/trabajador-navbar';
import { ParqueaderoService } from '../../services/parqueaderos/parqueaderos.service';
import { mapUsuarioMe } from '../../services/usuarios/map-usuario-me';
import { TrabajadorService } from '../../services/trabajador/trabajador.service';

@Component({
  selector: 'app-perfil-trabajador',
  imports: [TrabajadorNavbarComponent],
  templateUrl: './perfil-trabajador.html',
  styleUrl: './perfil-trabajador.css',
})
export class PerfilTrabajadorComponent implements OnInit {
  private readonly trabajadorService = inject(TrabajadorService);
  private readonly parqueaderoService = inject(ParqueaderoService);

  readonly nombre = signal('—');
  readonly documento = signal('—');
  readonly tipo = signal('Trabajador');
  readonly telefono = signal('—');
  readonly parqueaderoNombre = signal('—');
  readonly perfilCargando = signal(true);
  readonly perfilError = signal<string | null>(null);

  ngOnInit(): void {
    this.trabajadorService.getCurrentTrabajador().subscribe({
      next: (raw) => {
        const v = mapUsuarioMe(raw);
        this.nombre.set(v.nombre);
        this.documento.set(v.documento);
        this.tipo.set(v.tipo);
        this.telefono.set(v.telefono);
        if (v.parqueaderoNombre) this.parqueaderoNombre.set(v.parqueaderoNombre);
        if (v.idParqueadero && !v.parqueaderoNombre) {
          this.cargarNombreParqueadero(v.idParqueadero);
        }
        this.perfilError.set(null);
        this.perfilCargando.set(false);
      },
      error: () => {
        this.perfilError.set('No se pudo cargar el perfil. ¿Iniciaste sesión?');
        this.perfilCargando.set(false);
      },
    });
  }

  private cargarNombreParqueadero(idP: number): void {
    this.parqueaderoService
      .getParqueaderoById(idP)
      .pipe(catchError(() => of(null)))
      .subscribe((raw) => {
        const r = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
        const d = (r['data'] ?? r['parqueadero'] ?? r) as Record<string, unknown>;
        const nom = String(d['nombre'] ?? d['nombreParqueadero'] ?? '').trim();
        if (nom) this.parqueaderoNombre.set(nom);
        else this.parqueaderoNombre.set(`Parqueadero #${idP}`);
      });
  }
}
