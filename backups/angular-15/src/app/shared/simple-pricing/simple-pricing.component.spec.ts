import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SimplePricingComponent } from './simple-pricing.component';

describe('SimplePricingComponent', () => {
  let component: SimplePricingComponent;
  let fixture: ComponentFixture<SimplePricingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SimplePricingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SimplePricingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
