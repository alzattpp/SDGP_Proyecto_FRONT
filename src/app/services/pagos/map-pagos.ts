import type { PagoHistorial } from '../../pages/pagos/pagos';
import {
  formatearFechaPagoDesdeRegistro,
  formatearHoraPagoDesdeRegistro,
} from '../../utils/fecha-hora.util';

export interface PagosHistorialContext {
  ingresosPorId: Map<number, { placa: string; horaSalida: string }>;
  mediosPorId: Map<number, { tipo: string; detalle: string }>;
}

function rec(v: unknown): Record<string, unknown> | undefined {
  return v && typeof v === 'object' ? (v as Record<string, unknown>) : undefined;
}

function asArray(raw: unknown): Record<string, unknown>[] {
  if (Array.isArray(raw)) return raw as Record<string, unknown>[];
  const r = rec(raw) ?? {};
  if (Array.isArray(r['data'])) return r['data'] as Record<string, unknown>[];
  if (Array.isArray(r['pagos'])) return r['pagos'] as Record<string, unknown>[];
  return [];
}

function etiquetaMedio(tipo: string, detalle: string): string {
  const t = tipo.trim();
  const d = detalle.trim();
  if (t && d) return `${t} — ${d}`;
  return t || d || '—';
}

export function buildMediosLookup(
  medios: { id: string; tipo: string; detalle: string }[],
): Map<number, { tipo: string; detalle: string }> {
  const map = new Map<number, { tipo: string; detalle: string }>();
  for (const m of medios) {
    const id = Number(m.id);
    if (id > 0) map.set(id, { tipo: m.tipo, detalle: m.detalle });
  }
  return map;
}

export function mapPagosHistorial(
  raw: unknown,
  ctx?: PagosHistorialContext,
): PagoHistorial[] {
  return asArray(raw)
    .map((x) => {
      const id = Number(x['idPago'] ?? x['id'] ?? 0);
      const ing = rec(x['ingreso']);
      const med = rec(x['medioPago']) ?? rec(x['medio']);

      const idIngreso = Number(
        x['idIngreso'] ?? ing?.['idIngreso'] ?? ing?.['id'] ?? 0,
      );
      const idMedioPago = Number(
        x['idMedioPago'] ??
          x['id_medio_pago'] ??
          med?.['idMedioPago'] ??
          med?.['id'] ??
          0,
      );

      let placa = String(x['placa'] ?? ing?.['placa'] ?? '').trim();
      const monto = Number(x['monto'] ?? x['valor'] ?? 0);

      const fecha = formatearFechaPagoDesdeRegistro(x, ing);

      let hora = formatearHoraPagoDesdeRegistro(x, ing);
      if (!hora && ctx && idIngreso > 0) {
        hora = ctx.ingresosPorId.get(idIngreso)?.horaSalida ?? '';
      }

      let medio = etiquetaMedio(
        String(med?.['tipo'] ?? x['tipoMedio'] ?? ''),
        String(
          med?.['numeroReferencia'] ??
            med?.['numero'] ??
            x['numeroReferencia'] ??
            '',
        ),
      );
      if (medio === '—') {
        const mFlat = String(x['medio'] ?? '').trim();
        if (mFlat && !/^\d+$/.test(mFlat)) medio = mFlat;
      }

      if (ctx && idIngreso > 0) {
        const ingLookup = ctx.ingresosPorId.get(idIngreso);
        if (ingLookup && !placa) placa = ingLookup.placa;
      }

      if (!hora) hora = '—';

      if (ctx && idMedioPago > 0 && (medio === '—' || /^\d+$/.test(medio))) {
        const medLookup = ctx.mediosPorId.get(idMedioPago);
        if (medLookup) medio = etiquetaMedio(medLookup.tipo, medLookup.detalle);
      }

      if (!placa && monto <= 0) return null;

      return {
        id: id > 0 ? String(id) : `${fecha}-${placa || idIngreso}-${monto}`,
        fecha,
        hora,
        placa: placa || '—',
        valor: Number.isFinite(monto) ? monto : 0,
        medio: medio || '—',
      };
    })
    .filter((x): x is PagoHistorial => x != null);
}
