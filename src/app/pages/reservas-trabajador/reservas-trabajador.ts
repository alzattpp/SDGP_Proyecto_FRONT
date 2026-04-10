import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { TrabajadorNavbarComponent } from '../../components/trabajador-navbar/trabajador-navbar';

export interface ReservaFila {
  placa: string;
  horaReserva: string;
  estado: string;
}

@Component({
  selector: 'app-reservas-trabajador',
  imports: [FormsModule, TrabajadorNavbarComponent],
  templateUrl: './reservas-trabajador.html',
  styleUrl: './reservas-trabajador.css',
})
export class ReservasTrabajadorComponent {
  busqueda = '';

  private readonly todas = signal<ReservaFila[]>([
    { placa: 'NAM - 789', horaReserva: '10:40 AM', estado: 'Confirmada' },
  ]);

  readonly filtradas = computed(() => {
    const q = this.busqueda.trim().toLowerCase().replace(/\s/g, '');
    if (!q) return this.todas();
    return this.todas().filter((r) => r.placa.toLowerCase().replace(/\s/g, '').includes(q));
  });

  async registrarEntrada(row: ReservaFila): Promise<void> {
    await Swal.fire({
      title: 'Entrada registrada',
      text: `Se registró la entrada del vehículo ${row.placa}.`,
      icon: 'success',
      confirmButtonText: 'ACEPTAR',
      confirmButtonColor: '#f2d03b',
      color: '#1a2d4d',
    });
  }

  async registrarSalida(row: ReservaFila): Promise<void> {
    await Swal.fire({
      title: 'Salida registrada',
      text: `Se registró la salida del vehículo ${row.placa}.`,
      icon: 'success',
      confirmButtonText: 'ACEPTAR',
      confirmButtonColor: '#0069a3',
      color: '#1a2d4d',
    });
  }
}
