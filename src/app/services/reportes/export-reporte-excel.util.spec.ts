import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { TEST_PROVIDERS } from '../../../testing/test-providers';
import {
  descargarExcel,
  nombreArchivoReporte,
  resetGuardarBlob,
  setGuardarBlobHandler,
} from './export-reporte-excel.util';

describe('export-reporte-excel.util', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: TEST_PROVIDERS,
    });
    setGuardarBlobHandler(() => undefined);
  });

  afterEach(() => {
    resetGuardarBlob();
    setGuardarBlobHandler(() => undefined);
  });

  it('debe generar nombre de archivo con prefijo y fecha', () => {
    const nombre = nombreArchivoReporte('ocupacion');
    expect(nombre).toMatch(/^ocupacion-\d{4}-\d{2}-\d{2}$/);
  });

  it('debe invocar guardarBlob sin tocar location del navegador', () => {
    const guardar = jasmine.createSpy('guardarBlob');
    setGuardarBlobHandler(guardar);

    descargarExcel('reporte-test', [
      { nombre: 'Datos', filas: [{ Col: 'valor' }] },
    ]);

    expect(guardar).toHaveBeenCalledTimes(1);
    const [blob, nombre] = guardar.calls.mostRecent().args as [Blob, string];
    expect(blob).toBeInstanceOf(Blob);
    expect(nombre).toBe('reporte-test.xlsx');
  });
});
