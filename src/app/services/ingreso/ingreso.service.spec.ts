import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { TEST_PROVIDERS } from '../../../testing/test-providers';
import { Ingreso, IngresoService } from './ingreso.service';

describe('IngresoService', () => {
  let service: IngresoService;
  let httpMock: HttpTestingController;
  const api = 'https://upgrade-store.shop/api/ingresos';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: TEST_PROVIDERS,
    });
    service = TestBed.inject(IngresoService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('debe crear el servicio', () => {
    expect(service).toBeTruthy();
  });

  it('debe obtener ingresos', () => {
    const mockData = [{ idIngreso: 1, placa: 'ABC123' }];

    service.getIngresos().subscribe((res) => {
      expect(res).toEqual(mockData);
    });

    const req = httpMock.expectOne(`${api}/getIngresos`);
    expect(req.request.method).toBe('GET');
    expect(req.request.withCredentials).toBeTrue();
    req.flush(mockData);
  });

  it('debe obtener ingreso por id', () => {
    const mockData = { idIngreso: 5, placa: 'XYZ99' };

    service.getIngresoById(5).subscribe((res) => {
      expect(res).toEqual(mockData);
    });

    const req = httpMock.expectOne(`${api}/findIngreso/5`);
    expect(req.request.method).toBe('GET');
    req.flush(mockData);
  });

  it('debe crear ingreso', () => {
    const body: Ingreso = { placa: 'ABC123', idParqueadero: 2 };
    const mockData = { idIngreso: 10, ...body };

    service.createIngreso(body).subscribe((res) => {
      expect(res).toEqual(mockData);
    });

    const req = httpMock.expectOne(`${api}/createIngreso`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(body);
    expect(req.request.withCredentials).toBeTrue();
    req.flush(mockData);
  });

  it('debe registrar salida', () => {
    const mockData = { ok: true };

    service.registrarSalida(10).subscribe((res) => {
      expect(res).toEqual(mockData);
    });

    const req = httpMock.expectOne(`${api}/salida/10`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.withCredentials).toBeTrue();
    req.flush(mockData);
  });

  it('debe eliminar ingreso', () => {
    service.deleteIngreso(10).subscribe((res) => {
      expect(res).toEqual({ ok: true });
    });

    const req = httpMock.expectOne(`${api}/delete/10`);
    expect(req.request.method).toBe('DELETE');
    expect(req.request.withCredentials).toBeTrue();
    req.flush({ ok: true });
  });

  it('debe manejar error al crear ingreso', () => {
    const body: Ingreso = { placa: 'ERR1', idParqueadero: 2 };

    service.createIngreso(body).subscribe({
      next: () => fail('debía fallar'),
      error: (err) => expect(err.status).toBe(400),
    });

    const req = httpMock.expectOne(`${api}/createIngreso`);
    req.flush('Bad Request', { status: 400, statusText: 'Bad Request' });
  });
});
