import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CenzuraAdminComponent } from './cenzura-admin.component';

describe('CenzuraAdminComponent', () => {
  let component: CenzuraAdminComponent;
  let fixture: ComponentFixture<CenzuraAdminComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CenzuraAdminComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CenzuraAdminComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
