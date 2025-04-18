import { TestBed } from '@angular/core/testing';

import { JutalomService } from './jutalom.service';

describe('JutalomService', () => {
  let service: JutalomService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(JutalomService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
