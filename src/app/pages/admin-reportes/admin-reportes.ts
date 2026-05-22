import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { catchError, finalize, of } from 'rxjs';

import { AdminNavbarComponent } from '../../components/admin-navbar/admin-navbar';
import {
  asParqueaderosArray,
  mapParqueaderoListaItem,
} from '../../services/parqueaderos/map-parqueaderos-vista';
import { ParqueaderoService } from '../../services/parqueaderos/parqueaderos.service';
import {
  descargarExcel,
  nombreArchivoReporte,
} from '../../services/reportes/export-reporte-excel.util';
import {
  ingresosAFilasExcel,
  mapIngresosReporte,
  mapOcupacionReporte,
  mapPagosReporte,
  ocupacionAFilasExcel,
  pagosAFilasExcel,
} from '../../services/reportes/map-reportes';
import { Reportes } from '../../services/reportes/reportes';

/** 0 = todos los parqueaderos (endpoints sin id). */
export const REPORTE_TODOS_PARQUEADEROS = 0;

export interface ParqueaderoOpcionReporte {
  id: number;
  nombre: string;
}

@Component({
  selector: 'app-admin-reportes',
  imports: [FormsModule, AdminNavbarComponent],
  templateUrl: './admin-reportes.html',
  styleUrl: './admin-reportes.css',
})
export class AdminReportesComponent implements OnInit {
  private readonly reportesService = inject(Reportes);
  private readonly parqueaderoService = inject(ParqueaderoService);

  readonly parqueaderoOpciones = signal<ParqueaderoOpcionReporte[]>([
    { id: REPORTE_TODOS_PARQUEADEROS, nombre: 'Todos' },
  ]);
  readonly cargandoParqueaderos = signal(true);
  readonly generando = signal(false);
  readonly errorMsg = signal<string | null>(null);

  parqueaderoOcupacionId = REPORTE_TODOS_PARQUEADEROS;
  parqueaderoIngresosId = REPORTE_TODOS_PARQUEADEROS;

  ngOnInit(): void {
    this.cargarParqueaderos();
  }

  private cargarParqueaderos(): void {
    this.cargandoParqueaderos.set(true);
    this.parqueaderoService
      .getParqueaderos()
      .pipe(
        catchError(() => {
          this.errorMsg.set('No se pudieron cargar los parqueaderos para los filtros.');
          return of([]);
        }),
        finalize(() => this.cargandoParqueaderos.set(false)),
      )
      .subscribe((raw) => {
        const items = asParqueaderosArray(raw)
          .map((p) => mapParqueaderoListaItem(p))
          .filter((x): x is NonNullable<typeof x> => x != null)
          .map((p) => ({ id: p.idParqueadero, nombre: p.nombre }));

        this.parqueaderoOpciones.set([
          { id: REPORTE_TODOS_PARQUEADEROS, nombre: 'Todos' },
          ...items,
        ]);
      });
  }

  generarOcupacion(): void {
    const id = this.parqueaderoOcupacionId;
    const req =
      id > 0
        ? this.reportesService.getOcupacionByParqueadero(id)
        : this.reportesService.getOcupacion();

    this.ejecutarDescarga(req, (raw) => {
      const filas = ocupacionAFilasExcel(mapOcupacionReporte(raw));
      const sufijo =
        id > 0
          ? this.etiquetaParqueadero(id).replace(/\s+/g, '-').toLowerCase()
          : 'todos';
      descargarExcel(nombreArchivoReporte(`ocupacion-${sufijo}`), [
        { nombre: 'Ocupación', filas },
      ]);
    });
  }

  generarIngresos(): void {
    const id = this.parqueaderoIngresosId;
    const req =
      id > 0
        ? this.reportesService.getIngresosReporteByParqueadero(id)
        : this.reportesService.getIngresosReporte();

    this.ejecutarDescarga(req, (raw) => {
      const filas = ingresosAFilasExcel(mapIngresosReporte(raw));
      const sufijo =
        id > 0
          ? this.etiquetaParqueadero(id).replace(/\s+/g, '-').toLowerCase()
          : 'todos';
      descargarExcel(nombreArchivoReporte(`ingresos-${sufijo}`), [
        { nombre: 'Ingresos', filas },
      ]);
    });
  }

  generarPagos(): void {
    this.ejecutarDescarga(this.reportesService.getPagosReporte(), (raw) => {
      const resumen = mapPagosReporte(raw);
      const filas = resumen
        ? pagosAFilasExcel(resumen)
        : [{ Mensaje: 'Sin datos de pagos' }];
      descargarExcel(nombreArchivoReporte('pagos'), [{ nombre: 'Pagos', filas }]);
    });
  }

  private etiquetaParqueadero(id: number): string {
    const op = this.parqueaderoOpciones().find((p) => p.id === id);
    return op?.nombre ?? `parqueadero-${id}`;
  }

  private ejecutarDescarga(
    request: ReturnType<Reportes['getOcupacion']>,
    onOk: (raw: unknown) => void,
  ): void {
    this.errorMsg.set(null);
    this.generando.set(true);
    request
      .pipe(
        catchError((err) => {
          const e = err as { error?: { message?: string; mensaje?: string } };
          const b = e?.error;
          this.errorMsg.set(
            b?.message ?? b?.mensaje ?? 'No se pudo generar el reporte.',
          );
          return of(null);
        }),
        finalize(() => this.generando.set(false)),
      )
      .subscribe((raw) => {
        if (raw == null) return;
        onOk(raw);
      });
  }
}
