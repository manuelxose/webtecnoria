import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormBottomComponent } from './form-bottom.component';

describe('FormBottomComponent', () => {
  let component: FormBottomComponent;
  let fixture: ComponentFixture<FormBottomComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FormBottomComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormBottomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
