export interface PlacaItem {
  id: string;
  placa: string;
  marca: string;
}

function rec(v: unknown): Record<string, unknown> | undefined {
  return v && typeof v === 'object' ? (v as Record<string, unknown>) : undefined;
}

function asArray(raw: unknown): Record<string, unknown>[] {
  if (Array.isArray(raw)) return raw as Record<string, unknown>[];
  const r = rec(raw) ?? {};
  if (Array.isArray(r['data'])) return r['data'] as Record<string, unknown>[];
  if (Array.isArray(r['vehiculos'])) return r['vehiculos'] as Record<string, unknown>[];
  return [];
}

function extraerIdUsuarioVehiculo(x: Record<string, unknown>): number {
  const id = Number(x['idUsuario'] ?? x['id_usuario'] ?? 0);
  return Number.isFinite(id) && id > 0 ? id : 0;
}

export function mapVehiculosLista(raw: unknown, idUsuario?: number): PlacaItem[] {
  return asArray(raw)
    .filter((x) => {
      if (idUsuario == null || idUsuario <= 0) return true;
      return extraerIdUsuarioVehiculo(x) === idUsuario;
    })
    .map((x) => {
      const placa = String(x['placa'] ?? '').trim();
      const marca = String(x['marca'] ?? '').trim();
      const id = Number(x['idVehiculo'] ?? x['id_vehiculo'] ?? x['id'] ?? 0);
      if (!placa) return null;
      return {
        id: id > 0 ? String(id) : placa,
        placa,
        marca: marca || '—',
      };
    })
    .filter((x): x is PlacaItem => x != null);
}
