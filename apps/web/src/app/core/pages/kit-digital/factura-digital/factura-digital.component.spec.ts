import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FacturaDigitalComponent } from './factura-digital.component';

describe('FacturaDigitalComponent', () => {
  let component: FacturaDigitalComponent;
  let fixture: ComponentFixture<FacturaDigitalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FacturaDigitalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FacturaDigitalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
