import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TrabajadorNavbarComponent } from '../../components/trabajador-navbar/trabajador-navbar';

export interface RegistroVehiculo {
  placa: string;
  horaIngreso: string;
  estado: string;
}

@Component({
  selector: 'app-gestion',
  imports: [FormsModule, TrabajadorNavbarComponent],
  templateUrl: './gestion.html',
  styleUrl: './gestion.css',
})
export class GestionComponent {
  readonly nombreParqueadero = 'Parqueadero Biblioteca';

  readonly capacidadTotal = 40;
  /** Cupos libres según mockup (~70 % disponibilidad). */
  cuposDisponibles = signal(28);
  readonly ocupacionPct = computed(() => {
    const occ = this.capacidadTotal - this.cuposDisponibles();
    return Math.round((occ / this.capacidadTotal) * 100);
  });
  readonly disponibilidadPct = computed(() => 100 - this.ocupacionPct());

  placaEntrada = '';

  busqueda = '';

  /** Vehículos dentro del parqueadero. */
  registros = signal<RegistroVehiculo[]>([
    { placa: 'NAM - 789', horaIngreso: '10:32 AM', estado: 'En parqueadero' },
    { placa: 'KIK - 205', horaIngreso: '10:35 AM', estado: 'En parqueadero' },
  ]);

  modalSalidaAbierto = signal(false);
  placaSalidaModal = signal('');

  readonly filtrados = computed(() => {
    const q = this.busqueda.trim().toLowerCase().replace(/\s/g, '');
    if (!q) return this.registros();
    return this.registros().filter((r) => r.placa.toLowerCase().replace(/\s/g, '').includes(q));
  });

  imagenCarro(): string {
    const d = this.disponibilidadPct();
    if (d < 35) return '/assets/carroVerde.png';
    if (d <= 75) return '/assets/carroAmarillo.png';
    return '/assets/carroRojo.png';
  }

  registrarEntrada(): void {
    const p = this.placaEntrada.trim().toUpperCase();
    if (!p) return;
    const placaFmt = p.includes('-') ? p : p.replace(/^(.{3})(.*)$/, '$1 - $2');
    const ya = this.registros().some((r) => r.placa.replace(/\s/g, '') === placaFmt.replace(/\s/g, ''));
    if (ya) return;

    const hora = new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: true });
    this.registros.update((list) => [
      ...list,
      { placa: placaFmt, horaIngreso: hora, estado: 'En parqueadero' },
    ]);
    this.cuposDisponibles.update((n) => Math.max(0, n - 1));
    this.placaEntrada = '';
  }

  abrirSalida(placa: string): void {
    this.placaSalidaModal.set(placa);
    this.modalSalidaAbierto.set(true);
  }

  confirmarSalida(): void {
    const placa = this.placaSalidaModal();
    this.registros.update((list) => list.filter((r) => r.placa !== placa));
    this.cuposDisponibles.update((n) => Math.min(this.capacidadTotal, n + 1));
    this.modalSalidaAbierto.set(false);
  }

  cerrarModal(): void {
    this.modalSalidaAbierto.set(false);
  }
}
