import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MagyarHirekComponent } from './magyar-hirek.component';

describe('MagyarHirekComponent', () => {
  let component: MagyarHirekComponent;
  let fixture: ComponentFixture<MagyarHirekComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MagyarHirekComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MagyarHirekComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
