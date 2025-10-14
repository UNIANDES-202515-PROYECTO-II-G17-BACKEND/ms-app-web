import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistroProveedores } from './registro-proveedores';

describe('RegistroProveedores', () => {
  let component: RegistroProveedores;
  let fixture: ComponentFixture<RegistroProveedores>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegistroProveedores]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegistroProveedores);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
