import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { TEST_PROVIDERS } from '../../../testing/test-providers';
import { AdministradorService } from './administrador.service';

describe('AdministradorService', () => {
  let service: AdministradorService;
  let httpMock: HttpTestingController;
  const api = 'https://upgrade-store.shop/api/administradores';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: TEST_PROVIDERS,
    });
    service = TestBed.inject(AdministradorService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('debe crear el servicio', () => {
    expect(service).toBeTruthy();
  });

  it('debe obtener administradores', () => {
    const mockData = [{ idAdministrador: 1, nombreCompleto: 'Admin' }];

    service.getAdministradores().subscribe((res) => {
      expect(res).toEqual(mockData);
    });

    const req = httpMock.expectOne(`${api}/getAdministradores`);
    expect(req.request.method).toBe('GET');
    req.flush(mockData);
  });
});
