import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OficinaVirtualComponent } from './oficina-virtual.component';

describe('OficinaVirtualComponent', () => {
  let component: OficinaVirtualComponent;
  let fixture: ComponentFixture<OficinaVirtualComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OficinaVirtualComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OficinaVirtualComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
