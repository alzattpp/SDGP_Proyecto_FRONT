import {
  asIngresosArray,
  buildIngresosLookup,
  extraerIdIngreso,
  extraerIdParqueadero,
} from '../ingreso/map-ingreso';
import {
  formatearFechaDesdeValor,
  formatearFechaHoraColombiaDesdeValor,
  formatearHoraDesdeValor,
} from '../../utils/fecha-hora.util';

export interface PagoTrabajadorRow {
  idPago: number;
  placa: string;
  horaPago: string;
  fechaPago: string;
  fechaHoraPago: string;
  estado: string;
  medio: string;
  medioDetalle: string;
  valor: number;
  horaIngreso: string;
  idIngreso: number;
  nombrePagador: string;
}

function rec(v: unknown): Record<string, unknown> | undefined {
  return v && typeof v === 'object' ? (v as Record<string, unknown>) : undefined;
}

function asPagosArray(raw: unknown): Record<string, unknown>[] {
  if (Array.isArray(raw)) return raw as Record<string, unknown>[];
  const r = rec(raw) ?? {};
  if (Array.isArray(r['data'])) return r['data'] as Record<string, unknown>[];
  if (Array.isArray(r['pagos'])) return r['pagos'] as Record<string, unknown>[];
  return [];
}

/** Incluye PENDIENTE, CONFIRMADO, etc. (como devuelve el API). Excluye solo rechazados/anulados. */
function esPagoListable(x: Record<string, unknown>): boolean {
  const est = String(x['estado'] ?? '').toLowerCase().trim();
  if (!est) return true;
  return (
    !est.includes('rechaz') &&
    !est.includes('cancel') &&
    !est.includes('anul') &&
    !est.includes('fallid')
  );
}

function etiquetaEstadoTabla(x: Record<string, unknown>): string {
  const est = String(x['estado'] ?? '').toLowerCase().trim();
  if (
    est.includes('confirm') ||
    est.includes('pagad') ||
    est.includes('complet') ||
    est.includes('aprob')
  ) {
    return 'Confirmado';
  }
  if (est.includes('pend')) return 'Pendiente';
  return est ? est.charAt(0).toUpperCase() + est.slice(1) : 'Confirmado';
}
/** Igual que gestión: sin idParqueadero en el JSON se asume el del trabajador. */
function perteneceAlParqueadero(
  x: Record<string, unknown>,
  idParqueadero: number,
): boolean {
  const xp = extraerIdParqueadero(x);
  return !xp || xp === idParqueadero;
}

function pagoDelParqueadero(
  x: Record<string, unknown>,
  idParqueadero: number,
  ingresosIdsParqueadero: Set<number>,
  ingresosLista: Record<string, unknown>[],
): boolean {
  const ing = rec(x['ingreso']);
  const idIngreso = Number(
    x['idIngreso'] ?? ing?.['idIngreso'] ?? ing?.['id'] ?? 0,
  );

  if (idIngreso > 0) {
    if (ingresosIdsParqueadero.has(idIngreso)) return true;
    const fila = ingresosLista.find((i) => extraerIdIngreso(i) === idIngreso);
    if (fila && perteneceAlParqueadero(fila, idParqueadero)) return true;
  }

  if (ing && perteneceAlParqueadero(ing, idParqueadero)) return true;

  const idPq = extraerIdParqueadero(x);
  return idPq > 0 && idPq === idParqueadero;
}

function etiquetaMedio(tipo: string, detalle: string): string {
  const t = tipo.trim();
  const d = detalle.trim();
  if (t && d) return `${t} — ${d}`;
  return t || d || '—';
}

function extraerMedio(
  x: Record<string, unknown>,
  mediosPorId?: Map<number, { tipo: string; detalle: string }>,
): { medio: string; detalle: string } {
  const med = rec(x['medioPago']) ?? rec(x['medio']);
  const idMedio = Number(
    x['idMedioPago'] ?? x['id_medio_pago'] ?? med?.['idMedioPago'] ?? med?.['id'] ?? 0,
  );

  let tipo = String(med?.['tipo'] ?? x['tipoMedio'] ?? '').trim();
  let detalle = String(
    med?.['numeroReferencia'] ?? med?.['numero'] ?? x['numeroReferencia'] ?? '',
  ).trim();

  if (idMedio > 0 && mediosPorId?.has(idMedio)) {
    const m = mediosPorId.get(idMedio)!;
    if (!tipo) tipo = m.tipo;
    if (!detalle) detalle = m.detalle;
  }

  const medio = tipo || (detalle ? 'Medio de pago' : idMedio > 0 ? `Medio #${idMedio}` : '—');
  return { medio, detalle };
}

function asMediosArray(raw: unknown): Record<string, unknown>[] {
  if (Array.isArray(raw)) return raw as Record<string, unknown>[];
  const r = rec(raw) ?? {};
  if (Array.isArray(r['data'])) return r['data'] as Record<string, unknown>[];
  if (Array.isArray(r['mediosPago'])) return r['mediosPago'] as Record<string, unknown>[];
  return [];
}

function asUsuariosArray(raw: unknown): Record<string, unknown>[] {
  if (Array.isArray(raw)) return raw as Record<string, unknown>[];
  const r = rec(raw) ?? {};
  if (Array.isArray(r['data'])) return r['data'] as Record<string, unknown>[];
  if (Array.isArray(r['usuarios'])) return r['usuarios'] as Record<string, unknown>[];
  return [];
}

function extraerNombreUsuario(u: Record<string, unknown> | undefined): string {
  if (!u) return '';
  const partes = [u['nombre'], u['apellido']]
    .filter((v) => v != null && String(v).trim())
    .map((v) => String(v).trim());
  if (partes.length) return partes.join(' ');
  return String(u['nombreCompleto'] ?? u['name'] ?? u['nombre'] ?? '').trim();
}

export function buildUsuariosNombreLookup(raw: unknown): Map<number, string> {
  const map = new Map<number, string>();
  for (const x of asUsuariosArray(raw)) {
    const id = Number(x['idUsuario'] ?? x['id'] ?? 0);
    const nombre = extraerNombreUsuario(x);
    if (id > 0 && nombre) map.set(id, nombre);
  }
  return map;
}

function nombrePagadorDesdePago(
  x: Record<string, unknown>,
  usuariosPorId: Map<number, string>,
): string {
  const usr = rec(x['usuario']) ?? rec(x['user']);
  const directo = extraerNombreUsuario(usr);
  if (directo) return directo;

  const idUsuario = Number(
    x['idUsuario'] ?? x['id_usuario'] ?? usr?.['idUsuario'] ?? usr?.['id'] ?? 0,
  );
  if (idUsuario > 0) {
    const nom = usuariosPorId.get(idUsuario);
    if (nom) return nom;
  }
  return '';
}

export function buildMediosPagoLookup(
  raw: unknown,
): Map<number, { tipo: string; detalle: string }> {
  const map = new Map<number, { tipo: string; detalle: string }>();
  for (const x of asMediosArray(raw)) {
    const id = Number(x['idMedioPago'] ?? x['id'] ?? 0);
    if (id <= 0) continue;
    map.set(id, {
      tipo: String(x['tipo'] ?? '').trim(),
      detalle: String(x['numeroReferencia'] ?? x['numero'] ?? '').trim(),
    });
  }
  return map;
}

export function mapPagosTrabajadorLista(
  rawPagos: unknown,
  rawIngresos: unknown,
  idParqueadero: number,
  rawMedios?: unknown,
  rawUsuarios?: unknown,
): PagoTrabajadorRow[] {
  const mediosPorId = buildMediosPagoLookup(rawMedios ?? []);
  const usuariosPorId = buildUsuariosNombreLookup(rawUsuarios ?? []);
  const ingresosLista = asIngresosArray(rawIngresos);
  const ingresosLookup = buildIngresosLookup(rawIngresos);

  const ingresosDelParqueadero = new Set<number>();
  for (const x of ingresosLista) {
    if (!perteneceAlParqueadero(x, idParqueadero)) continue;
    const id = extraerIdIngreso(x);
    if (id > 0) ingresosDelParqueadero.add(id);
  }

  const pagosLista = asPagosArray(rawPagos);
  let filtrados = pagosLista
    .filter((x) => esPagoListable(x))
    .filter((x) =>
      pagoDelParqueadero(x, idParqueadero, ingresosDelParqueadero, ingresosLista),
    );

  if (!filtrados.length && pagosLista.length) {
    filtrados = pagosLista.filter((x) => esPagoListable(x));
  }

  return filtrados
    .map((x) => {
      const idPago = Number(x['idPago'] ?? x['id'] ?? 0);
      const ing = rec(x['ingreso']);
      const idIngreso = Number(
        x['idIngreso'] ?? ing?.['idIngreso'] ?? ing?.['id'] ?? 0,
      );
      const ingresoInfo = idIngreso > 0 ? ingresosLookup.get(idIngreso) : undefined;

      let placa = String(x['placa'] ?? ing?.['placa'] ?? ingresoInfo?.placa ?? '').trim();
      const monto = Number(x['monto'] ?? x['valor'] ?? 0);

      const fechaRaw = x['fecha'] ?? x['fechaPago'] ?? x['createdAt'];
      const fechaPago = formatearFechaDesdeValor(fechaRaw);
      const horaPago = formatearHoraDesdeValor(fechaRaw) || '—';
      const fechaHoraPago =
        formatearFechaHoraColombiaDesdeValor(fechaRaw) || `${fechaPago} ${horaPago}`;

      const horaIngreso =
        ingresoInfo?.horaIngreso ||
        formatearHoraDesdeValor(ing?.['horaIngreso'] ?? x['horaIngreso']) ||
        '—';

      const { medio, detalle } = extraerMedio(x, mediosPorId);
      const nombrePagador = nombrePagadorDesdePago(x, usuariosPorId) || '—';

      return {
        idPago,
        placa: placa || '—',
        horaPago,
        fechaPago,
        fechaHoraPago,
        estado: etiquetaEstadoTabla(x),
        medio: medio !== '—' ? medio : '—',
        medioDetalle: detalle,
        valor: Number.isFinite(monto) ? monto : 0,
        horaIngreso,
        idIngreso,
        nombrePagador,
      };
    })
    .filter((x) => x.idPago > 0 || x.placa !== '—' || x.valor > 0)
    .sort((a, b) => b.idPago - a.idPago);
}
