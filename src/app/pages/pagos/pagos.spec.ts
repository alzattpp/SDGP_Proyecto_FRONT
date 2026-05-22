import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';

import { TEST_PROVIDERS } from '../../../testing/test-providers';
import { AuthService } from '../../auth/auth.service';
import { PagosComponent } from './pagos';

describe('PagosComponent', () => {
  let component: PagosComponent;
  let fixture: ComponentFixture<PagosComponent>;
  let authService: jasmine.SpyObj<AuthService>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    authService = jasmine.createSpyObj('AuthService', ['loadSession']);
    authService.loadSession.and.returnValue(
      of({ rol: 'usuario', idUsuario: 7 }),
    );

    await TestBed.configureTestingModule({
      imports: [PagosComponent, HttpClientTestingModule, FormsModule, RouterTestingModule],
      providers: [...TEST_PROVIDERS, { provide: AuthService, useValue: authService }],
    }).compileComponents();

    fixture = TestBed.createComponent(PagosComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
    flushForkJoin({
      medios: { data: [] },
      historial: { data: [] },
      ingresos: { data: [] },
      vehiculos: { data: [] },
    });
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('debe crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debe inicializar valores fijos de pago', () => {
    expect(component.idParqueaderoPago).toBe(2);
    expect(component.valorFijo).toBe(3500);
    expect(component.cargando()).toBeFalse();
  });

  it('debe cargar datos del usuario autenticado', () => {
    expect(authService.loadSession).toHaveBeenCalled();
    component.ngOnInit();
    flushForkJoin({
      medios: { data: [{ idMedioPago: 1, tipo: 'Tarjeta', detalle: '****1111' }] },
      historial: { data: [] },
      ingresos: {
        data: [
          {
            idIngreso: 10,
            placa: 'ABC123',
            idParqueadero: 2,
            idUsuario: 7,
            estado: 'En parqueadero',
            horaIngreso: '2026-05-20 10:00:00',
          },
        ],
      },
      vehiculos: { data: [{ placa: 'ABC123', marca: 'Toyota', idUsuario: 7 }] },
    });

    fixture.detectChanges();

    expect(component.cargando()).toBeFalse();
    expect(component.placa).toBe('ABC123');
    expect(component.ingresoActivoParqueadero()).not.toBeNull();
    expect(component.mediosRegistrados.length).toBeGreaterThan(0);
  });

  it('debe actualizar placa con onPlacaChange', () => {
    component.ngOnInit();
    flushForkJoin({
      medios: { data: [] },
      historial: { data: [] },
      ingresos: {
        data: [
          {
            idIngreso: 10,
            placa: 'XYZ99',
            idParqueadero: 2,
            idUsuario: 7,
            estado: 'activo',
            horaIngreso: '2026-05-20 11:00:00',
          },
        ],
      },
      vehiculos: { data: [{ placa: 'XYZ99', idUsuario: 7 }] },
    });
    fixture.detectChanges();

    component.placa = 'XYZ99';
    component.onPlacaChange();
    expect(component.ingresoActivoParqueadero()?.placa).toBe('XYZ99');
  });

  it('debe mostrar error sin ingreso activo para placa', () => {
    component.placa = 'NOEXISTE';
    component.onPlacaChange();
    expect(component.errorMsg()).toContain('ingreso activo');
  });

  function flushForkJoin(payload: {
    medios: object;
    historial: object;
    ingresos: object;
    vehiculos: object;
  }): void {
    const mediosReq = httpMock.expectOne(
      'https://upgrade-store.shop/api/mediopagos/findUsuario/7',
    );
    const historialReq = httpMock.expectOne(
      'https://upgrade-store.shop/api/pagos/findUsuario/7',
    );
    const ingresosReq = httpMock.expectOne(
      'https://upgrade-store.shop/api/ingresos/getIngresos',
    );
    const vehiculosReq = httpMock.expectOne(
      'https://upgrade-store.shop/api/vehiculos/getVehiculos',
    );

    mediosReq.flush(payload.medios);
    historialReq.flush(payload.historial);
    ingresosReq.flush(payload.ingresos);
    vehiculosReq.flush(payload.vehiculos);
  }
});
