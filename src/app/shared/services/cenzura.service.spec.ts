import { TestBed } from '@angular/core/testing';

import { CenzuraService } from './cenzura.service';

describe('CenzuraService', () => {
  let service: CenzuraService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CenzuraService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
