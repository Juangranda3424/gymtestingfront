import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';
import { By } from '@angular/platform-browser';

import { List } from './list';
import { Payments } from '../../services/payments';
import { Payment } from '../../models/payment';

describe('List Component - Payments', () => {
  let component: List;
  let fixture: ComponentFixture<List>;
  let service: jasmine.SpyObj<Payments>;
  let router: Router;

  const mockPayments: Payment[] = [
    {
      id_pago: 1,
      fecha_pago: '2024-01-01',
      monto: 100,
      cliente_nombre: 'Juan',
      cliente_apellido: 'Pérez',
      membresia_tipo: 'Premium',
      membresia_precio: 50
    } as Payment,
  ];

  beforeEach(async () => {
    const serviceSpy = jasmine.createSpyObj('Payments', ['getAll', 'delete']);

    await TestBed.configureTestingModule({
      imports: [List],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: Payments, useValue: serviceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(List);
    component = fixture.componentInstance;
    service = TestBed.inject(Payments) as jasmine.SpyObj<Payments>;
    router = TestBed.inject(Router);

    service.getAll.and.returnValue(of(mockPayments));
    fixture.detectChanges();
  });

  // 1. Componente creado correctamente
  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  // 2. Carga de pagos al iniciar
  it('should load payments on init', () => {
    expect(service.getAll).toHaveBeenCalled();
    expect(component.payments.length).toBe(1);
    expect(component.payments[0].monto).toBe(100);
  });

  // 3. Navegación al formulario de creación
  it('should navigate to create form', () => {
    const navigateSpy = spyOn(router, 'navigate');
    component.navigateToCreate();
    expect(navigateSpy).toHaveBeenCalledWith(['/payments/form']);
  });

  // 4. Navegación al formulario de edición
  it('should navigate to edit form', () => {
    const navigateSpy = spyOn(router, 'navigate');
    component.edit(1);
    expect(navigateSpy).toHaveBeenCalledWith(['/payments/form', 1]);
  });

  // 5. Eliminación confirmada de pago
  it('should delete payment when confirmed', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    service.delete.and.returnValue(of({} as any));

    component.delete(1);
    fixture.detectChanges();

    expect(service.delete).toHaveBeenCalledWith(1);
    expect(component.payments.length).toBe(0);
  });

  // 6. Cancelación de eliminación: no se elimina si el usuario cancela
  it('should not delete payment when cancelled', () => {
    spyOn(window, 'confirm').and.returnValue(false);
    component.delete(1);

    expect(service.delete).not.toHaveBeenCalled();
    expect(component.payments.length).toBe(1);
  });

  // 7. Renderizado correcto de datos en la tabla
  it('should render payment data correctly in table', () => {
    const row = fixture.debugElement.query(By.css('tbody tr'));
    const cells = row.queryAll(By.css('td'));
    expect(cells[1].nativeElement.textContent).toContain('2024-01-01');
    expect(cells[2].nativeElement.textContent).toContain('100');
    expect(cells[3].nativeElement.textContent).toContain('Juan');
    expect(cells[4].nativeElement.textContent).toContain('Premium');
  });

  // 8. Botones de acción (Editar / Eliminar) existen y son visibles
  it('should have Edit and Delete buttons in table', () => {
    const row = fixture.debugElement.query(By.css('tbody tr'));
    const editButton = row.query(By.css('.btn-warning'));
    const deleteButton = row.query(By.css('.btn-danger'));
    expect(editButton).toBeTruthy();
    expect(deleteButton).toBeTruthy();
  });

  // 9. No navegar cuando edit recibe null
  it('should not navigate when edit receives null', () => {
    const navigateSpy = spyOn(router, 'navigate');
    component.edit(null as any);
    expect(navigateSpy).not.toHaveBeenCalled();
  });

  // 10. No navegar cuando edit recibe undefined
  it('should not navigate when edit receives undefined', () => {
    const navigateSpy = spyOn(router, 'navigate');
    component.edit(undefined);
    expect(navigateSpy).not.toHaveBeenCalled();
  });

  // 11. No eliminar cuando delete recibe null
  it('should not delete when delete receives null', () => {
    const confirmSpy = spyOn(window, 'confirm');
    component.delete(null as any);
    expect(confirmSpy).not.toHaveBeenCalled();
    expect(service.delete).not.toHaveBeenCalled();
  });

  // 12. No eliminar cuando delete recibe undefined
  it('should not delete when delete receives undefined', () => {
    const confirmSpy = spyOn(window, 'confirm');
    component.delete(undefined);
    expect(confirmSpy).not.toHaveBeenCalled();
    expect(service.delete).not.toHaveBeenCalled();
  });
});