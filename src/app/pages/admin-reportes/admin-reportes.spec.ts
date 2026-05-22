import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';

import { TEST_PROVIDERS } from '../../../testing/test-providers';
import {
  resetGuardarBlob,
  setGuardarBlobHandler,
} from '../../services/reportes/export-reporte-excel.util';
import { AdminReportesComponent, REPORTE_TODOS_PARQUEADEROS } from './admin-reportes';

describe('AdminReportesComponent', () => {
  let component: AdminReportesComponent;
  let fixture: ComponentFixture<AdminReportesComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    setGuardarBlobHandler(() => undefined);
    await TestBed.configureTestingModule({
      imports: [
        AdminReportesComponent,
        HttpClientTestingModule,
        FormsModule,
        RouterTestingModule,
      ],
      providers: TEST_PROVIDERS,
    }).compileComponents();

    fixture = TestBed.createComponent(AdminReportesComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
    const reqInit = httpMock.expectOne(
      'https://upgrade-store.shop/api/parqueaderos/getParqueaderos',
    );
    reqInit.flush([]);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
    resetGuardarBlob();
    setGuardarBlobHandler(() => undefined);
  });

  it('debe crear el componente', () => {
    expect(component).toBeTruthy();
  });

  it('debe inicializar filtros en Todos', () => {
    expect(component.parqueaderoOcupacionId).toBe(REPORTE_TODOS_PARQUEADEROS);
    expect(component.parqueaderoIngresosId).toBe(REPORTE_TODOS_PARQUEADEROS);
    expect(component.generando()).toBeFalse();
  });

  it('debe cargar parqueaderos al iniciar', () => {
    component.ngOnInit();
    const req = httpMock.expectOne(
      'https://upgrade-store.shop/api/parqueaderos/getParqueaderos',
    );
    req.flush([
      { idParqueadero: 2, nombre: 'Bavaria', capacidadMaxima: 140, requierePago: true },
    ]);
    fixture.detectChanges();

    expect(component.parqueaderoOpciones().length).toBeGreaterThan(1);
    expect(component.cargandoParqueaderos()).toBeFalse();
  });

  it('debe generar reporte de ocupación general', () => {
    component.generarOcupacion();

    const req = httpMock.expectOne('https://upgrade-store.shop/api/reportes/ocupacion');
    expect(req.request.method).toBe('GET');
    req.flush([{ idParqueadero: 1, nombre: 'A', ocupados: 1, disponibles: 9 }]);

    expect(component.generando()).toBeFalse();
    expect(component.errorMsg()).toBeNull();
  });

  it('debe generar reporte de ocupación por parqueadero', () => {
    component.parqueaderoOpciones.set([
      { id: 0, nombre: 'Todos' },
      { id: 2, nombre: 'Bavaria' },
    ]);
    component.parqueaderoOcupacionId = 2;

    component.generarOcupacion();

    const req = httpMock.expectOne('https://upgrade-store.shop/api/reportes/ocupacion/2');
    expect(req.request.method).toBe('GET');
    req.flush({ idParqueadero: 2, ocupados: 5, disponibles: 5 });

    expect(component.generando()).toBeFalse();
  });

  it('debe manejar error al generar pagos', () => {
    component.generarPagos();

    const req = httpMock.expectOne('https://upgrade-store.shop/api/reportes/pagos');
    req.flush({ mensaje: 'Sin datos' }, { status: 500, statusText: 'Error' });

    expect(component.errorMsg()).toBe('Sin datos');
    expect(component.generando()).toBeFalse();
  });
});
