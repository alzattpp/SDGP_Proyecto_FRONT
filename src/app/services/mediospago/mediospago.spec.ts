import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { TEST_PROVIDERS } from '../../../testing/test-providers';
import { MedioPagoService } from './mediospago';

describe('MedioPagoService', () => {
  let service: MedioPagoService;
  let httpMock: HttpTestingController;
  const api = 'https://upgrade-store.shop/api/mediopagos';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: TEST_PROVIDERS,
    });
    service = TestBed.inject(MedioPagoService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('debe crear el servicio', () => {
    expect(service).toBeTruthy();
  });

  it('debe obtener medios de pago por usuario', () => {
    const mockData = [{ idMedioPago: 1, tipo: 'Tarjeta' }];

    service.getMediosPagoByUsuario(5).subscribe((res) => {
      expect(res).toEqual(mockData);
    });

    const req = httpMock.expectOne(`${api}/findUsuario/5`);
    expect(req.request.method).toBe('GET');
    req.flush(mockData);
  });
});
