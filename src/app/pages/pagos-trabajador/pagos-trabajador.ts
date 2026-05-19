import { Component, inject, OnInit, signal } from '@angular/core';
import { catchError, finalize, forkJoin, of } from 'rxjs';
import Swal from 'sweetalert2';

import { TrabajadorNavbarComponent } from '../../components/trabajador-navbar/trabajador-navbar';
import { IngresoService } from '../../services/ingreso/ingreso.service';
import { MedioPagoService } from '../../services/mediospago/mediospago';
import {
  mapPagosTrabajadorLista,
  type PagoTrabajadorRow,
} from '../../services/pagos/map-pagos-trabajador';
import { Pagos } from '../../services/pagos/pagos';
import { TrabajadorService } from '../../services/trabajador/trabajador.service';
import { UsuarioService } from '../../services/usuarios/usuario.service';

function rec(v: unknown): Record<string, unknown> | undefined {
  return v && typeof v === 'object' ? (v as Record<string, unknown>) : undefined;
}

@Component({
  selector: 'app-pagos-trabajador',
  imports: [TrabajadorNavbarComponent],
  templateUrl: './pagos-trabajador.html',
  styleUrl: './pagos-trabajador.css',
})
export class PagosTrabajadorComponent implements OnInit {
  private readonly trabajadorService = inject(TrabajadorService);
  private readonly pagosService = inject(Pagos);
  private readonly ingresoService = inject(IngresoService);
  private readonly medioPagoService = inject(MedioPagoService);
  private readonly usuarioService = inject(UsuarioService);

  readonly cargando = signal(true);
  readonly errorMsg = signal<string | null>(null);
  readonly filas = signal<PagoTrabajadorRow[]>([]);

  ngOnInit(): void {
    this.trabajadorService.getCurrentTrabajador().subscribe({
      next: (me) => {
        const idP = this.extraerIdParqueadero(me);
        if (!idP) {
          this.errorMsg.set('No hay parqueadero asignado en tu perfil.');
          this.cargando.set(false);
          return;
        }
        this.cargarPagos(idP);
      },
      error: () => {
        this.errorMsg.set('No se pudo validar tu sesión de trabajador.');
        this.cargando.set(false);
      },
    });
  }

  private extraerIdParqueadero(raw: unknown): number | null {
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

  private cargarPagos(idParqueadero: number): void {
    this.cargando.set(true);
    this.errorMsg.set(null);
    forkJoin({
      pagos: this.pagosService.getPagos().pipe(catchError(() => of([]))),
      ingresos: this.ingresoService.getIngresos().pipe(catchError(() => of([]))),
      medios: this.medioPagoService.getMediosPago().pipe(catchError(() => of([]))),
      usuarios: this.usuarioService.getUsuarios().pipe(catchError(() => of([]))),
    })
      .pipe(finalize(() => this.cargando.set(false)))
      .subscribe({
        next: ({ pagos, ingresos, medios, usuarios }) => {
          this.filas.set(
            mapPagosTrabajadorLista(pagos, ingresos, idParqueadero, medios, usuarios),
          );
        },
        error: () => {
          this.errorMsg.set('No se pudieron cargar los pagos.');
        },
      });
  }

  async verDetalle(row: PagoTrabajadorRow): Promise<void> {
    const medioLinea = row.medioDetalle
      ? `${row.medio} · Ref. ${row.medioDetalle}`
      : row.medio;

    await Swal.fire({
      title: 'Detalle del pago',
      html: `
        <div style="text-align:left;line-height:1.6;font-size:0.95rem">
          <p><strong>Pagado por:</strong> ${row.nombrePagador}</p>
          <p><strong>Placa:</strong> ${row.placa}</p>
          <p><strong>Fecha de pago:</strong> ${row.fechaPago}</p>
          <p><strong>Hora de pago:</strong> ${row.horaPago}</p>
          <p><strong>Hora de ingreso:</strong> ${row.horaIngreso}</p>
          <p><strong>Valor:</strong> $${row.valor.toLocaleString('es-CO')} COP</p>
          <p><strong>Medio de pago:</strong> ${medioLinea}</p>
        </div>
      `,
      icon: 'info',
      confirmButtonText: 'Cerrar',
      confirmButtonColor: '#f2d03b',
      color: '#1a2d4d',
    });
  }
}
