import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { catchError, finalize, forkJoin, of } from 'rxjs';

import { TrabajadorNavbarComponent } from '../../components/trabajador-navbar/trabajador-navbar';
import { IngresoService } from '../../services/ingreso/ingreso.service';
import { formatearFechaHoraColombiaDesdeValor } from '../../utils/fecha-hora.util';
import { ParqueaderoService } from '../../services/parqueaderos/parqueaderos.service';
import { TrabajadorService } from '../../services/trabajador/trabajador.service';

export interface RegistroVehiculo {
  idIngreso: number;
  placa: string;
  horaIngreso: string;
  estado: string;
}

function asArray(x: unknown): Record<string, unknown>[] {
  if (Array.isArray(x)) return x as Record<string, unknown>[];
  const o = x as Record<string, unknown> | null;
  if (o && Array.isArray(o['data'])) return o['data'] as Record<string, unknown>[];
  return [];
}

function rec(x: unknown): Record<string, unknown> | undefined {
  return x && typeof x === 'object' ? (x as Record<string, unknown>) : undefined;
}

@Component({
  selector: 'app-gestion',
  imports: [FormsModule, TrabajadorNavbarComponent],
  templateUrl: './gestion.html',
  styleUrl: './gestion.css',
})
export class GestionComponent implements OnInit {
  private readonly trabajadorService = inject(TrabajadorService);
  private readonly parqueaderoService = inject(ParqueaderoService);
  private readonly ingresoService = inject(IngresoService);

  readonly nombreParqueadero = signal('Parqueadero');
  readonly capacidadTotal = signal(0);
  readonly cuposDisponibles = signal(0);
  readonly idParqueadero = signal<number | null>(null);
  readonly inicializado = signal(false);
  readonly registrandoEntrada = signal(false);
  readonly registrandoSalida = signal(false);
  readonly errorMsg = signal<string | null>(null);
  private nombreParqueaderoDesdeMe: string | null = null;

  placaEntrada = '';
  busqueda = '';

  registros = signal<RegistroVehiculo[]>([]);

  modalSalidaAbierto = signal(false);
  placaSalidaModal = signal('');
  salidaIdIngreso = signal<number | null>(null);

  readonly ocupacionPct = computed(() => {
    const total = this.capacidadTotal();
    if (total <= 0) return 0;
    const occ = total - this.cuposDisponibles();
    return Math.round((occ / total) * 100);
  });

  readonly disponibilidadPct = computed(() => 100 - this.ocupacionPct());

  readonly filtrados = computed(() => {
    const q = this.busqueda.trim().toLowerCase().replace(/\s/g, '');
    if (!q) return this.registros();
    return this.registros().filter((r) => r.placa.toLowerCase().replace(/\s/g, '').includes(q));
  });

  ngOnInit(): void {
    this.trabajadorService.getCurrentTrabajador().subscribe({
      next: (me) => {
        this.nombreParqueaderoDesdeMe = this.extraerNombreParqueaderoTrabajador(me);
        const idP = this.extraerIdParqueaderoTrabajador(me);
        if (!idP) {
          this.errorMsg.set('No hay parqueadero asignado en tu perfil de trabajador.');
          this.inicializado.set(true);
          return;
        }
        this.idParqueadero.set(idP);
        this.cargarParqueaderoEIngresos(idP);
      },
      error: () => {
        this.errorMsg.set('No se pudo obtener tu usuario. ¿Iniciaste sesión como trabajador?');
        this.inicializado.set(true);
      },
    });
  }

  private extraerIdParqueaderoTrabajador(raw: unknown): number | null {
    const r = rec(raw) ?? {};
    const data = rec(r['data']);
    const u = rec(r['usuario'] ?? r['user']) ?? data ?? r;
    const pq = rec(u['parqueadero']);
    const id = Number(
      data?.['idParqueadero'] ??
        data?.['id_parqueadero'] ??
        u['idParqueadero'] ??
        u['id_parqueadero'] ??
        r['idParqueadero'] ??
        pq?.['idParqueadero'] ??
        pq?.['id'] ??
        0,
    );
    return id > 0 ? id : null;
  }

  private extraerNombreParqueaderoTrabajador(raw: unknown): string | null {
    const r = rec(raw) ?? {};
    const data = rec(r['data']);
    const u = rec(r['usuario'] ?? r['user']) ?? data ?? r;
    const pq = rec(u['parqueadero']) ?? rec(data?.['parqueadero']);
    const nombre = String(
      pq?.['nombre'] ??
        pq?.['nombreParqueadero'] ??
        data?.['nombreParqueadero'] ??
        u['nombreParqueadero'] ??
        r['nombreParqueadero'] ??
        '',
    ).trim();
    return nombre || null;
  }

  private cargarParqueaderoEIngresos(idP: number): void {
    this.errorMsg.set(null);
    forkJoin({
      parqueadero: this.parqueaderoService.getParqueaderoStats(idP),
      parqueaderoDetalle: this.parqueaderoService
        .getParqueaderoById(idP)
        .pipe(catchError(() => of(null))),
      ingresos: this.ingresoService.getIngresos().pipe(catchError(() => of([]))),
    }).subscribe({
      next: ({ parqueadero, parqueaderoDetalle, ingresos }) => {
        this.aplicarInfoParqueadero(parqueadero, idP, parqueaderoDetalle);
        this.aplicarIngresosLista(ingresos, idP);
        this.inicializado.set(true);
      },
      error: () => {
        this.errorMsg.set('No se pudo cargar datos del parqueadero.');
        this.inicializado.set(true);
      },
    });
  }

  private aplicarInfoParqueadero(raw: unknown, idP: number, detalleRaw?: unknown): void {
    const o = this.normalizarCuerpoStats(raw);
    const d = this.normalizarCuerpoParqueadero(detalleRaw);
    const nom = String(
      o['nombre'] ??
        o['nombreParqueadero'] ??
        rec(o['parqueadero'])?.['nombre'] ??
        d['nombre'] ??
        d['nombreParqueadero'] ??
        '',
    ).trim();
    if (nom) this.nombreParqueadero.set(nom);
    else this.nombreParqueadero.set(this.nombreParqueaderoDesdeMe ?? `Parqueadero #${idP}`);
    const cap = Number(
      o['capacidadMaxima'] ??
        o['capacidadTotal'] ??
        o['capacidad'] ??
        o['totalCupos'] ??
        rec(o['parqueadero'])?.['capacidadMaxima'] ??
        0,
    );
    const disp = Number(
      o['cuposDisponibles'] ??
        o['disponibles'] ??
        o['libres'] ??
        o['cuposLibres'] ??
        o['espaciosDisponibles'] ??
        -1,
    );
    if (cap > 0) this.capacidadTotal.set(cap);
    if (disp >= 0 && cap > 0) this.cuposDisponibles.set(Math.min(disp, cap));
    else if (cap > 0 && o['ocupados'] != null) {
      const occ = Number(o['ocupados']);
      if (Number.isFinite(occ)) this.cuposDisponibles.set(Math.max(0, cap - occ));
    } else if (cap > 0 && o['cuposOcupados'] != null) {
      const occ = Number(o['cuposOcupados']);
      if (Number.isFinite(occ)) this.cuposDisponibles.set(Math.max(0, cap - occ));
    } else if (cap > 0) {
      this.cuposDisponibles.set(cap);
    }
  }

  private normalizarCuerpoStats(raw: unknown): Record<string, unknown> {
    const r = rec(raw) ?? {};
    return (
      rec(r['data']) ??
      rec(r['stats']) ??
      rec(r['parqueadero']) ??
      rec(r['resultado']) ??
      r
    );
  }

  private normalizarCuerpoParqueadero(raw: unknown): Record<string, unknown> {
    const r = rec(raw) ?? {};
    return rec(r['data']) ?? rec(r['parqueadero']) ?? rec(r['resultado']) ?? r;
  }

  private aplicarIngresosLista(raw: unknown, idP: number): void {
    const rows = asArray(raw)
      .filter((x) => {
        const xp = Number(x['idParqueadero'] ?? 0);
        return !xp || xp === idP;
      })
      .filter((x) => this.esVehiculoDentro(x))
      .map((x) => this.mapIngresoFila(x))
      .filter((r) => r.idIngreso > 0 && r.placa);
    this.registros.set(rows);
  }

  private esVehiculoDentro(x: Record<string, unknown>): boolean {
    const est = String(x['estado'] ?? '').toLowerCase();
    if (!est) return true;
    if (est.includes('salida') || est.includes('finaliz') || est.includes('cerrad')) return false;
    return true;
  }

  private mapIngresoFila(x: Record<string, unknown>): RegistroVehiculo {
    const id = this.extraerIdIngreso(x);
    const placa = String(x['placa'] ?? '');
    const hi = x['horaIngreso'];
    let horaIngreso = formatearFechaHoraColombiaDesdeValor(hi);
    if (!horaIngreso) {
      horaIngreso = formatearFechaHoraColombiaDesdeValor(new Date());
    }
    return {
      idIngreso: id,
      placa,
      horaIngreso,
      estado: String(x['estado'] ?? 'En parqueadero'),
    };
  }

  
  private extraerIdIngreso(x: Record<string, unknown>): number {
    const val =
      x['idIngreso'] ??
      x['id_ingreso'] ??
      x['idingreso'] ??
      x['IDINGRESO'] ??
      rec(x['ingreso'])?.['idIngreso'] ??
      rec(x['ingreso'])?.['id_ingreso'] ??
      0;
    const id = Number(val);
    return Number.isFinite(id) && id > 0 ? id : 0;
  }

  
  private normalizarPlacaApi(s: string): string {
    return s.trim().replace(/\s+/g, '').toUpperCase();
  }

  imagenCarro(): string {
    const o = this.ocupacionPct();
    if (o <= 30) return '/assets/carroVerde.png';
    if (o <= 70) return '/assets/carroAmarillo.png';
    return '/assets/carroRojo.png';
  }

  registrarEntrada(): void {
    const idP = this.idParqueadero();
    if (!idP) return;
    const placa = this.normalizarPlacaApi(this.placaEntrada);
    if (!placa) return;
    const ya = this.registros().some(
      (r) => r.placa.replace(/\s/g, '').toUpperCase() === placa,
    );
    if (ya) {
      this.errorMsg.set('Esa placa ya figura como dentro del parqueadero.');
      return;
    }
    this.errorMsg.set(null);
    this.registrandoEntrada.set(true);

    this.ingresoService
      .createIngreso({ placa, idParqueadero: idP })
      .pipe(finalize(() => this.registrandoEntrada.set(false)))
      .subscribe({
        next: () => {
          this.placaEntrada = '';
          this.cargarParqueaderoEIngresos(idP);
        },
        error: (err) => {
          const e = err as { error?: { message?: string; mensaje?: string } };
          const b = e?.error;
          this.errorMsg.set(
            b?.message ?? b?.mensaje ?? 'No se pudo registrar la entrada.',
          );
        },
      });
  }

  abrirSalida(row: RegistroVehiculo): void {
    this.placaSalidaModal.set(row.placa);
    this.salidaIdIngreso.set(row.idIngreso > 0 ? row.idIngreso : null);
    this.modalSalidaAbierto.set(true);
  }

  confirmarSalida(): void {
    const id = this.salidaIdIngreso();
    const idP = this.idParqueadero();
    if (!id || !idP) {
      this.modalSalidaAbierto.set(false);
      return;
    }
    this.registrandoSalida.set(true);
    this.ingresoService
      .registrarSalida(id)
      .pipe(finalize(() => this.registrandoSalida.set(false)))
      .subscribe({
        next: () => {
          this.modalSalidaAbierto.set(false);
          this.cargarParqueaderoEIngresos(idP);
        },
        error: (err) => {
          const e = err as { error?: { message?: string; mensaje?: string } };
          const b = e?.error;
          this.errorMsg.set(
            b?.message ?? b?.mensaje ?? 'No se pudo registrar la salida.',
          );
          this.modalSalidaAbierto.set(false);
        },
      });
  }

  cerrarModal(): void {
    this.modalSalidaAbierto.set(false);
  }
}

