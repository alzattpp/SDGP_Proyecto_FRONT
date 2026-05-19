import { formatearHoraDesdeValor } from '../../utils/fecha-hora.util';

function rec(v: unknown): Record<string, unknown> | undefined {
  return v && typeof v === 'object' ? (v as Record<string, unknown>) : undefined;
}

export function asIngresosArray(raw: unknown): Record<string, unknown>[] {
  if (Array.isArray(raw)) return raw as Record<string, unknown>[];
  const r = rec(raw) ?? {};
  if (Array.isArray(r['data'])) return r['data'] as Record<string, unknown>[];
  return [];
}

export function normalizarPlaca(s: string): string {
  return s.trim().replace(/\s+/g, '').replace(/-/g, '').toUpperCase();
}

export function extraerIdParqueadero(x: Record<string, unknown>): number {
  const val =
    x['idParqueadero'] ??
    x['id_parqueadero'] ??
    rec(x['parqueadero'])?.['idParqueadero'] ??
    rec(x['parqueadero'])?.['id'] ??
    0;
  const id = Number(val);
  return Number.isFinite(id) && id > 0 ? id : 0;
}

export function ingresoEnParqueadero(
  x: Record<string, unknown>,
  idParqueadero: number,
): boolean {
  const idP = extraerIdParqueadero(x);
  return idP === idParqueadero;
}

export function extraerIdIngreso(x: Record<string, unknown>): number {
  const val =
    x['idIngreso'] ??
    x['id_ingreso'] ??
    x['idingreso'] ??
    rec(x['ingreso'])?.['idIngreso'] ??
    0;
  const id = Number(val);
  return Number.isFinite(id) && id > 0 ? id : 0;
}

export function ingresoActivo(x: Record<string, unknown>): boolean {
  const est = String(x['estado'] ?? '').toLowerCase();
  if (!est) return true;
  return !est.includes('salida') && !est.includes('finaliz') && !est.includes('cerrad');
}

export function formatearHoraIngreso(x: Record<string, unknown>): string {
  const hi = x['horaIngreso'] ?? rec(x['ingreso'])?.['horaIngreso'];
  return formatearHoraDesdeValor(hi);
}

export interface IngresoResumen {
  idIngreso: number;
  placa: string;
  horaIngreso: string;
  idParqueadero: number;
  idUsuario?: number;
}

export function buildIngresosLookup(
  raw: unknown,
): Map<number, { placa: string; horaIngreso: string }> {
  const map = new Map<number, { placa: string; horaIngreso: string }>();
  for (const x of asIngresosArray(raw)) {
    const resumen = mapIngresoResumen(x);
    if (resumen) {
      map.set(resumen.idIngreso, {
        placa: resumen.placa,
        horaIngreso: resumen.horaIngreso,
      });
    }
  }
  return map;
}

export function mapIngresoResumen(x: Record<string, unknown>): IngresoResumen | null {
  const idIngreso = extraerIdIngreso(x);
  const placa = String(x['placa'] ?? rec(x['vehiculo'])?.['placa'] ?? '').trim();
  if (!idIngreso || !placa) return null;
  const idU = Number(x['idUsuario'] ?? x['id_usuario'] ?? 0);
  const idParqueadero = extraerIdParqueadero(x);
  return {
    idIngreso,
    placa,
    horaIngreso: formatearHoraIngreso(x),
    idParqueadero,
    ...(idU > 0 ? { idUsuario: idU } : {}),
  };
}
