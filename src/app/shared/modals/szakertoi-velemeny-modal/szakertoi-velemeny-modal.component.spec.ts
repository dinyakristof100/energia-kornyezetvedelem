import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SzakertoiVelemenyModalComponent } from './szakertoi-velemeny-modal.component';

describe('SzakertoiVelemenyModalComponent', () => {
  let component: SzakertoiVelemenyModalComponent;
  let fixture: ComponentFixture<SzakertoiVelemenyModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SzakertoiVelemenyModalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SzakertoiVelemenyModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
