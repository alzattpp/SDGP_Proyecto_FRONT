import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { catchError, finalize, forkJoin, map, of } from 'rxjs';

import { UsuarioNavbarComponent } from '../../components/usuario-navbar/usuario-navbar';
import {
  asParqueaderosArray,
  imagenCarroPorOcupacion,
  mapParqueaderoListaItem,
  porcentajesDesdeStats,
} from '../../services/parqueaderos/map-parqueaderos-vista';
import { ParqueaderoService } from '../../services/parqueaderos/parqueaderos.service';

export interface ParqueaderoCard {
  idParqueadero: number;
  nombre: string;
  capacidadTotal: number;
  cuposDisponibles: number;
  ocupacionPct: number;
  disponibilidadPct: number;
  nota?: string;
}

@Component({
  selector: 'app-parqueaderos',
  imports: [RouterLink, UsuarioNavbarComponent],
  templateUrl: './parqueaderos.html',
  styleUrl: './parqueaderos.css',
})
export class ParqueaderosComponent implements OnInit {
  private readonly parqueaderoService = inject(ParqueaderoService);

  readonly items = signal<ParqueaderoCard[]>([]);
  readonly cargando = signal(true);
  readonly errorMsg = signal<string | null>(null);

  ngOnInit(): void {
    this.cargar();
  }

  imagenCarro(ocupacionPct: number): string {
    return imagenCarroPorOcupacion(ocupacionPct);
  }

  private cargar(): void {
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
          .map((p) => mapParqueaderoListaItem(p))
          .filter((x): x is NonNullable<typeof x> => x != null);

        if (!base.length) {
          this.items.set([]);
          this.cargando.set(false);
          return;
        }

        forkJoin(
          base.map((b) =>
            this.parqueaderoService.getParqueaderoStats(b.idParqueadero).pipe(
              catchError(() => of(null)),
              map((stats) => ({ base: b, stats })),
            ),
          ),
        )
          .pipe(finalize(() => this.cargando.set(false)))
          .subscribe((resultados) => {
            this.items.set(
              resultados.map(({ base, stats }) => {
                const pct = porcentajesDesdeStats(stats, base.capacidadTotal);
                return {
                  idParqueadero: base.idParqueadero,
                  nombre: base.nombre,
                  nota: base.nota,
                  capacidadTotal: pct.capacidadTotal || base.capacidadTotal,
                  cuposDisponibles: pct.cuposDisponibles,
                  ocupacionPct: pct.ocupacionPct,
                  disponibilidadPct: pct.disponibilidadPct,
                };
              }),
            );
          });
      });
  }
}
