import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { PagosComponent } from './pagos';

describe('PagosComponent', () => {
  let component: PagosComponent;
  let fixture: ComponentFixture<PagosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PagosComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(PagosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
