import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LakasModalComponent } from './lakas-modal.component';

describe('LakasModalComponent', () => {
  let component: LakasModalComponent;
  let fixture: ComponentFixture<LakasModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LakasModalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LakasModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
