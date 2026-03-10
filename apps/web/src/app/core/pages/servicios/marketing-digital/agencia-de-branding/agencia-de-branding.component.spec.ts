import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgenciaDeBrandingComponent } from './agencia-de-branding.component';

describe('AgenciaDeBrandingComponent', () => {
  let component: AgenciaDeBrandingComponent;
  let fixture: ComponentFixture<AgenciaDeBrandingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AgenciaDeBrandingComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AgenciaDeBrandingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
