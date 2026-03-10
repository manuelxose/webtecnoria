import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReviewTestmonialComponent } from './review-testmonial.component';

describe('ReviewTestmonialComponent', () => {
  let component: ReviewTestmonialComponent;
  let fixture: ComponentFixture<ReviewTestmonialComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReviewTestmonialComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReviewTestmonialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
