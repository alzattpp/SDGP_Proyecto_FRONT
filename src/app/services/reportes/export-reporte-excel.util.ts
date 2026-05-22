import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

export interface HojaExcel {
  nombre: string;
  filas: Record<string, string | number>[];
}

export function descargarExcel(nombreArchivo: string, hojas: HojaExcel[]): void {
  const wb = XLSX.utils.book_new();
  for (const hoja of hojas) {
    const filas = hoja.filas.length ? hoja.filas : [{ Mensaje: 'Sin datos' }];
    const ws = XLSX.utils.json_to_sheet(filas);
    const nombreHoja = hoja.nombre.replace(/[\\/?*[\]]/g, '').slice(0, 31) || 'Datos';
    XLSX.utils.book_append_sheet(wb, ws, nombreHoja);
  }
  const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  saveAs(blob, `${nombreArchivo}.xlsx`);
}

export function nombreArchivoReporte(prefijo: string): string {
  const fecha = new Date().toISOString().slice(0, 10);
  return `${prefijo}-${fecha}`;
}
