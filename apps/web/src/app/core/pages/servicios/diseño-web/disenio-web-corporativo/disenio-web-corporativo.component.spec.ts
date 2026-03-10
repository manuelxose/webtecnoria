import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DisenioWebCorporativoComponent } from './disenio-web-corporativo.component';

describe('DisenioWebCorporativoComponent', () => {
  let component: DisenioWebCorporativoComponent;
  let fixture: ComponentFixture<DisenioWebCorporativoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DisenioWebCorporativoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DisenioWebCorporativoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
