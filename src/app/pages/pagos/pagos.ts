import { DecimalPipe } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive } from '@angular/router';
import Swal from 'sweetalert2';

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
  imports: [RouterLink, RouterLinkActive, FormsModule, DecimalPipe],
  templateUrl: './pagos.html',
  styleUrl: './pagos.css',
})
export class PagosComponent {
  placa = 'NAM - 789';
  fecha = '';
  hora = '';
  valorForm = '';
  medioPago = '';

  mostrarFormMedio = false;
  mediosRegistrados: MedioRegistrado[] = [
    { id: '1', tipo: 'VISA', detalle: '1000-455-8800' },
    { id: '2', tipo: 'PSE', detalle: 'usuario@gmail.com' },
  ];
  medioGuardadoId = '';
  nuevoTipoMedio = '';
  nuevoNombreMedio = '';
  nuevoNrMedio = '';
  nuevoCvvMedio = '';

  readonly valorSugerido = 3600;

  historial: PagoHistorial[] = [
    {
      id: '1',
      fecha: '12/03/2026',
      hora: '09:15',
      placa: 'ABC-123',
      valor: 5000,
      medio: 'Tarjeta',
    },
    {
      id: '2',
      fecha: '10/03/2026',
      hora: '14:40',
      placa: 'XYZ-901',
      valor: 3600,
      medio: 'PSE',
    },
  ];

  get valorMostrar(): number {
    const n = parseInt(this.valorForm.replace(/\D/g, ''), 10);
    return Number.isFinite(n) && n > 0 ? n : this.valorSugerido;
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

  aplicarMedioGuardado(): void {
    if (!this.medioGuardadoId) return;
    const m = this.mediosRegistrados.find((x) => x.id === this.medioGuardadoId);
    if (m) this.medioPago = `${m.tipo} · ${m.detalle}`;
  }

  guardarMedioRegistrado(): void {
    const tipo = (this.nuevoTipoMedio || 'Tarjeta').trim();
    const detalle = this.nuevoNrMedio.trim() || this.nuevoNombreMedio.trim();
    if (!detalle) return;
    const id = `${Date.now()}`;
    this.mediosRegistrados = [...this.mediosRegistrados, { id, tipo: tipo.toUpperCase(), detalle }];
    this.medioGuardadoId = id;
    this.medioPago = `${tipo.toUpperCase()} · ${detalle}`;
    this.mostrarFormMedio = false;
  }

  async efectuarPago(): Promise<void> {
    const placa = this.placa.trim() || '—';
    const medio = this.medioPago.trim() || 'Tarjeta';
    const valor = this.valorMostrar;

    this.historial = [
      {
        id: `${Date.now()}`,
        fecha: this.fecha.trim() || new Date().toLocaleDateString('es-CO'),
        hora: this.hora.trim() || new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }),
        placa,
        valor,
        medio,
      },
      ...this.historial,
    ];

    await Swal.fire({
      title: 'Pago registrado',
      text: `Se registró el pago de $${valor.toLocaleString('es-CO')} COP.`,
      icon: 'success',
      confirmButtonText: 'ACEPTAR',
      confirmButtonColor: '#f4d73b',
      color: '#1a2d4d',
    });
  }
}
