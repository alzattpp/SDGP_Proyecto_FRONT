import { TestBed } from '@angular/core/testing';

import { MedioPagoService } from './mediospago';

describe('MedioPagoService', () => {
  let service: MedioPagoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MedioPagoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
