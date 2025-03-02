import { TestBed } from '@angular/core/testing';

import { LakasService } from './lakas.service';

describe('LakasService', () => {
  let service: LakasService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LakasService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
