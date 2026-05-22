import { DecimalPipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { catchError, finalize, forkJoin, of } from 'rxjs';
import Swal from 'sweetalert2';

import { AuthService } from '../../auth/auth.service';
import { UsuarioNavbarComponent } from '../../components/usuario-navbar/usuario-navbar';
import {
  asIngresosArray,
  buildIngresosLookup,
  ingresoActivo,
  ingresoEnParqueadero,
  mapIngresoResumen,
  normalizarPlaca,
  type IngresoResumen,
} from '../../services/ingreso/map-ingreso';
import { IngresoService } from '../../services/ingreso/ingreso.service';
import { mapMediosPagoLista } from '../../services/mediospago/map-medios-pago';
import { MedioPagoService } from '../../services/mediospago/mediospago';
import {
  buildMediosLookup,
  mapPagosHistorial,
  type PagosHistorialContext,
} from '../../services/pagos/map-pagos';
import { Pagos } from '../../services/pagos/pagos';
import { mapVehiculosLista } from '../../services/vehiculos/map-vehiculos';
import { VehiculosService } from '../../services/vehiculos/vehiculos.service';

export interface PagoHistorial {
  id: string;
  fecha: string;
  hora: string;
  placa: string;
  valor: number;
  medio: string;
}

export interface MedioRegistrado {
  id: string;
  tipo: string;
  detalle: string;
}

@Component({
  selector: 'app-pagos',
  imports: [UsuarioNavbarComponent, FormsModule, DecimalPipe],
  templateUrl: './pagos.html',
  styleUrl: './pagos.css',
})
export class PagosComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly pagosService = inject(Pagos);
  private readonly medioPagoService = inject(MedioPagoService);
  private readonly ingresoService = inject(IngresoService);
  private readonly vehiculosService = inject(VehiculosService);

  /** Parqueadero Bavaria — pagos solo con ingreso activo aquí */
  readonly idParqueaderoPago = 2;
  readonly valorFijo = 3500;
  readonly fechaHoy = new Date().toLocaleDateString('es-CO');

  readonly ingresoActivoParqueadero = signal<IngresoResumen | null>(null);

  readonly cargando = signal(true);
  readonly errorMsg = signal<string | null>(null);
  readonly procesandoPago = signal(false);
  readonly guardandoMedio = signal(false);

  placa = '';
  hora = '';
  medioSeleccionadoId = '';

  mostrarFormMedio = false;
  mediosRegistrados: MedioRegistrado[] = [];
  nuevoTipoMedio = '';
  nuevoNombreMedio = '';
  nuevoNrMedio = '';
  nuevoCvvMedio = '';

  historial: PagoHistorial[] = [];

  get ingresosPlacaOpciones(): IngresoResumen[] {
    return this.ingresosUsuario;
  }

  private idUsuario: number | null = null;
  private idIngresoSeleccionado: number | null = null;
  private ingresosUsuario: IngresoResumen[] = [];
  private placasUsuario = new Set<string>();
  private historialCtx: PagosHistorialContext = {
    ingresosPorId: new Map(),
    mediosPorId: new Map(),
  };

  ngOnInit(): void {
    this.authService.loadSession().subscribe({
      next: (session) => {
        if (!session?.idUsuario) {
          this.errorMsg.set('No se pudo validar tu sesión.');
          this.cargando.set(false);
          return;
        }
        this.idUsuario = session.idUsuario;
        this.cargarDatosIniciales();
      },
      error: () => {
        this.errorMsg.set('Debes iniciar sesión para pagar.');
        this.cargando.set(false);
      },
    });
  }

  private cargarDatosIniciales(): void {
    this.recargarVista();
  }

  private actualizarContextoHistorial(
    ingresosRaw: unknown,
    medios: MedioRegistrado[],
  ): void {
    this.historialCtx = {
      ingresosPorId: buildIngresosLookup(ingresosRaw),
      mediosPorId: buildMediosLookup(medios),
    };
  }

  private recargarVista(alTerminar?: () => void): void {
    const id = this.idUsuario;
    if (!id) return;
    this.cargando.set(true);
    forkJoin({
      medios: this.medioPagoService.getMediosPagoByUsuario(id).pipe(catchError(() => of([]))),
      historial: this.pagosService.getPagosByUsuario(id).pipe(catchError(() => of([]))),
      ingresos: this.ingresoService.getIngresos().pipe(catchError(() => of([]))),
      vehiculos: this.vehiculosService.getVehiculos().pipe(catchError(() => of([]))),
    })
      .pipe(finalize(() => this.cargando.set(false)))
      .subscribe(({ medios, historial, ingresos, vehiculos }) => {
        this.mediosRegistrados = mapMediosPagoLista(medios);
        this.actualizarContextoHistorial(ingresos, this.mediosRegistrados);
        this.historial = mapPagosHistorial(historial, this.historialCtx);
        const placasVehiculos = new Set(
          mapVehiculosLista(vehiculos, id).map((v) => normalizarPlaca(v.placa)),
        );
        this.procesarIngresosParaUsuario(ingresos, id, placasVehiculos);
        this.aplicarIngresoParqueadero();
      });
  }

  private procesarIngresosParaUsuario(
    raw: unknown,
    idUsuario: number,
    placasVehiculos: Set<string>,
  ): void {
    const idPq = this.idParqueaderoPago;
    const lista = asIngresosArray(raw)
      .filter((x) => ingresoActivo(x))
      .filter((x) => ingresoEnParqueadero(x, idPq))
      .map((x) => mapIngresoResumen(x))
      .filter((x): x is IngresoResumen => x != null)
      .filter((x) => {
        const placaNorm = normalizarPlaca(x.placa);
        const delUsuario =
          !x.idUsuario || x.idUsuario === idUsuario;
        const placaRegistrada =
          placasVehiculos.size === 0 || placasVehiculos.has(placaNorm);
        return delUsuario && placaRegistrada;
      });

    this.ingresosUsuario = lista;
    this.placasUsuario = placasVehiculos.size
      ? placasVehiculos
      : new Set(lista.map((i) => normalizarPlaca(i.placa)));
  }

  private aplicarIngresoParqueadero(): void {
    const lista = this.ingresosUsuario;
    if (!lista.length) {
      this.ingresoActivoParqueadero.set(null);
      this.placa = '';
      this.hora = '';
      this.idIngresoSeleccionado = null;
      this.errorMsg.set(
        'No tienes un ingreso activo en el Parqueadero Bavaria. Registra la entrada antes de pagar.',
      );
      return;
    }

    const ingreso =
      lista.length === 1
        ? lista[0]
        : lista.find((i) => normalizarPlaca(i.placa) === normalizarPlaca(this.placa)) ??
          lista[0];

    this.ingresoActivoParqueadero.set(ingreso);
    this.placa = ingreso.placa;
    this.hora = ingreso.horaIngreso;
    this.idIngresoSeleccionado = ingreso.idIngreso;
    this.errorMsg.set(null);
  }

  onPlacaChange(): void {
    const p = normalizarPlaca(this.placa);
    if (!p) {
      this.idIngresoSeleccionado = null;
      this.hora = '';
      return;
    }

    const ingreso = this.ingresosUsuario.find((i) => normalizarPlaca(i.placa) === p);
    if (!ingreso) {
      this.ingresoActivoParqueadero.set(null);
      this.idIngresoSeleccionado = null;
      this.hora = '';
      this.errorMsg.set(
        'No hay un ingreso activo en el Parqueadero Bavaria para esa placa.',
      );
      return;
    }

    this.ingresoActivoParqueadero.set(ingreso);
    this.idIngresoSeleccionado = ingreso.idIngreso;
    this.hora = ingreso.horaIngreso;
    this.errorMsg.set(null);
  }

  toggleFormMedio(): void {
    this.mostrarFormMedio = !this.mostrarFormMedio;
    if (this.mostrarFormMedio) {
      this.nuevoTipoMedio = '';
      this.nuevoNombreMedio = '';
      this.nuevoNrMedio = '';
      this.nuevoCvvMedio = '';
    }
  }

  guardarMedioRegistrado(): void {
    const id = this.idUsuario;
    if (!id) return;

    const tipo = (this.nuevoTipoMedio || 'Tarjeta').trim().toUpperCase();
    const numeroReferencia =
      this.nuevoNrMedio.trim() || this.nuevoNombreMedio.trim();
    if (!tipo || !numeroReferencia) return;

    this.guardandoMedio.set(true);
    this.medioPagoService
      .createMedioPago({
        idUsuario: id,
        tipo,
        numeroReferencia,
        ...(this.nuevoCvvMedio.trim() ? { cvv: this.nuevoCvvMedio.trim() } : {}),
      })
      .pipe(finalize(() => this.guardandoMedio.set(false)))
      .subscribe({
        next: async () => {
          this.mostrarFormMedio = false;
          await Swal.fire({
            title: 'Medio registrado',
            text: 'El medio de pago se añadió correctamente.',
            icon: 'success',
            confirmButtonText: 'ACEPTAR',
            confirmButtonColor: '#f4d73b',
            color: '#1a2d4d',
          });
          this.recargarVista(() => {
            const ultimo = this.mediosRegistrados[this.mediosRegistrados.length - 1];
            if (ultimo) this.medioSeleccionadoId = ultimo.id;
          });
        },
        error: (err) => {
          const e = err as { error?: { message?: string; mensaje?: string } };
          const b = e?.error;
          this.errorMsg.set(
            b?.message ?? b?.mensaje ?? 'No se pudo registrar el medio de pago.',
          );
        },
      });
  }

  async efectuarPago(): Promise<void> {
    const idUsuario = this.idUsuario;
    const idMedio = Number(this.medioSeleccionadoId);
    const idIngreso = this.idIngresoSeleccionado;

    if (!idUsuario) return;
    if (!this.placa.trim()) {
      this.errorMsg.set('Ingresa la placa del vehículo.');
      return;
    }
    if (!idIngreso) {
      this.onPlacaChange();
      if (!this.idIngresoSeleccionado) return;
    }
    if (!Number.isFinite(idMedio) || idMedio <= 0) {
      this.errorMsg.set('Selecciona un medio de pago.');
      return;
    }

    this.errorMsg.set(null);
    this.procesandoPago.set(true);

    this.pagosService
      .createPago({
        idUsuario,
        idMedioPago: idMedio,
        idIngreso: idIngreso!,
        monto: this.valorFijo,
      })
      .pipe(finalize(() => this.procesandoPago.set(false)))
      .subscribe({
        next: async () => {
          await Swal.fire({
            title: 'Pago registrado',
            text: `Se registró el pago de $${this.valorFijo.toLocaleString('es-CO')} COP.`,
            icon: 'success',
            confirmButtonText: 'ACEPTAR',
            confirmButtonColor: '#f4d73b',
            color: '#1a2d4d',
          });
          this.recargarVista();
        },
        error: async (err) => {
          const e = err as { error?: { message?: string; mensaje?: string } };
          const b = e?.error;
          const msg =
            b?.message ?? b?.mensaje ?? 'No se pudo registrar el pago.';
          this.errorMsg.set(msg);
          await Swal.fire({
            title: 'Error',
            text: msg,
            icon: 'error',
            confirmButtonColor: '#0069a3',
          });
        },
      });
  }

}
