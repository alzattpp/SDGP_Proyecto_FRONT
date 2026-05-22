function rec(v: unknown): Record<string, unknown> | undefined {
  return v && typeof v === 'object' ? (v as Record<string, unknown>) : undefined;
}

export function asParqueaderosArray(raw: unknown): Record<string, unknown>[] {
  if (Array.isArray(raw)) return raw as Record<string, unknown>[];
  const r = rec(raw) ?? {};
  if (Array.isArray(r['data'])) return r['data'] as Record<string, unknown>[];
  if (Array.isArray(r['parqueaderos'])) return r['parqueaderos'] as Record<string, unknown>[];
  return [];
}

export function normalizarCuerpoStats(raw: unknown): Record<string, unknown> {
  if (!raw) return {};
  const r = rec(raw) ?? {};
  return (
    rec(r['data']) ??
    rec(r['stats']) ??
    rec(r['parqueadero']) ??
    rec(r['resultado']) ??
    r
  );
}

export interface ParqueaderoListaBase {
  idParqueadero: number;
  nombre: string;
  capacidadTotal: number;
  nota?: string;
}

const NOTA_PAGO =
  'Recuerda que el costo del servicio puede pagarse en taquilla del parqueadero o en línea a través del sistema.';

export function mapParqueaderoListaItem(p: Record<string, unknown>): ParqueaderoListaBase | null {
  const idParqueadero = Number(p['idParqueadero'] ?? p['id'] ?? 0);
  const nombre = String(p['nombre'] ?? p['nombreParqueadero'] ?? '').trim();
  if (idParqueadero <= 0 || !nombre) return null;

  const capacidadTotal = Number(
    p['capacidadMaxima'] ?? p['capacidadTotal'] ?? p['capacidad'] ?? 0,
  );
  const requierePago = Boolean(p['requierePago'] ?? p['requiere_pago']);
  return {
    idParqueadero,
    nombre,
    capacidadTotal: Number.isFinite(capacidadTotal) && capacidadTotal > 0 ? capacidadTotal : 0,
    nota: requierePago ? NOTA_PAGO : undefined,
  };
}

export function porcentajesDesdeStats(
  statsRaw: unknown,
  capacidadFallback: number,
): { capacidadTotal: number; cuposDisponibles: number; ocupacionPct: number; disponibilidadPct: number } {
  const o = normalizarCuerpoStats(statsRaw);
  if (!Object.keys(o).length) {
    return {
      capacidadTotal: capacidadFallback,
      cuposDisponibles: capacidadFallback,
      ocupacionPct: 0,
      disponibilidadPct: 100,
    };
  }

  let capacidadTotal = Number(
    o['capacidadMaxima'] ??
      o['capacidadTotal'] ??
      o['capacidad'] ??
      o['totalCupos'] ??
      rec(o['parqueadero'])?.['capacidadMaxima'] ??
      capacidadFallback,
  );
  if (!Number.isFinite(capacidadTotal) || capacidadTotal <= 0) {
    capacidadTotal = capacidadFallback > 0 ? capacidadFallback : 0;
  }

  let cuposDisponibles = Number(
    o['cuposDisponibles'] ??
      o['disponibles'] ??
      o['libres'] ??
      o['cuposLibres'] ??
      o['espaciosDisponibles'] ??
      -1,
  );

  if (!Number.isFinite(cuposDisponibles) || cuposDisponibles < 0) {
    if (capacidadTotal > 0 && o['ocupados'] != null) {
      const occ = Number(o['ocupados']);
      if (Number.isFinite(occ)) cuposDisponibles = Math.max(0, capacidadTotal - occ);
    } else if (capacidadTotal > 0 && o['cuposOcupados'] != null) {
      const occ = Number(o['cuposOcupados']);
      if (Number.isFinite(occ)) cuposDisponibles = Math.max(0, capacidadTotal - occ);
    } else {
      cuposDisponibles = capacidadTotal;
    }
  }

  if (capacidadTotal > 0) {
    cuposDisponibles = Math.min(Math.max(0, cuposDisponibles), capacidadTotal);
  }

  const ocupacionDirecta = Number(
    o['ocupacionPct'] ?? o['porcentajeOcupacion'] ?? o['ocupacion'] ?? NaN,
  );
  const disponibilidadDirecta = Number(
    o['disponibilidadPct'] ?? o['porcentajeDisponibilidad'] ?? o['disponibilidad'] ?? NaN,
  );

  if (Number.isFinite(ocupacionDirecta) && ocupacionDirecta >= 0) {
    const ocupacionPct = Math.round(Math.min(100, Math.max(0, ocupacionDirecta)));
    const disponibilidadPct = Number.isFinite(disponibilidadDirecta)
      ? Math.round(Math.min(100, Math.max(0, disponibilidadDirecta)))
      : 100 - ocupacionPct;
    return { capacidadTotal, cuposDisponibles, ocupacionPct, disponibilidadPct };
  }

  if (capacidadTotal <= 0) {
    return { capacidadTotal: 0, cuposDisponibles: 0, ocupacionPct: 0, disponibilidadPct: 100 };
  }

  const ocupacionPct = Math.round(
    ((capacidadTotal - cuposDisponibles) / capacidadTotal) * 100,
  );
  return {
    capacidadTotal,
    cuposDisponibles,
    ocupacionPct,
    disponibilidadPct: 100 - ocupacionPct,
  };
}

export interface AdminParqueaderoRow {
  idParqueadero: number;
  nombre: string;
  capacidadTotal: number;
  cuposDisponibles: number;
  requierePago: boolean;
}

export function mapAdminParqueaderoLista(
  p: Record<string, unknown>,
): AdminParqueaderoRow | null {
  const base = mapParqueaderoListaItem(p);
  if (!base) return null;
  return {
    idParqueadero: base.idParqueadero,
    nombre: base.nombre,
    capacidadTotal: base.capacidadTotal,
    cuposDisponibles: base.capacidadTotal,
    requierePago: Boolean(p['requierePago'] ?? p['requiere_pago']),
  };
}

export function mergeAdminParqueaderoStats(
  row: AdminParqueaderoRow,
  statsRaw: unknown,
): AdminParqueaderoRow {
  const pct = porcentajesDesdeStats(statsRaw, row.capacidadTotal);
  return {
    ...row,
    capacidadTotal: pct.capacidadTotal || row.capacidadTotal,
    cuposDisponibles: pct.cuposDisponibles,
  };
}

/** Verde ≤30 %, amarillo 31–70 %, rojo ≥71 % (ocupación). */
export function imagenCarroPorOcupacion(ocupacionPct: number): string {
  if (ocupacionPct <= 30) return '/assets/carroVerde.png';
  if (ocupacionPct <= 70) return '/assets/carroAmarillo.png';
  return '/assets/carroRojo.png';
}
