export const ID_USUARIO_EXTERNO = 16;
export const ID_PARQUEADERO_BAVARIA = 2;
export const COSTO_SERVICIO_VISITANTE = 3500;

export const NOTA_VISITANTE =
  'El costo del servicio es de $3.500 y debe pagarse en la taquilla del parqueadero. Registre la marca y la placa de su vehículo; el ingreso  lo confirmará el personal en taquilla suministrando el número de placa.';

export function normalizarPlaca(placa: string): string {
  return placa.trim().replace(/\s+/g, '').toUpperCase();
}
