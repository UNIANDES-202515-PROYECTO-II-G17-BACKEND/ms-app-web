import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CargaIndividual } from './carga-individual';

describe('CargaIndividual', () => {
  let component: CargaIndividual;
  let fixture: ComponentFixture<CargaIndividual>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CargaIndividual]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CargaIndividual);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
