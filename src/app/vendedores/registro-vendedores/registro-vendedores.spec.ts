import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistroVendedores } from './registro-vendedores';

describe('RegistroVendedores', () => {
  let component: RegistroVendedores;
  let fixture: ComponentFixture<RegistroVendedores>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegistroVendedores]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegistroVendedores);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
