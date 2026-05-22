import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { ParqueaderoService } from '../../services/parqueaderos/parqueaderos.service';
import { ParqueaderosComponent } from './parqueaderos';

describe('ParqueaderosComponent', () => {
  let component: ParqueaderosComponent;
  let fixture: ComponentFixture<ParqueaderosComponent>;

  beforeEach(async () => {
    const parqueaderoService = jasmine.createSpyObj<ParqueaderoService>(
      'ParqueaderoService',
      ['getParqueaderos', 'getParqueaderoStats'],
    );
    parqueaderoService.getParqueaderos.and.returnValue(of([]));
    parqueaderoService.getParqueaderoStats.and.returnValue(of({}));

    await TestBed.configureTestingModule({
      imports: [ParqueaderosComponent],
      providers: [
        provideRouter([]),
        { provide: ParqueaderoService, useValue: parqueaderoService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ParqueaderosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
