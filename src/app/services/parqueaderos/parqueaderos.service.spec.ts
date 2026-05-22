import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { TEST_PROVIDERS } from '../../../testing/test-providers';
import { Parqueadero, ParqueaderoService } from './parqueaderos.service';

describe('ParqueaderoService', () => {
  let service: ParqueaderoService;
  let httpMock: HttpTestingController;
  const api = 'https://upgrade-store.shop/api/parqueaderos';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: TEST_PROVIDERS,
    });
    service = TestBed.inject(ParqueaderoService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('debe crear el servicio', () => {
    expect(service).toBeTruthy();
  });

  it('debe obtener parqueaderos', () => {
    const mockData = [{ idParqueadero: 1, nombre: 'Bavaria', capacidadMaxima: 140 }];

    service.getParqueaderos().subscribe((res) => {
      expect(res).toEqual(mockData);
    });

    const req = httpMock.expectOne(`${api}/getParqueaderos`);
    expect(req.request.method).toBe('GET');
    req.flush(mockData);
  });

  it('debe obtener parqueadero por id', () => {
    const mockData = { idParqueadero: 2, nombre: 'Bavaria' };

    service.getParqueaderoById(2).subscribe((res) => {
      expect(res).toEqual(mockData);
    });

    const req = httpMock.expectOne(`${api}/findParqueadero/2`);
    expect(req.request.method).toBe('GET');
    req.flush(mockData);
  });

  it('debe crear parqueadero', () => {
    const body: Parqueadero = {
      nombre: 'Nuevo',
      capacidadMaxima: 50,
      requierePago: true,
    };
    const mockData = { idParqueadero: 5, ...body };

    service.createParqueadero(body).subscribe((res) => {
      expect(res).toEqual(mockData);
    });

    const req = httpMock.expectOne(`${api}/createParqueadero`);
    expect(req.request.method).toBe('POST');
    req.flush(mockData);
  });

  it('debe actualizar parqueadero', () => {
    const body = { capacidadMaxima: 60 };
    const mockData = { idParqueadero: 1, nombre: 'Bavaria', ...body };

    service.updateParqueadero(1, body).subscribe((res) => {
      expect(res).toEqual(mockData);
    });

    const req = httpMock.expectOne(`${api}/updateParqueadero/1`);
    expect(req.request.method).toBe('PUT');
    req.flush(mockData);
  });

  it('debe eliminar parqueadero', () => {
    service.deleteParqueadero(1).subscribe((res) => {
      expect(res).toEqual({ ok: true });
    });

    const req = httpMock.expectOne(`${api}/delete/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush({ ok: true });
  });

  it('debe obtener estadísticas', () => {
    const mockData = { cuposDisponibles: 40, ocupados: 100 };

    service.getParqueaderoStats(2).subscribe((res) => {
      expect(res).toEqual(mockData);
    });

    const req = httpMock.expectOne(`${api}/stats/2`);
    expect(req.request.method).toBe('GET');
    expect(req.request.withCredentials).toBeTrue();
    req.flush(mockData);
  });

  it('debe manejar error al obtener parqueaderos', () => {
    service.getParqueaderos().subscribe({
      next: () => fail('debía fallar'),
      error: (err) => expect(err.status).toBe(500),
    });

    const req = httpMock.expectOne(`${api}/getParqueaderos`);
    req.flush('Error', { status: 500, statusText: 'Server Error' });
  });
});
