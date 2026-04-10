import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive } from '@angular/router';

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
export class PerfilComponent {
  nombrePerfil = 'Usuario';
  documentoPerfil = '5555555555';
  tipoPerfil = 'Institucional';

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
    this.editNombre = this.nombrePerfil;
    this.editDocumento = this.documentoPerfil;
    this.editTipo = this.tipoPerfil;
    this.modalEditar = true;
  }

  closeEditar(): void {
    this.modalEditar = false;
  }

  guardarPerfil(): void {
    this.nombrePerfil = this.editNombre.trim() || this.nombrePerfil;
    this.documentoPerfil = this.editDocumento.trim() || this.documentoPerfil;
    this.tipoPerfil = this.editTipo.trim() || this.tipoPerfil;
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
