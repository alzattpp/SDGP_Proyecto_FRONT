import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { mapUsuarioMe } from '../../services/usuarios/map-usuario-me';
import { UsuarioService } from '../../services/usuarios/usuario.service';

export interface MedioPagoItem {
  id: string;
  detalle: string;
  tipo: string;
}

export interface PlacaItem {
  id: string;
  placa: string;
  marca: string;
}

@Component({
  selector: 'app-perfil',
  imports: [RouterLink, RouterLinkActive, FormsModule],
  templateUrl: './perfil.html',
  styleUrl: './perfil.css',
})
export class PerfilComponent implements OnInit {
  private readonly usuarioService = inject(UsuarioService);

  readonly nombrePerfil = signal('Usuario');
  readonly documentoPerfil = signal('—');
  readonly tipoPerfil = signal('Usuario');
  readonly perfilCargando = signal(true);
  readonly perfilError = signal<string | null>(null);

  mediosPago: MedioPagoItem[] = [
    { id: '1', detalle: '1000-455-8800', tipo: 'VISA' },
    { id: '2', detalle: 'usuario@gmail.com', tipo: 'PSE' },
  ];

  placas: PlacaItem[] = [
    { id: '1', placa: 'AAA-000', marca: 'MAZDA' },
    { id: '2', placa: 'ABC-123', marca: 'BMW' },
  ];

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
    this.usuarioService.getCurrentUsuario().subscribe({
      next: (raw) => {
        const v = mapUsuarioMe(raw);
        this.nombrePerfil.set(v.nombre);
        this.documentoPerfil.set(v.documento);
        this.tipoPerfil.set(v.tipo);
        this.perfilError.set(null);
        this.perfilCargando.set(false);
      },
      error: () => {
        this.perfilError.set('No se pudo cargar el perfil. ¿Iniciaste sesión?');
        this.perfilCargando.set(false);
      },
    });
  }

  openMedios(): void {
    this.modalMedios = true;
    this.mediosVista = 'lista';
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

  guardarMedio(): void {
    const detalle = this.numeroMedio.trim() || this.nombreTitularMedio.trim();
    const tipo = (this.tipoMedio || 'Tarjeta').toUpperCase();
    if (!detalle) return;
    this.mediosPago = [
      ...this.mediosPago,
      { id: `${Date.now()}`, detalle, tipo },
    ];
    this.volverListaMedios();
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
    const p = this.nuevaPlaca.trim().toUpperCase();
    const m = this.nuevaMarca.trim().toUpperCase();
    if (!p || !m) return;
    this.placas = [...this.placas, { id: `${Date.now()}`, placa: p, marca: m }];
    this.closePlaca();
  }
}
