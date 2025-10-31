import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListaBlogsComponent } from './lista-blogs.component';

describe('ListaBlogsComponent', () => {
  let component: ListaBlogsComponent;
  let fixture: ComponentFixture<ListaBlogsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListaBlogsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListaBlogsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
