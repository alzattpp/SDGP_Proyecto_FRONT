import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { TEST_PROVIDERS } from '../../../testing/test-providers';
import { Reportes } from './reportes';

describe('Reportes', () => {
  let service: Reportes;
  let httpMock: HttpTestingController;
  const api = 'https://upgrade-store.shop/api/reportes';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: TEST_PROVIDERS,
    });
    service = TestBed.inject(Reportes);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('debe crear el servicio', () => {
    expect(service).toBeTruthy();
  });

  it('debe obtener ocupación general', () => {
    const mockData = [{ idParqueadero: 1, ocupados: 10, disponibles: 5 }];

    service.getOcupacion().subscribe((res) => {
      expect(res).toEqual(mockData);
    });

    const req = httpMock.expectOne(`${api}/ocupacion`);
    expect(req.request.method).toBe('GET');
    expect(req.request.withCredentials).toBeTrue();
    req.flush(mockData);
  });

  it('debe obtener ocupación por parqueadero', () => {
    const mockData = { idParqueadero: 2, ocupados: 3, disponibles: 7 };

    service.getOcupacionByParqueadero(2).subscribe((res) => {
      expect(res).toEqual(mockData);
    });

    const req = httpMock.expectOne(`${api}/ocupacion/2`);
    expect(req.request.method).toBe('GET');
    req.flush(mockData);
  });

  it('debe obtener ingresos del reporte', () => {
    const mockData = [{ idIngreso: 1, placa: 'ABC' }];

    service.getIngresosReporte().subscribe((res) => {
      expect(res).toEqual(mockData);
    });

    const req = httpMock.expectOne(`${api}/ingresos`);
    expect(req.request.method).toBe('GET');
    req.flush(mockData);
  });

  it('debe obtener ingresos por parqueadero', () => {
    const mockData = [{ idIngreso: 2, placa: 'XYZ' }];

    service.getIngresosReporteByParqueadero(2).subscribe((res) => {
      expect(res).toEqual(mockData);
    });

    const req = httpMock.expectOne(`${api}/ingresos/2`);
    expect(req.request.method).toBe('GET');
    req.flush(mockData);
  });

  it('debe obtener pagos del reporte', () => {
    const mockData = { totalPagos: 5, totalRecaudado: 10000 };

    service.getPagosReporte().subscribe((res) => {
      expect(res).toEqual(mockData);
    });

    const req = httpMock.expectOne(`${api}/pagos`);
    expect(req.request.method).toBe('GET');
    req.flush(mockData);
  });

  it('debe manejar error en ocupación', () => {
    service.getOcupacion().subscribe({
      next: () => fail('debía fallar'),
      error: (err) => expect(err.status).toBe(503),
    });

    const req = httpMock.expectOne(`${api}/ocupacion`);
    req.flush('Error', { status: 503, statusText: 'Unavailable' });
  });
});
