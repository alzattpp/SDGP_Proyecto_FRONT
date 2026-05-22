import { DecimalPipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { catchError, finalize, forkJoin, map, of } from 'rxjs';
import Swal from 'sweetalert2';

import {
  COSTO_SERVICIO_VISITANTE,
  ID_PARQUEADERO_BAVARIA,
  ID_USUARIO_EXTERNO,
  normalizarPlaca,
  NOTA_VISITANTE,
} from '../../constants/visitante.const';
import {
  imagenCarroPorOcupacion,
  mapParqueaderoListaItem,
  porcentajesDesdeStats,
} from '../../services/parqueaderos/map-parqueaderos-vista';
import { ParqueaderoService } from '../../services/parqueaderos/parqueaderos.service';
import { VehiculosService } from '../../services/vehiculos/vehiculos.service';

@Component({
  selector: 'app-visitante',
  imports: [DecimalPipe, FormsModule, RouterLink],
  templateUrl: './visitante.html',
  styleUrl: './visitante.css',
})
export class VisitanteComponent implements OnInit {
  private readonly parqueaderoService = inject(ParqueaderoService);
  private readonly vehiculosService = inject(VehiculosService);

  readonly notaVisitante = NOTA_VISITANTE;
  readonly costoVisitante = COSTO_SERVICIO_VISITANTE;

  readonly nombre = signal('Parqueadero Bavaria');
  readonly capacidadTotal = signal(0);
  readonly cuposDisponibles = signal(0);
  readonly ocupacionPct = signal(0);
  readonly disponibilidadPct = signal(100);
  readonly cargando = signal(true);
  readonly enviando = signal(false);
  readonly errorMsg = signal<string | null>(null);

  marca = '';
  placa = '';

  ngOnInit(): void {
    this.cargarParqueadero();
  }

  imagenCarro(): string {
    return imagenCarroPorOcupacion(this.ocupacionPct());
  }

  registrarVehiculo(): void {
    const marca = this.marca.trim();
    const placa = normalizarPlaca(this.placa);
    if (!marca || !placa) {
      this.errorMsg.set('Ingresa la marca y la placa de tu vehículo.');
      return;
    }
    this.errorMsg.set(null);
    this.enviando.set(true);

    this.vehiculosService
      .createVehiculo({ placa, marca, idUsuario: ID_USUARIO_EXTERNO })
      .pipe(finalize(() => this.enviando.set(false)))
      .subscribe({
        next: () => {
          this.marca = '';
          this.placa = '';
          void Swal.fire({
            icon: 'success',
            title: 'Vehículo registrado',
            text: `Tu vehículo ${placa} quedó registrado. Acércate a taquilla del Parqueadero Bavaria para que el personal registre tu ingreso y pagues $${COSTO_SERVICIO_VISITANTE.toLocaleString('es-CO')}.`,
            confirmButtonColor: '#0069a3',
          });
        },
        error: (err) => {
          const body = err?.error;
          const msg =
            (typeof body === 'string' ? body : null) ??
            body?.message ??
            body?.mensaje ??
            'No se pudo completar el registro. Verifica los datos e intenta de nuevo.';
          this.errorMsg.set(msg);
        },
      });
  }

  private cargarParqueadero(): void {
    this.cargando.set(true);
    forkJoin({
      detalle: this.parqueaderoService.getParqueaderoById(ID_PARQUEADERO_BAVARIA).pipe(
        catchError(() => of(null)),
      ),
      stats: this.parqueaderoService.getParqueaderoStats(ID_PARQUEADERO_BAVARIA).pipe(
        catchError(() => of(null)),
      ),
    })
      .pipe(
        map(({ detalle, stats }) => {
          const r =
            detalle && typeof detalle === 'object'
              ? (detalle as Record<string, unknown>)
              : {};
          const data = r['data'];
          const p =
            (data && typeof data === 'object' ? (data as Record<string, unknown>) : null) ??
            (r['parqueadero'] && typeof r['parqueadero'] === 'object'
              ? (r['parqueadero'] as Record<string, unknown>)
              : r);
          const base = mapParqueaderoListaItem(p);
          const pct = porcentajesDesdeStats(stats, base?.capacidadTotal ?? 0);
          return { base, pct };
        }),
        finalize(() => this.cargando.set(false)),
      )
      .subscribe(({ base, pct }) => {
        if (base?.nombre) this.nombre.set(base.nombre);
        this.capacidadTotal.set(pct.capacidadTotal);
        this.cuposDisponibles.set(pct.cuposDisponibles);
        this.ocupacionPct.set(pct.ocupacionPct);
        this.disponibilidadPct.set(pct.disponibilidadPct);
      });
  }
}
