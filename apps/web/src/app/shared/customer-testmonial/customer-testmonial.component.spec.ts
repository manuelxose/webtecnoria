import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerTestmonialComponent } from './customer-testmonial.component';

describe('CustomerTestmonialComponent', () => {
  let component: CustomerTestmonialComponent;
  let fixture: ComponentFixture<CustomerTestmonialComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CustomerTestmonialComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomerTestmonialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
