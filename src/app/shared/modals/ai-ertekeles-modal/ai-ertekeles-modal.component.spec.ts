import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AiErtekelesModalComponent } from './ai-ertekeles-modal.component';

describe('AiErtekelesModalComponent', () => {
  let component: AiErtekelesModalComponent;
  let fixture: ComponentFixture<AiErtekelesModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AiErtekelesModalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AiErtekelesModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
