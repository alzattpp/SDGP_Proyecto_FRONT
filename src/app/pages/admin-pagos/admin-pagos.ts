import { Component, inject, OnInit, signal } from '@angular/core';
import { catchError, finalize, forkJoin, of } from 'rxjs';
import Swal from 'sweetalert2';

import { AdminNavbarComponent } from '../../components/admin-navbar/admin-navbar';
import { IngresoService } from '../../services/ingreso/ingreso.service';
import { MedioPagoService } from '../../services/mediospago/mediospago';
import {
  mapPagosAdminLista,
  type AdminPagoRow,
} from '../../services/pagos/map-pagos-trabajador';
import { Pagos } from '../../services/pagos/pagos';
import { ParqueaderoService } from '../../services/parqueaderos/parqueaderos.service';
import { UsuarioService } from '../../services/usuarios/usuario.service';

@Component({
  selector: 'app-admin-pagos',
  imports: [AdminNavbarComponent],
  templateUrl: './admin-pagos.html',
  styleUrl: './admin-pagos.css',
})
export class AdminPagosComponent implements OnInit {
  private readonly pagosService = inject(Pagos);
  private readonly ingresoService = inject(IngresoService);
  private readonly medioPagoService = inject(MedioPagoService);
  private readonly usuarioService = inject(UsuarioService);
  private readonly parqueaderoService = inject(ParqueaderoService);

  readonly filas = signal<AdminPagoRow[]>([]);
  readonly cargando = signal(true);
  readonly errorMsg = signal<string | null>(null);

  ngOnInit(): void {
    this.recargarDatos();
  }

  recargarDatos(): void {
    this.cargando.set(true);
    this.errorMsg.set(null);

    forkJoin({
      pagos: this.pagosService.getPagos().pipe(catchError(() => of([]))),
      ingresos: this.ingresoService.getIngresos().pipe(catchError(() => of([]))),
      medios: this.medioPagoService.getMediosPago().pipe(catchError(() => of([]))),
      usuarios: this.usuarioService.getUsuarios().pipe(catchError(() => of([]))),
      parqueaderos: this.parqueaderoService.getParqueaderos().pipe(catchError(() => of([]))),
    })
      .pipe(finalize(() => this.cargando.set(false)))
      .subscribe({
        next: ({ pagos, ingresos, medios, usuarios, parqueaderos }) => {
          this.filas.set(
            mapPagosAdminLista(pagos, ingresos, medios, usuarios, parqueaderos),
          );
        },
        error: () => {
          this.errorMsg.set('No se pudieron cargar los pagos.');
        },
      });
  }

  async verDetalle(row: AdminPagoRow): Promise<void> {
    const medioLinea = row.medioDetalle
      ? `${row.medio} · Ref. ${row.medioDetalle}`
      : row.medio;

    await Swal.fire({
      title: 'Detalle del pago',
      html: `
        <div style="text-align:left;line-height:1.6;font-size:0.95rem">
          <p><strong>Referencia:</strong> ${row.referencia}</p>
          <p><strong>Pagador:</strong> ${row.nombrePagador}</p>
          <p><strong>Placa:</strong> ${row.placa}</p>
          <p><strong>Parqueadero:</strong> ${row.nombreParqueadero}</p>
          <p><strong>Entrada:</strong> ${row.horaIngreso}</p>
          <p><strong>Salida:</strong> ${row.horaSalida}</p>
          <p><strong>Fecha de pago:</strong> ${row.fechaPago}</p>
          <p><strong>Hora de pago:</strong> ${row.horaPago}</p>
          <p><strong>Total:</strong> ${row.totalLabel}</p>
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
