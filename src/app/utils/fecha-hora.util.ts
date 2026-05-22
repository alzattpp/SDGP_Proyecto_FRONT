
const FECHA_HORA_API =
  /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::(\d{2}))?(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})?$/i;

const SOLO_HORA = /^(\d{1,2}):(\d{2})(?::\d{2})?$/;

interface ComponentesFechaHora {
  y: number;
  mo: number;
  d: number;
  h: number;
  mi: number;
  s: number;
}

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

function aHora12(h24: number, min: number): string {
  const h = h24 % 12 || 12;
  const periodo = h24 >= 12 ? 'p. m.' : 'a. m.';
  return `${h}:${String(min).padStart(2, '0')} ${periodo}`;
}

function aFechaDmy(y: number, m: number, d: number): string {
  return `${d}/${m}/${y}`;
}

function extraerComponentesApi(s: string): ComponentesFechaHora | null {
  const m = s.trim().match(FECHA_HORA_API);
  if (!m) return null;
  return {
    y: Number(m[1]),
    mo: Number(m[2]),
    d: Number(m[3]),
    h: Number(m[4]),
    mi: Number(m[5]),
    s: m[6] != null ? Number(m[6]) : 0,
  };
}

function formatearDesdeComponentes(c: ComponentesFechaHora): string {
  return `${c.y}-${pad2(c.mo)}-${pad2(c.d)} ${pad2(c.h)}:${pad2(c.mi)}:${pad2(c.s)}`;
}

function formatearDesdeDateLocal(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())} ${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`;
}

export function formatearFechaHoraColombiaDesdeValor(v: unknown): string {
  if (v == null || v === '') return '';

  if (v instanceof Date) {
    return formatearDesdeDateLocal(v);
  }

  const s = String(v).trim();
  if (!s) return '';

  const partes = extraerComponentesApi(s);
  if (partes) {
    return formatearDesdeComponentes(partes);
  }

  const hora = formatearHoraDesdeValor(v);
  return hora || s;
}

export function formatearHoraDesdeValor(v: unknown): string {
  if (v == null || v === '') return '';

  if (v instanceof Date) {
    return v.toLocaleTimeString('es-CO', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  }

  const s = String(v).trim();
  if (!s) return '';

  const partes = extraerComponentesApi(s);
  if (partes) {
    return aHora12(partes.h, partes.mi);
  }

  const solo = s.match(SOLO_HORA);
  if (solo) {
    return aHora12(Number(solo[1]), Number(solo[2]));
  }

  return '';
}

export function formatearFechaDesdeValor(v: unknown): string {
  if (v == null || v === '') return '—';

  const s = String(v).trim();
  if (/^\d{1,2}\/\d{1,2}\/\d{4}/.test(s)) return s.split(' ')[0] ?? s;

  const partes = extraerComponentesApi(s);
  if (partes) {
    return aFechaDmy(partes.y, partes.mo, partes.d);
  }

  if (/^\d{4}-\d{2}-\d{2}/.test(s)) {
    const parte = s.slice(0, 10);
    const [y, m, d] = parte.split('-').map(Number);
    if (y && m && d) return aFechaDmy(y, m, d);
  }

  return s;
}

export function tieneComponenteHora(v: unknown): boolean {
  const s = String(v ?? '').trim();
  const partes = extraerComponentesApi(s);
  if (partes) {
    return partes.h > 0 || partes.mi > 0 || partes.s > 0;
  }
  return false;
}

export function esHoraMedianochePlaceholder(v: unknown): boolean {
  if (v == null || v === '') return false;
  const partes = extraerComponentesApi(String(v).trim());
  if (!partes) return false;
  return partes.h === 0 && partes.mi === 0 && partes.s === 0;
}

function recRegistro(v: unknown): Record<string, unknown> | undefined {
  return v && typeof v === 'object' ? (v as Record<string, unknown>) : undefined;
}

export function resolverValorFechaHoraPago(
  pago: Record<string, unknown>,
  ingreso?: Record<string, unknown> | null,
): unknown {
  const ing = ingreso ?? recRegistro(pago['ingreso']);

  const candidatos = [
    pago['fechaHoraPago'],
    pago['fecha_hora_pago'],
    pago['fechaHora'],
    ing?.['horaSalida'],
    ing?.['hora_salida'],
    pago['horaPago'],
    pago['hora_pago'],
    pago['hora'],
    pago['fechaPago'],
    pago['fecha'],
    pago['createdAt'],
    pago['updatedAt'],
  ];

  for (const v of candidatos) {
    if (v == null || v === '') continue;
    const s = String(v).trim();
    if (SOLO_HORA.test(s)) continue;
    if (esHoraMedianochePlaceholder(v)) continue;
    if (extraerComponentesApi(s)) return v;
  }

  return null;
}

export function formatearHoraPagoDesdeRegistro(
  pago: Record<string, unknown>,
  ingreso?: Record<string, unknown> | null,
): string {
  const v = resolverValorFechaHoraPago(pago, ingreso);
  return v ? formatearHoraDesdeValor(v) : '';
}

export function formatearFechaPagoDesdeRegistro(
  pago: Record<string, unknown>,
  ingreso?: Record<string, unknown> | null,
): string {
  const v = resolverValorFechaHoraPago(pago, ingreso);
  if (v) {
    const f = formatearFechaDesdeValor(v);
    if (f && f !== '—') return f;
  }
  return formatearFechaDesdeValor(
    pago['fecha'] ?? pago['fechaPago'] ?? pago['createdAt'],
  );
}
