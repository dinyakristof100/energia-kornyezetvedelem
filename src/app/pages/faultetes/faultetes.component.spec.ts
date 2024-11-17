import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FaultetesComponent } from './faultetes.component';

describe('FaultetesComponent', () => {
  let component: FaultetesComponent;
  let fixture: ComponentFixture<FaultetesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FaultetesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FaultetesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
