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

  // --- PAGINATION TESTS ---

  // 13. Paginación: debe devolver el número correcto de páginas totales
  it('should calculate total pages correctly', () => {
    component.payments = Array(12).fill(null).map((_, i) => ({ id_pago: i + 1 } as Payment));
    expect(component.totalPages).toBe(3);
  });

  // 14. Paginación: debe devolver solo los elementos de la página actual
  it('should return paginated payments for current page', () => {
    component.payments = Array(12).fill(null).map((_, i) => ({ id_pago: i + 1 } as Payment));
    component.currentPage = 1;
    expect(component.paginatedPayments.length).toBe(5);
    expect(component.paginatedPayments[0].id_pago).toBe(1);
  });

  // 15. Paginación: debe devolver elementos de la página 2
  it('should return payments for page 2', () => {
    component.payments = Array(12).fill(null).map((_, i) => ({ id_pago: i + 1 } as Payment));
    component.currentPage = 2;
    expect(component.paginatedPayments.length).toBe(5);
    expect(component.paginatedPayments[0].id_pago).toBe(6);
  });

  // 16. Paginación: debe devolver elementos de la última página
  it('should return payments for last page', () => {
    component.payments = Array(12).fill(null).map((_, i) => ({ id_pago: i + 1 } as Payment));
    component.currentPage = 3;
    expect(component.paginatedPayments.length).toBe(2);
    expect(component.paginatedPayments[0].id_pago).toBe(11);
  });

  // 17. Paginación: debe generar array con todos los números de página
  it('should generate pages array', () => {
    component.payments = Array(12).fill(null).map((_, i) => ({ id_pago: i + 1 } as Payment));
    expect(component.pages).toEqual([1, 2, 3]);
  });

  // 18. Paginación: debe mostrar todas las páginas si hay 5 o menos
  it('should show all pages when total pages <= 5', () => {
    component.payments = Array(12).fill(null).map((_, i) => ({ id_pago: i + 1 } as Payment));
    expect(component.visiblePages).toEqual([1, 2, 3]);
  });

  // 19. Paginación: debe mostrar las primeras 5 páginas si está al inicio
  it('should show first 5 pages when near start', () => {
    component.payments = Array(30).fill(null).map((_, i) => ({ id_pago: i + 1 } as Payment));
    component.currentPage = 2;
    expect(component.visiblePages).toEqual([1, 2, 3, 4, 5]);
  });

  // 20. Paginación: debe mostrar las últimas 5 páginas si está al final
  it('should show last 5 pages when near end', () => {
    component.payments = Array(30).fill(null).map((_, i) => ({ id_pago: i + 1 } as Payment));
    component.currentPage = 5;
    expect(component.visiblePages).toEqual([2, 3, 4, 5, 6]);
  });

  // 21. Paginación: debe navegar a una página específica válida
  it('should navigate to specific valid page', () => {
    component.payments = Array(12).fill(null).map((_, i) => ({ id_pago: i + 1 } as Payment));
    component.goToPage(2);
    expect(component.currentPage).toBe(2);
  });

  // 22. Paginación: no debe navegar a página inválida (menor que 1)
  it('should not navigate to invalid page < 1', () => {
    component.payments = Array(12).fill(null).map((_, i) => ({ id_pago: i + 1 } as Payment));
    component.currentPage = 2;
    component.goToPage(0);
    expect(component.currentPage).toBe(2);
  });

  // 23. Paginación: no debe navegar a página inválida (mayor que totalPages)
  it('should not navigate to invalid page > totalPages', () => {
    component.payments = Array(12).fill(null).map((_, i) => ({ id_pago: i + 1 } as Payment));
    component.currentPage = 2;
    component.goToPage(10);
    expect(component.currentPage).toBe(2);
  });

  // 24. Paginación: debe retroceder a la página anterior
  it('should go to previous page', () => {
    component.payments = Array(12).fill(null).map((_, i) => ({ id_pago: i + 1 } as Payment));
    component.currentPage = 2;
    component.previousPage();
    expect(component.currentPage).toBe(1);
  });

  // 25. Paginación: no debe retroceder si ya está en la primera página
  it('should not go before first page', () => {
    component.payments = Array(12).fill(null).map((_, i) => ({ id_pago: i + 1 } as Payment));
    component.currentPage = 1;
    component.previousPage();
    expect(component.currentPage).toBe(1);
  });

  // 26. Paginación: debe avanzar a la página siguiente
  it('should go to next page', () => {
    component.payments = Array(12).fill(null).map((_, i) => ({ id_pago: i + 1 } as Payment));
    component.currentPage = 1;
    component.nextPage();
    expect(component.currentPage).toBe(2);
  });

  // 27. Paginación: no debe avanzar si ya está en la última página
  it('should not go beyond last page', () => {
    component.payments = Array(12).fill(null).map((_, i) => ({ id_pago: i + 1 } as Payment));
    component.currentPage = 3;
    component.nextPage();
    expect(component.currentPage).toBe(3);
  });

  // 28. Paginación: totalPages debe ser 0 si no hay pagos
  it('should have 0 total pages when no payments', () => {
    component.payments = [];
    expect(component.totalPages).toBe(0);
  });

  // 29. Paginación: paginatedPayments debe estar vacío si no hay pagos
  it('should return empty array when no payments', () => {
    component.payments = [];
    expect(component.paginatedPayments).toEqual([]);
  });

  // 30. Paginación: debe manejar exactamente pageSize elementos
  it('should handle exactly pageSize payments', () => {
    component.payments = Array(5).fill(null).map((_, i) => ({ id_pago: i + 1 } as Payment));
    expect(component.totalPages).toBe(1);
    expect(component.paginatedPayments.length).toBe(5);
  });

  // 31. Paginación: debe navegar a la página 1 correctamente
  it('should navigate to page 1', () => {
    component.payments = Array(12).fill(null).map((_, i) => ({ id_pago: i + 1 } as Payment));
    component.currentPage = 3;
    component.goToPage(1);
    expect(component.currentPage).toBe(1);
  });

  // 32. Paginación: debe navegar a la última página correctamente
  it('should navigate to last page', () => {
    component.payments = Array(12).fill(null).map((_, i) => ({ id_pago: i + 1 } as Payment));
    component.currentPage = 1;
    component.goToPage(3);
    expect(component.currentPage).toBe(3);
  });

  // 33. Paginación: visiblePages debe manejar correctamente 6 páginas totales
  it('should handle visible pages with 6 total pages', () => {
    component.payments = Array(30).fill(null).map((_, i) => ({ id_pago: i + 1 } as Payment));
    component.currentPage = 6;
    expect(component.visiblePages).toEqual([2, 3, 4, 5, 6]);
    expect(component.visiblePages.length).toBe(5);
  });
});