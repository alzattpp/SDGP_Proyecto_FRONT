import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { catchError, finalize, forkJoin, map, of } from 'rxjs';

import { AdminNavbarComponent } from '../../components/admin-navbar/admin-navbar';
import {
  asParqueaderosArray,
  mapAdminParqueaderoLista,
  mergeAdminParqueaderoStats,
  type AdminParqueaderoRow,
} from '../../services/parqueaderos/map-parqueaderos-vista';
import {
  Parqueadero,
  ParqueaderoService,
} from '../../services/parqueaderos/parqueaderos.service';

@Component({
  selector: 'app-admin-parqueaderos',
  imports: [FormsModule, AdminNavbarComponent],
  templateUrl: './admin-parqueaderos.html',
  styleUrl: './admin-parqueaderos.css',
})
export class AdminParqueaderosComponent implements OnInit {
  private readonly parqueaderoService = inject(ParqueaderoService);

  readonly items = signal<AdminParqueaderoRow[]>([]);
  readonly cargando = signal(true);
  readonly mutando = signal(false);
  readonly errorMsg = signal<string | null>(null);

  modalAgregar = false;
  addNombre = '';
  addCapacidad = '';
  addRequierePago = false;

  modalEditar = false;
  editIdParqueadero: number | null = null;
  editNombre = '';
  editCapacidad = '';
  editRequierePago = false;

  modalEliminar = false;
  eliminarIdParqueadero: number | null = null;
  eliminarNombre = '';

  ngOnInit(): void {
    this.recargarDatos();
  }

  recargarDatos(): void {
    this.cargando.set(true);
    this.errorMsg.set(null);

    this.parqueaderoService
      .getParqueaderos()
      .pipe(
        catchError(() => {
          this.errorMsg.set('No se pudieron cargar los parqueaderos.');
          return of([]);
        }),
      )
      .subscribe((raw) => {
        const base = asParqueaderosArray(raw)
          .map((p) => mapAdminParqueaderoLista(p))
          .filter((x): x is AdminParqueaderoRow => x != null);

        if (!base.length) {
          this.items.set([]);
          this.cargando.set(false);
          return;
        }

        forkJoin(
          base.map((b) =>
            this.parqueaderoService.getParqueaderoStats(b.idParqueadero).pipe(
              catchError(() => of(null)),
              map((stats) => mergeAdminParqueaderoStats(b, stats)),
            ),
          ),
        )
          .pipe(finalize(() => this.cargando.set(false)))
          .subscribe((filas) => this.items.set(filas));
      });
  }

  abrirAgregar(): void {
    this.addNombre = '';
    this.addCapacidad = '';
    this.addRequierePago = false;
    this.modalAgregar = true;
  }

  cerrarAgregar(): void {
    this.modalAgregar = false;
  }

  guardarAgregar(): void {
    const nombre = this.addNombre.trim();
    const capacidadMaxima = parseInt(this.addCapacidad, 10);
    if (!nombre || !Number.isFinite(capacidadMaxima) || capacidadMaxima < 1) {
      this.errorMsg.set('Indica un nombre y una capacidad válida (mínimo 1).');
      return;
    }

    const body: Parqueadero = {
      nombre,
      capacidadMaxima,
      requierePago: this.addRequierePago,
    };

    this.errorMsg.set(null);
    this.mutando.set(true);
    this.parqueaderoService
      .createParqueadero(body)
      .pipe(finalize(() => this.mutando.set(false)))
      .subscribe({
        next: () => {
          this.cerrarAgregar();
          this.recargarDatos();
        },
        error: (err) => this.errorMsg.set(this.mensajeError(err)),
      });
  }

  abrirEditar(p: AdminParqueaderoRow): void {
    this.editIdParqueadero = p.idParqueadero;
    this.editNombre = p.nombre;
    this.editCapacidad = String(p.capacidadTotal);
    this.editRequierePago = p.requierePago;
    this.modalEditar = true;
  }

  cerrarEditar(): void {
    this.modalEditar = false;
    this.editIdParqueadero = null;
  }

  guardarEditar(): void {
    const id = this.editIdParqueadero;
    if (!id) return;

    const nombre = this.editNombre.trim();
    const capacidadMaxima = parseInt(this.editCapacidad, 10);
    if (!nombre || !Number.isFinite(capacidadMaxima) || capacidadMaxima < 1) {
      this.errorMsg.set('Indica un nombre y una capacidad válida (mínimo 1).');
      return;
    }

    const body: Partial<Parqueadero> = {
      nombre,
      capacidadMaxima,
      requierePago: this.editRequierePago,
    };

    this.errorMsg.set(null);
    this.mutando.set(true);
    this.parqueaderoService
      .updateParqueadero(id, body)
      .pipe(finalize(() => this.mutando.set(false)))
      .subscribe({
        next: () => {
          this.cerrarEditar();
          this.recargarDatos();
        },
        error: (err) => this.errorMsg.set(this.mensajeError(err)),
      });
  }

  abrirEliminar(p: AdminParqueaderoRow): void {
    this.eliminarIdParqueadero = p.idParqueadero;
    this.eliminarNombre = p.nombre;
    this.modalEliminar = true;
  }

  cerrarEliminar(): void {
    this.modalEliminar = false;
    this.eliminarIdParqueadero = null;
  }

  confirmarEliminar(): void {
    const id = this.eliminarIdParqueadero;
    if (!id) return;

    this.errorMsg.set(null);
    this.mutando.set(true);
    this.parqueaderoService
      .deleteParqueadero(id)
      .pipe(finalize(() => this.mutando.set(false)))
      .subscribe({
        next: () => {
          this.cerrarEliminar();
          this.recargarDatos();
        },
        error: (err) => this.errorMsg.set(this.mensajeError(err)),
      });
  }

  private mensajeError(err: unknown): string {
    const e = err as { error?: { message?: string; mensaje?: string } };
    const b = e?.error;
    return b?.message ?? b?.mensaje ?? 'No se pudo completar la operación.';
  }
}
