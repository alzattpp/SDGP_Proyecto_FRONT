
const MYSQL_LOCAL = /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})(?::(\d{2}))?$/;

const ES_ISO = /^\d{4}-\d{2}-\d{2}T/i;

const SOLO_HORA = /^(\d{1,2}):(\d{2})(?::\d{2})?$/;

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

function parseIsoLocal(s: string): Date | null {
  if (!ES_ISO.test(s)) return null;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
}

function formatearDesdeDateLocal(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())} ${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`;
}

export function formatearFechaHoraColombiaDesdeValor(v: unknown): string {
  if (v == null || v === '') return '';

  const s = String(v).trim();
  if (!s) return '';

  const iso = parseIsoLocal(s);
  if (iso) return formatearDesdeDateLocal(iso);

  const mysql = s.match(MYSQL_LOCAL);
  if (mysql) {
    const sec = mysql[6] != null ? pad2(Number(mysql[6])) : '00';
    return `${mysql[1]}-${mysql[2]}-${mysql[3]} ${mysql[4]}:${mysql[5]}:${sec}`;
  }

  const hora = formatearHoraDesdeValor(v);
  return hora || s;
}

export function formatearHoraDesdeValor(v: unknown): string {
  if (v == null || v === '') return '';

  const s = String(v).trim();
  if (!s) return '';

  const iso = parseIsoLocal(s);
  if (iso) {
    return iso.toLocaleTimeString('es-CO', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  }

  const mysql = s.match(MYSQL_LOCAL);
  if (mysql) {
    return aHora12(Number(mysql[4]), Number(mysql[5]));
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

  const iso = parseIsoLocal(s);
  if (iso) return aFechaDmy(iso.getFullYear(), iso.getMonth() + 1, iso.getDate());

  const mysql = s.match(MYSQL_LOCAL);
  if (mysql) {
    return aFechaDmy(Number(mysql[1]), Number(mysql[2]), Number(mysql[3]));
  }

  if (/^\d{4}-\d{2}-\d{2}/.test(s)) {
    const parte = s.slice(0, 10);
    const [y, m, d] = parte.split('-').map(Number);
    if (y && m && d) return aFechaDmy(y, m, d);
  }

  try {
    return new Date(s).toLocaleDateString('es-CO');
  } catch {
    return s;
  }
}

export function tieneComponenteHora(v: unknown): boolean {
  const s = String(v ?? '').trim();
  const iso = parseIsoLocal(s);
  if (iso) {
    return (
      iso.getHours() > 0 ||
      iso.getMinutes() > 0 ||
      iso.getSeconds() > 0
    );
  }
  const mysql = s.match(MYSQL_LOCAL);
  if (mysql) {
    const h = Number(mysql[4]);
    const m = Number(mysql[5]);
    const sec = Number(mysql[6] ?? 0);
    return h > 0 || m > 0 || sec > 0;
  }
  return false;
}
