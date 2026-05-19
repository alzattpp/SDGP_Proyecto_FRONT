import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { catchError, finalize, of } from 'rxjs';

import { AuthService } from '../../auth/auth.service';
import { UsuarioNavbarComponent } from '../../components/usuario-navbar/usuario-navbar';
import { mapMediosPagoLista } from '../../services/mediospago/map-medios-pago';
import { MedioPagoService } from '../../services/mediospago/mediospago';
import { mapUsuarioMe } from '../../services/usuarios/map-usuario-me';
import { extractNumeroUsosServicio } from '../../services/usuarios/usuario-stats.util';
import { UsuarioService } from '../../services/usuarios/usuario.service';
import { mapVehiculosLista, type PlacaItem } from '../../services/vehiculos/map-vehiculos';
import { VehiculosService } from '../../services/vehiculos/vehiculos.service';

export interface MedioPagoItem {
  id: string;
  detalle: string;
  tipo: string;
}

export type { PlacaItem };

@Component({
  selector: 'app-perfil',
  imports: [UsuarioNavbarComponent, FormsModule],
  templateUrl: './perfil.html',
  styleUrl: './perfil.css',
})
export class PerfilComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly usuarioService = inject(UsuarioService);
  private readonly vehiculosService = inject(VehiculosService);
  private readonly medioPagoService = inject(MedioPagoService);

  readonly nombrePerfil = signal('Usuario');
  readonly documentoPerfil = signal('—');
  readonly tipoPerfil = signal('Usuario');
  readonly numeroUsosServicio = signal<number | null>(null);
  readonly perfilCargando = signal(true);
  readonly perfilError = signal<string | null>(null);
  readonly usosCargando = signal(true);
  readonly placasCargando = signal(true);
  readonly placasError = signal<string | null>(null);
  readonly guardandoPlaca = signal(false);
  readonly mediosCargando = signal(false);
  readonly mediosError = signal<string | null>(null);
  readonly guardandoMedio = signal(false);
  readonly eliminandoMedioId = signal<string | null>(null);

  private idUsuario: number | null = null;

  mediosPago: MedioPagoItem[] = [];
  placas: PlacaItem[] = [];

  modalMedios = false;
  mediosVista: 'lista' | 'anadir' = 'lista';

  tipoMedio = '';
  nombreTitularMedio = '';
  numeroMedio = '';
  cvvMedio = '';

  modalEditar = false;
  editNombre = '';
  editDocumento = '';
  editTipo = '';

  modalPlaca = false;
  nuevaPlaca = '';
  nuevaMarca = '';

  ngOnInit(): void {
    this.authService.loadSession().subscribe({
      next: (session) => {
        if (!session?.idUsuario) {
          this.perfilError.set('No se pudo validar tu sesión.');
          this.perfilCargando.set(false);
          this.usosCargando.set(false);
          this.placasCargando.set(false);
          return;
        }
        this.idUsuario = session.idUsuario;
        this.cargarPerfil();
        this.cargarContadorUsos();
        this.cargarPlacas();
      },
      error: () => {
        this.perfilError.set('No se pudo cargar el perfil. ¿Iniciaste sesión?');
        this.perfilCargando.set(false);
        this.usosCargando.set(false);
        this.placasCargando.set(false);
      },
    });
  }

  private cargarPerfil(): void {
    this.usuarioService.getCurrentUsuario().subscribe({
      next: (raw) => {
        const v = mapUsuarioMe(raw);
        this.nombrePerfil.set(v.nombre);
        this.documentoPerfil.set(v.documento);
        this.tipoPerfil.set(v.tipo);
        const usosMe = extractNumeroUsosServicio(raw);
        if (usosMe != null) this.numeroUsosServicio.set(usosMe);
        this.perfilError.set(null);
        this.perfilCargando.set(false);
      },
      error: () => {
        this.perfilError.set('No se pudo cargar tu información.');
        this.perfilCargando.set(false);
      },
    });
  }

  private cargarContadorUsos(): void {
    this.usuarioService
      .getCantidadLogins()
      .pipe(
        catchError(() => of(null)),
        finalize(() => this.usosCargando.set(false)),
      )
      .subscribe((raw) => {
        const n = extractNumeroUsosServicio(raw);
        if (n != null) this.numeroUsosServicio.set(n);
        else if (this.numeroUsosServicio() == null) this.numeroUsosServicio.set(0);
      });
  }

  private cargarMediosPago(): void {
    const id = this.idUsuario;
    if (!id) return;
    this.mediosError.set(null);
    this.mediosCargando.set(true);
    this.medioPagoService
      .getMediosPagoByUsuario(id)
      .pipe(
        catchError(() => {
          this.mediosError.set('No se pudieron cargar los medios de pago.');
          return of([]);
        }),
        finalize(() => this.mediosCargando.set(false)),
      )
      .subscribe((raw) => {
        this.mediosPago = mapMediosPagoLista(raw);
      });
  }

  private cargarPlacas(): void {
    this.placasError.set(null);
    this.placasCargando.set(true);
    this.vehiculosService
      .getVehiculos()
      .pipe(
        catchError(() => {
          this.placasError.set('No se pudieron cargar las placas registradas.');
          return of([]);
        }),
        finalize(() => this.placasCargando.set(false)),
      )
      .subscribe((raw) => {
        this.placas = mapVehiculosLista(raw);
      });
  }

  private normalizarPlacaApi(s: string): string {
    return s.trim().replace(/\s+/g, '').replace(/-/g, '').toUpperCase();
  }

  openMedios(): void {
    this.modalMedios = true;
    this.mediosVista = 'lista';
    this.cargarMediosPago();
  }

  closeMedios(): void {
    this.modalMedios = false;
    this.mediosVista = 'lista';
  }

  irAnadirMedio(): void {
    this.tipoMedio = '';
    this.nombreTitularMedio = '';
    this.numeroMedio = '';
    this.cvvMedio = '';
    this.mediosVista = 'anadir';
  }

  volverListaMedios(): void {
    this.mediosVista = 'lista';
  }

  estaEliminandoMedio(id: string): boolean {
    return this.eliminandoMedioId() === id;
  }

  eliminarMedio(m: MedioPagoItem): void {
    const idMedio = Number(m.id);
    if (!Number.isFinite(idMedio) || idMedio <= 0) {
      this.mediosError.set('No se puede eliminar este medio de pago.');
      return;
    }
    this.mediosError.set(null);
    this.eliminandoMedioId.set(m.id);
    this.medioPagoService
      .deleteMedioPago(idMedio)
      .pipe(finalize(() => this.eliminandoMedioId.set(null)))
      .subscribe({
        next: () => this.cargarMediosPago(),
        error: (err) => {
          const e = err as { error?: { message?: string; mensaje?: string } };
          const b = e?.error;
          this.mediosError.set(
            b?.message ?? b?.mensaje ?? 'No se pudo eliminar el medio de pago.',
          );
        },
      });
  }

  guardarMedio(): void {
    const id = this.idUsuario;
    if (!id) return;

    const tipo = (this.tipoMedio || 'Tarjeta').trim().toUpperCase();
    const numeroReferencia =
      this.numeroMedio.trim() || this.nombreTitularMedio.trim();
    if (!tipo || !numeroReferencia) return;

    this.guardandoMedio.set(true);
    this.medioPagoService
      .createMedioPago({
        idUsuario: id,
        tipo,
        numeroReferencia,
        ...(this.cvvMedio.trim() ? { cvv: this.cvvMedio.trim() } : {}),
      })
      .pipe(finalize(() => this.guardandoMedio.set(false)))
      .subscribe({
        next: () => {
          this.volverListaMedios();
          this.cargarMediosPago();
        },
        error: (err) => {
          const e = err as { error?: { message?: string; mensaje?: string } };
          const b = e?.error;
          this.mediosError.set(
            b?.message ?? b?.mensaje ?? 'No se pudo registrar el medio de pago.',
          );
        },
      });
  }

  openEditar(): void {
    this.editNombre = this.nombrePerfil();
    this.editDocumento = this.documentoPerfil();
    this.editTipo = this.tipoPerfil();
    this.modalEditar = true;
  }

  closeEditar(): void {
    this.modalEditar = false;
  }

  guardarPerfil(): void {
    this.nombrePerfil.set(this.editNombre.trim() || this.nombrePerfil());
    this.documentoPerfil.set(this.editDocumento.trim() || this.documentoPerfil());
    this.tipoPerfil.set(this.editTipo.trim() || this.tipoPerfil());
    this.closeEditar();
  }

  openPlaca(): void {
    this.nuevaPlaca = '';
    this.nuevaMarca = '';
    this.modalPlaca = true;
  }

  closePlaca(): void {
    this.modalPlaca = false;
  }

  guardarPlaca(): void {
    const placa = this.normalizarPlacaApi(this.nuevaPlaca);
    const marca = this.nuevaMarca.trim();
    if (!placa || !marca) return;

    this.guardandoPlaca.set(true);
    this.vehiculosService
      .createVehiculo({
        placa,
        marca,
        ...(this.idUsuario ? { idUsuario: this.idUsuario } : {}),
      })
      .pipe(finalize(() => this.guardandoPlaca.set(false)))
      .subscribe({
        next: () => {
          this.closePlaca();
          this.cargarPlacas();
        },
        error: (err) => {
          const e = err as { error?: { message?: string; mensaje?: string } };
          const b = e?.error;
          this.placasError.set(
            b?.message ?? b?.mensaje ?? 'No se pudo registrar la placa.',
          );
        },
      });
  }
}
