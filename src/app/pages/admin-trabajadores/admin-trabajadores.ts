import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize, forkJoin } from 'rxjs';

import { AdminNavbarComponent } from '../../components/admin-navbar/admin-navbar';
import { ParqueaderoService } from '../../services/parqueaderos/parqueaderos.service';
import { Trabajador, TrabajadorService } from '../../services/trabajador/trabajador.service';

export interface AdminTrabajadorRow {
  idTrabajador: number;
  idUsuario: number;
  nombreCompleto: string;
  correo: string;
  documento: string;
  telefono: string;
  idParqueadero: number;
  nombreParqueadero: string;
}

function asArray<T>(x: unknown): T[] {
  if (Array.isArray(x)) return x;
  const o = x as Record<string, unknown> | null;
  if (o && Array.isArray(o['data'])) return o['data'] as T[];
  return [];
}

function numIdParqueadero(p: Record<string, unknown>): number {
  return Number(p['idParqueadero'] ?? p['id'] ?? 0);
}

@Component({
  selector: 'app-admin-trabajadores',
  imports: [FormsModule, AdminNavbarComponent],
  templateUrl: './admin-trabajadores.html',
  styleUrl: './admin-trabajadores.css',
})
export class AdminTrabajadoresComponent implements OnInit {
  private readonly trabajadorService = inject(TrabajadorService);
  private readonly parqueaderoService = inject(ParqueaderoService);

  readonly filas = signal<AdminTrabajadorRow[]>([]);
  readonly parqueaderosOpciones = signal<{ id: number; nombre: string }[]>([]);
  readonly cargando = signal(true);
  readonly mutando = signal(false);
  readonly errorMsg = signal<string | null>(null);

  modalAgregar = false;
  addNombreCompleto = '';
  addCorreo = '';
  addContrasena = '';
  addDocumento = '';
  addTelefono = '';
  addIdParqueadero: number | null = null;

  modalEditar = false;
  editIdTrabajador: number | null = null;
  editNombreCompleto = '';
  editCorreo = '';
  editContrasena = '';
  editDocumento = '';
  editTelefono = '';
  editIdParqueadero: number | null = null;

  ngOnInit(): void {
    this.recargarDatos();
  }

  recargarDatos(): void {
    this.cargando.set(true);
    this.errorMsg.set(null);
    forkJoin({
      parqueaderos: this.parqueaderoService.getParqueaderos(),
      trabajadores: this.trabajadorService.getTrabajadores(),
    }).subscribe({
      next: ({ parqueaderos, trabajadores }) => {
        const listaPq = asArray<Record<string, unknown>>(parqueaderos);
        const opciones = listaPq
          .map((p) => ({ id: numIdParqueadero(p), nombre: String(p['nombre'] ?? '') }))
          .filter((o) => o.id > 0 && o.nombre);
        this.parqueaderosOpciones.set(opciones);
        const nombrePorId = new Map(opciones.map((o) => [o.id, o.nombre] as const));
        const filas = asArray<Record<string, unknown>>(trabajadores).map((t) =>
          this.mapFila(t, nombrePorId),
        );
        this.filas.set(filas);
        this.cargando.set(false);
      },
      error: () => {
        this.errorMsg.set('No se pudieron cargar trabajadores o parqueaderos.');
        this.cargando.set(false);
      },
    });
  }

  private mapFila(
    t: Record<string, unknown>,
    nombrePorId: Map<number, string>,
  ): AdminTrabajadorRow {
    const idP = Number(t['idParqueadero'] ?? 0);
    const idT = Number(t['idTrabajador'] ?? t['id'] ?? 0);
    const idU = Number(t['idUsuario'] ?? t['id_usuario'] ?? 0);
    return {
      idTrabajador: idT,
      idUsuario: idU,
      nombreCompleto: String(t['nombreCompleto'] ?? t['nombre'] ?? ''),
      correo: String(t['correo'] ?? ''),
      documento: String(t['documento'] ?? ''),
      telefono: String(t['telefono'] ?? ''),
      idParqueadero: idP,
      nombreParqueadero: nombrePorId.get(idP) ?? (idP ? `Parqueadero #${idP}` : '—'),
    };
  }

  abrirAgregar(): void {
    this.addNombreCompleto = '';
    this.addCorreo = '';
    this.addContrasena = '';
    this.addDocumento = '';
    this.addTelefono = '';
    this.addIdParqueadero = null;
    this.modalAgregar = true;
  }

  cerrarAgregar(): void {
    this.modalAgregar = false;
  }

  guardarAgregar(): void {
    const nombreCompleto = this.addNombreCompleto.trim();
    const correo = this.addCorreo.trim();
    const contrasena = this.addContrasena;
    const documento = this.addDocumento.trim();
    const telefono = this.addTelefono.trim();
    const idP = this.addIdParqueadero;
    if (!nombreCompleto || !correo || !contrasena || !documento || !telefono || !idP) {
      this.errorMsg.set('Completa todos los campos, incluido el parqueadero.');
      return;
    }
    const body: Trabajador = {
      nombreCompleto,
      correo,
      contrasena,
      documento,
      telefono,
      idParqueadero: idP,
    };
    this.errorMsg.set(null);
    this.mutando.set(true);
    this.trabajadorService
      .createTrabajador(body)
      .pipe(finalize(() => this.mutando.set(false)))
      .subscribe({
        next: () => {
          this.cerrarAgregar();
          this.recargarDatos();
        },
        error: (err) => {
          const b = err?.error;
          this.errorMsg.set(
            b?.message ?? b?.mensaje ?? 'No se pudo crear el trabajador.',
          );
        },
      });
  }

  abrirEditar(row: AdminTrabajadorRow): void {
    this.editIdTrabajador = row.idTrabajador;
    this.editNombreCompleto = row.nombreCompleto;
    this.editCorreo = row.correo;
    this.editContrasena = '';
    this.editDocumento = row.documento;
    this.editTelefono = row.telefono;
    this.editIdParqueadero = row.idParqueadero > 0 ? row.idParqueadero : null;
    this.modalEditar = true;
  }

  cerrarEditar(): void {
    this.modalEditar = false;
    this.editIdTrabajador = null;
  }

  guardarEditar(): void {
    const idT = this.editIdTrabajador;
    if (!idT) return;
    const nombreCompleto = this.editNombreCompleto.trim();
    const correo = this.editCorreo.trim();
    const contrasena = this.editContrasena.trim();
    const documento = this.editDocumento.trim();
    const telefono = this.editTelefono.trim();
    const idP = this.editIdParqueadero;
    if (!nombreCompleto || !correo || !documento || !telefono || !idP) {
      this.errorMsg.set('Completa todos los campos, incluido el parqueadero.');
      return;
    }
    if (!contrasena) {
      this.errorMsg.set(
        'Ingresa la contraseña: el API valida el mismo cuerpo que al crear (como en Postman).',
      );
      return;
    }
    /** Mismo formato que createTrabajador / Postman; muchos backends exigen las 6 propiedades. */
    const payload: Trabajador = {
      nombreCompleto,
      correo,
      contrasena,
      documento,
      telefono,
      idParqueadero: Number(idP),
    };

    this.errorMsg.set(null);
    this.mutando.set(true);
    this.trabajadorService
      .updateTrabajador(idT, payload)
      .pipe(finalize(() => this.mutando.set(false)))
      .subscribe({
        next: () => {
          this.cerrarEditar();
          this.recargarDatos();
        },
        error: (err) => {
          this.errorMsg.set(this.mensajeErrorHttp(err, 'No se pudo actualizar el trabajador.'));
        },
      });
  }

  private mensajeErrorHttp(err: unknown, fallback: string): string {
    const e = err as { error?: unknown };
    const b = e?.error;
    if (typeof b === 'string' && b.trim()) return b;
    if (b && typeof b === 'object') {
      const o = b as Record<string, unknown>;
      if (typeof o['message'] === 'string') return o['message'];
      if (typeof o['mensaje'] === 'string') return o['mensaje'];
      const errs = o['errors'];
      if (Array.isArray(errs)) return errs.map(String).join(' · ');
    }
    return fallback;
  }

  eliminar(row: AdminTrabajadorRow): void {
    if (!row.idUsuario) {
      this.errorMsg.set('Este registro no tiene idUsuario para eliminar.');
      return;
    }
    if (!confirm('¿Eliminar este trabajador?')) return;
    this.errorMsg.set(null);
    this.mutando.set(true);
    this.trabajadorService
      .deleteTrabajador(row.idUsuario)
      .pipe(finalize(() => this.mutando.set(false)))
      .subscribe({
        next: () => this.recargarDatos(),
        error: (err) => {
          const b = err?.error;
          this.errorMsg.set(
            b?.message ?? b?.mensaje ?? 'No se pudo eliminar el trabajador.',
          );
        },
      });
  }
}
