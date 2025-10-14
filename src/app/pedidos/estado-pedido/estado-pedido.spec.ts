import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EstadoPedido } from './estado-pedido';

describe('EstadoPedido', () => {
  let component: EstadoPedido;
  let fixture: ComponentFixture<EstadoPedido>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EstadoPedido]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EstadoPedido);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
