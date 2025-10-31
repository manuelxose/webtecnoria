import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DisenioWordpressComponent } from './disenio-wordpress.component';

describe('DisenioWordpressComponent', () => {
  let component: DisenioWordpressComponent;
  let fixture: ComponentFixture<DisenioWordpressComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DisenioWordpressComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DisenioWordpressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
