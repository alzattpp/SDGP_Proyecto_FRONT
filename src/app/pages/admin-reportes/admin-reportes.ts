import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AdminNavbarComponent } from '../../components/admin-navbar/admin-navbar';

@Component({
  selector: 'app-admin-reportes',
  imports: [FormsModule, AdminNavbarComponent],
  templateUrl: './admin-reportes.html',
  styleUrl: './admin-reportes.css',
})
export class AdminReportesComponent {
  parqueaderoSel = 'Biblioteca';

  readonly opciones = ['Biblioteca', 'Cupula', 'Bavaria', 'Todos'];

  modalReporte = false;
  repTipo = '';
  repConFiltroParqueadero = true;
  repParqueadero = '';
  repFechaDesde = '';
  repFechaHasta = '';
  repFormato: 'PDF' | 'Excel' = 'PDF';
  repIncluirGraficos = true;
  repVistaPrevia = '';
  repMostrarResultado = false;

  private hoyIso(): string {
    return new Date().toISOString().slice(0, 10);
  }

  abrirGenerar(tipo: string, conFiltro: boolean): void {
    this.repTipo = tipo;
    this.repConFiltroParqueadero = conFiltro;
    this.repParqueadero = conFiltro ? this.parqueaderoSel : 'Todos';
    this.repFechaDesde = this.hoyIso();
    this.repFechaHasta = this.hoyIso();
    this.repFormato = 'PDF';
    this.repIncluirGraficos = true;
    this.repVistaPrevia = '';
    this.repMostrarResultado = false;
    this.modalReporte = true;
  }

  cerrarModal(): void {
    this.modalReporte = false;
  }

  ejecutarConsulta(): void {
    const filtroTxt = this.repConFiltroParqueadero ? this.repParqueadero : 'Todos los parqueaderos';
    const graf = this.repIncluirGraficos ? 'Sí' : 'No';

    let cuerpo = '';
    switch (this.repTipo) {
      case 'Ocupación actual':
        cuerpo = [
          `Parqueadero(s): ${filtroTxt}`,
          `Cupos totales (simulado): 128`,
          `Ocupados: 74 (58 %) · Libres: 54 (42 %)`,
          `Mayor ocupación hoy: 11:00 – 13:00`,
        ].join('\n');
        break;
      case 'Ingresos vehiculares':
        cuerpo = [
          `Rango: ${this.repFechaDesde} → ${this.repFechaHasta}`,
          `Filtro: ${filtroTxt}`,
          `Entradas registradas: 42 · Salidas: 39`,
          `Ej. NAM-487  entrada 10:40  salida 11:50`,
        ].join('\n');
        break;
      case 'Reservas activas':
        cuerpo = [
          `Filtro: ${filtroTxt}`,
          `Confirmadas: 18 · Pendientes: 5 · Vencidas: 2`,
          `Próxima ventana crítica: mañana 08:00 – 09:30`,
        ].join('\n');
        break;
      default:
        cuerpo = [
          `Consolidado de cobros (${this.repFechaDesde} – ${this.repFechaHasta})`,
          `Total recaudado (simulado): $ 2.450.000 COP`,
          `Últimas 3 transacciones: ADM-PAG-001, ADM-PAG-002, ADM-PAG-003`,
        ].join('\n');
    }

    this.repVistaPrevia = [
      `=== ${this.repTipo.toUpperCase()} ===`,
      `Generado: ${new Date().toLocaleString('es-CO')}`,
      `Formato solicitado: ${this.repFormato} · Gráficos: ${graf}`,
      '',
      cuerpo,
    ].join('\n');
    this.repMostrarResultado = true;
  }

  nuevaConsulta(): void {
    this.repVistaPrevia = '';
    this.repMostrarResultado = false;
  }

  simularDescarga(): void {
    this.repVistaPrevia += `\n\n[Demo] Archivo ${this.repFormato} preparado para descarga.`;
  }
}
