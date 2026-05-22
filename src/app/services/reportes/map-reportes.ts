import {
  formatearFechaDesdeValor,
  formatearHoraDesdeValor,
} from '../../utils/fecha-hora.util';
import type {
  ReporteIngreso,
  ReporteOcupacion,
  ReportePagos,
} from './reportes';

function rec(v: unknown): Record<string, unknown> | undefined {
  return v && typeof v === 'object' ? (v as Record<string, unknown>) : undefined;
}

export function asReporteArray(raw: unknown): Record<string, unknown>[] {
  if (Array.isArray(raw)) return raw as Record<string, unknown>[];
  const r = rec(raw) ?? {};
  if (Array.isArray(r['data'])) return r['data'] as Record<string, unknown>[];
  return [];
}

export function mapOcupacionReporte(raw: unknown): ReporteOcupacion[] {
  return asReporteArray(raw).map((x) => ({
    idParqueadero: Number(x['idParqueadero'] ?? 0),
    nombre: String(x['nombre'] ?? '').trim(),
    ocupados: Number(x['ocupados'] ?? 0),
    disponibles: Number(x['disponibles'] ?? 0),
  }));
}

export function ocupacionAFilasExcel(items: ReporteOcupacion[]): Record<string, string | number>[] {
  return items.map((o) => {
    const total = o.ocupados + o.disponibles;
    const pctOcup =
      total > 0 ? `${Math.round((o.ocupados / total) * 100)}%` : '0%';
    return {
      Parqueadero: o.nombre || `ID ${o.idParqueadero}`,
      Ocupados: o.ocupados,
      Disponibles: o.disponibles,
      'Capacidad total': total,
      'Ocupación %': pctOcup,
    };
  });
}

export function mapIngresosReporte(raw: unknown): ReporteIngreso[] {
  return asReporteArray(raw).map((x) => ({
    idIngreso: Number(x['idIngreso'] ?? 0),
    placa: String(x['placa'] ?? '').trim(),
    horaIngreso: String(x['horaIngreso'] ?? ''),
    horaSalida: x['horaSalida'] != null ? String(x['horaSalida']) : undefined,
    estado: String(x['estado'] ?? '').trim(),
    nombre: String(x['nombre'] ?? '').trim(),
  }));
}

function formatearFechaHoraReporte(valor: string): string {
  if (!valor) return '—';
  const fecha = formatearFechaDesdeValor(valor);
  const hora = formatearHoraDesdeValor(valor);
  if (fecha && hora) return `${fecha} ${hora}`;
  return fecha || hora || valor;
}

export function ingresosAFilasExcel(items: ReporteIngreso[]): Record<string, string | number>[] {
  return items.map((i) => ({
    'ID ingreso': i.idIngreso,
    Placa: i.placa || '—',
    Parqueadero: i.nombre || '—',
    'Hora ingreso': formatearFechaHoraReporte(i.horaIngreso),
    'Hora salida': i.horaSalida ? formatearFechaHoraReporte(i.horaSalida) : '—',
    Estado: i.estado || '—',
  }));
}

export function mapPagosReporte(raw: unknown): ReportePagos | null {
  const r = rec(raw) ?? {};
  const d = rec(r['data']) ?? r;
  const totalPagos = Number(d['totalPagos'] ?? 0);
  if (!Number.isFinite(totalPagos) && !d['totalRecaudado']) return null;
  return {
    totalPagos: Number(d['totalPagos'] ?? 0),
    totalRecaudado: Number(d['totalRecaudado'] ?? 0),
    promedioPago: Number(d['promedioPago'] ?? 0),
    pagoMayor: Number(d['pagoMayor'] ?? 0),
    pagoMenor: Number(d['pagoMenor'] ?? 0),
  };
}

export function pagosAFilasExcel(resumen: ReportePagos): Record<string, string | number>[] {
  return [
    { Indicador: 'Total de pagos', Valor: resumen.totalPagos },
    {
      Indicador: 'Total recaudado (COP)',
      Valor: resumen.totalRecaudado,
    },
    { Indicador: 'Promedio por pago (COP)', Valor: resumen.promedioPago },
    { Indicador: 'Pago mayor (COP)', Valor: resumen.pagoMayor },
    { Indicador: 'Pago menor (COP)', Valor: resumen.pagoMenor },
  ];
}
