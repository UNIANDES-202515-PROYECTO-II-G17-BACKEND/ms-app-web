import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GenerarRuta } from './generar-ruta';

describe('GenerarRuta', () => {
  let component: GenerarRuta;
  let fixture: ComponentFixture<GenerarRuta>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GenerarRuta]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GenerarRuta);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
