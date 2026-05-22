import {
  asParqueaderosArray,
  mapParqueaderoListaItem,
} from '../parqueaderos/map-parqueaderos-vista';
import {
  asIngresosArray,
  extraerIdIngreso,
  extraerIdParqueadero,
  mapIngresoResumen,
} from '../ingreso/map-ingreso';
import {
  formatearFechaDesdeValor,
  formatearFechaHoraColombiaDesdeValor,
  formatearFechaPagoDesdeRegistro,
  formatearHoraDesdeValor,
  formatearHoraPagoDesdeRegistro,
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

export interface AdminPagoRow {
  idPago: number;
  placa: string;
  horaIngreso: string;
  horaSalida: string;
  fechaPago: string;
  horaPago: string;
  valor: number;
  totalLabel: string;
  medio: string;
  medioDetalle: string;
  nombrePagador: string;
  nombreParqueadero: string;
  estado: string;
  referencia: string;
  idIngreso: number;
  idUsuario: number;
}

function formatearMontoCop(monto: number): string {
  if (!Number.isFinite(monto)) return '—';
  return `$${monto.toLocaleString('es-CO')} COP`;
}

function buildParqueaderosNombreLookup(raw: unknown): Map<number, string> {
  const map = new Map<number, string>();
  for (const x of asParqueaderosArray(raw)) {
    const item = mapParqueaderoListaItem(x);
    if (item) map.set(item.idParqueadero, item.nombre);
  }
  return map;
}

function buildIngresosAdminLookup(
  raw: unknown,
): Map<number, { placa: string; horaIngreso: string; horaSalida: string; idParqueadero: number }> {
  const map = new Map<
    number,
    { placa: string; horaIngreso: string; horaSalida: string; idParqueadero: number }
  >();
  for (const x of asIngresosArray(raw)) {
    const resumen = mapIngresoResumen(x);
    if (!resumen) continue;
    const horaSalida =
      formatearHoraDesdeValor(
        x['horaSalida'] ?? x['hora_salida'] ?? rec(x['ingreso'])?.['horaSalida'],
      ) || '—';
    map.set(resumen.idIngreso, {
      placa: resumen.placa,
      horaIngreso: resumen.horaIngreso,
      horaSalida,
      idParqueadero: resumen.idParqueadero,
    });
  }
  return map;
}

function mapPagoAFilaAdmin(
  x: Record<string, unknown>,
  ingresosLookup: Map<
    number,
    { placa: string; horaIngreso: string; horaSalida: string; idParqueadero: number }
  >,
  mediosPorId: Map<number, { tipo: string; detalle: string }>,
  usuariosPorId: Map<number, string>,
  parqueaderosPorId: Map<number, string>,
): AdminPagoRow {
  const idPago = Number(x['idPago'] ?? x['id'] ?? 0);
  const ing = rec(x['ingreso']);
  const idIngreso = Number(x['idIngreso'] ?? ing?.['idIngreso'] ?? ing?.['id'] ?? 0);
  const ingresoInfo = idIngreso > 0 ? ingresosLookup.get(idIngreso) : undefined;

  let placa = String(x['placa'] ?? ing?.['placa'] ?? ingresoInfo?.placa ?? '').trim();
  const monto = Number(x['monto'] ?? x['valor'] ?? 0);
  const fechaPago = formatearFechaPagoDesdeRegistro(x, ing) || '—';
  const horaPago =
    formatearHoraPagoDesdeRegistro(x, ing) ||
    (ingresoInfo?.horaSalida !== '—' ? ingresoInfo?.horaSalida : '') ||
    '—';
  const horaIngreso =
    ingresoInfo?.horaIngreso ||
    formatearHoraDesdeValor(ing?.['horaIngreso'] ?? x['horaIngreso']) ||
    '—';
  const horaSalida =
    ingresoInfo?.horaSalida ||
    formatearHoraDesdeValor(ing?.['horaSalida'] ?? x['horaSalida']) ||
    '—';

  const idParqueadero = Number(
    ingresoInfo?.idParqueadero ??
      extraerIdParqueadero(ing ?? {}) ??
      extraerIdParqueadero(x) ??
      0,
  );
  const nombreParqueadero =
    (idParqueadero > 0 ? parqueaderosPorId.get(idParqueadero) : undefined) ??
    (idParqueadero > 0 ? `Parqueadero #${idParqueadero}` : '—');

  const { medio, detalle } = extraerMedio(x, mediosPorId);
  const nombrePagador = nombrePagadorDesdePago(x, usuariosPorId) || '—';
  const idUsuario = Number(x['idUsuario'] ?? x['id_usuario'] ?? 0);
  const referencia =
    idPago > 0 ? `PAG-${idPago}` : String(x['referencia'] ?? x['numeroReferencia'] ?? '—');

  return {
    idPago,
    placa: placa || '—',
    horaIngreso,
    horaSalida,
    fechaPago: fechaPago || '—',
    horaPago,
    valor: Number.isFinite(monto) ? monto : 0,
    totalLabel: formatearMontoCop(monto),
    medio: medio !== '—' ? medio : '—',
    medioDetalle: detalle,
    nombrePagador,
    nombreParqueadero,
    estado: etiquetaEstadoTabla(x),
    referencia,
    idIngreso,
    idUsuario: Number.isFinite(idUsuario) ? idUsuario : 0,
  };
}

export function mapPagosAdminLista(
  rawPagos: unknown,
  rawIngresos: unknown,
  rawMedios?: unknown,
  rawUsuarios?: unknown,
  rawParqueaderos?: unknown,
): AdminPagoRow[] {
  const mediosPorId = buildMediosPagoLookup(rawMedios ?? []);
  const usuariosPorId = buildUsuariosNombreLookup(rawUsuarios ?? []);
  const ingresosLookup = buildIngresosAdminLookup(rawIngresos);
  const parqueaderosPorId = buildParqueaderosNombreLookup(rawParqueaderos ?? []);

  return asPagosArray(rawPagos)
    .filter((x) => esPagoListable(x))
    .map((x) =>
      mapPagoAFilaAdmin(x, ingresosLookup, mediosPorId, usuariosPorId, parqueaderosPorId),
    )
    .filter((x) => x.idPago > 0 || x.placa !== '—' || x.valor > 0)
    .sort((a, b) => b.idPago - a.idPago);
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

  const parqueaderosPorId = buildParqueaderosNombreLookup([]);
  const ingresosAdminLookup = buildIngresosAdminLookup(rawIngresos);

  return filtrados
    .map((x) => {
      const fila = mapPagoAFilaAdmin(
        x,
        ingresosAdminLookup,
        mediosPorId,
        usuariosPorId,
        parqueaderosPorId,
      );
      const fechaHoraPago =
        formatearFechaHoraColombiaDesdeValor(
          x['fecha'] ?? x['fechaPago'] ?? x['createdAt'],
        ) || `${fila.fechaPago} ${fila.horaPago}`;

      return {
        idPago: fila.idPago,
        placa: fila.placa,
        horaPago: fila.horaPago,
        fechaPago: fila.fechaPago,
        fechaHoraPago,
        estado: fila.estado,
        medio: fila.medio,
        medioDetalle: fila.medioDetalle,
        valor: fila.valor,
        horaIngreso: fila.horaIngreso,
        idIngreso: fila.idIngreso,
        nombrePagador: fila.nombrePagador,
      };
    })
    .filter((x) => x.idPago > 0 || x.placa !== '—' || x.valor > 0)
    .sort((a, b) => b.idPago - a.idPago);
}
