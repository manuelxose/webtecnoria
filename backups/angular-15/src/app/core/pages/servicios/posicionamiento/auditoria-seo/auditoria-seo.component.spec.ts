import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuditoriaSeoComponent } from './auditoria-seo.component';

describe('AuditoriaSeoComponent', () => {
  let component: AuditoriaSeoComponent;
  let fixture: ComponentFixture<AuditoriaSeoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AuditoriaSeoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AuditoriaSeoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
