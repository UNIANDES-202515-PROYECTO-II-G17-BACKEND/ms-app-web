import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanVenta } from './plan-venta';

describe('PlanVenta', () => {
  let component: PlanVenta;
  let fixture: ComponentFixture<PlanVenta>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlanVenta]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlanVenta);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
