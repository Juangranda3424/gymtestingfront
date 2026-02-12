import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';
import { By } from '@angular/platform-browser';

import { List } from './list';
import { Memberships } from '../../services/memberships';
import { Membership } from '../../models/membership';

describe('List Component - Memberships', () => {
  let component: List;
  let fixture: ComponentFixture<List>;
  let service: jasmine.SpyObj<Memberships>;
  let router: Router;

  const mockMemberships: Membership[] = [
    {
      id_membresia: 1,
      tipo: 'Premium',
      precio: 50,
      duracion_meses: 6
    } as Membership,
  ];

  beforeEach(async () => {
    const serviceSpy = jasmine.createSpyObj('Memberships', ['getAll', 'delete']);

    await TestBed.configureTestingModule({
      imports: [List],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: Memberships, useValue: serviceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(List);
    component = fixture.componentInstance;
    service = TestBed.inject(Memberships) as jasmine.SpyObj<Memberships>;
    router = TestBed.inject(Router);

    service.getAll.and.returnValue(of(mockMemberships));
    fixture.detectChanges();
  });

  // 1. Componente creado correctamente
  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  // 2. Carga de membresías al iniciar
  it('should load memberships on init', () => {
    expect(service.getAll).toHaveBeenCalled();
    expect(component.memberships.length).toBe(1);
    expect(component.memberships[0].tipo).toBe('Premium');
  });

  // 3. Navegación al formulario de creación
  it('should navigate to create form', () => {
    const navigateSpy = spyOn(router, 'navigate');
    component.navigateToCreate();
    expect(navigateSpy).toHaveBeenCalledWith(['/memberships/form']);
  });

  // 4. Navegación al formulario de edición de una membresía existente
  it('should navigate to edit form', () => {
    const navigateSpy = spyOn(router, 'navigate');
    component.edit(1);
    expect(navigateSpy).toHaveBeenCalledWith(['/memberships/form', 1]);
  });

  // 5. Eliminación confirmada de membresía
  it('should delete membership when confirmed', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    service.delete.and.returnValue(of({} as any));

    component.delete(1);
    fixture.detectChanges();

    expect(service.delete).toHaveBeenCalledWith(1);
    expect(component.memberships.length).toBe(0);
  });

  // 6. Cancelar eliminación: no se elimina si el usuario cancela
  it('should not delete membership when cancelled', () => {
    spyOn(window, 'confirm').and.returnValue(false);
    component.delete(1);

    expect(service.delete).not.toHaveBeenCalled();
    expect(component.memberships.length).toBe(1);
  });

  // 7. Renderizado correcto de datos en la tabla
  it('should render membership data correctly in table', () => {
    const row = fixture.debugElement.query(By.css('tbody tr'));
    const cells = row.queryAll(By.css('td'));
    expect(cells[1].nativeElement.textContent).toContain('Premium');
    expect(cells[2].nativeElement.textContent).toContain('50');
    expect(cells[3].nativeElement.textContent).toContain('6');
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

  // 13. Debe retornar las membresías paginadas correctamente
  it('should return paginated memberships correctly', () => {
    component.memberships = Array.from({ length: 12 }, (_, i) => ({
      id_membresia: i + 1,
      tipo: `Tipo ${i + 1}`,
      precio: 50 + i,
      duracion_meses: 6
    } as Membership));
    component.currentPage = 1;
    component.pageSize = 5;

    const paginated = component.paginatedMemberships;
    expect(paginated.length).toBe(5);
    expect(paginated[0].id_membresia).toBe(1);
    expect(paginated[4].id_membresia).toBe(5);
  });

  // 14. Debe calcular el total de páginas correctamente
  it('should calculate total pages correctly', () => {
    component.memberships = Array.from({ length: 12 }, (_, i) => ({ id_membresia: i + 1 } as Membership));
    component.pageSize = 5;

    expect(component.totalPages).toBe(3);
  });

  // 15. Debe generar el array de números de página correctamente
  it('should generate pages array correctly', () => {
    component.memberships = Array.from({ length: 12 }, (_, i) => ({ id_membresia: i + 1 } as Membership));
    component.pageSize = 5;

    const pages = component.pages;
    expect(pages.length).toBe(3);
    expect(pages).toEqual([1, 2, 3]);
  });

  // 16. Debe navegar a una página específica
  it('should navigate to specific page', () => {
    component.memberships = Array.from({ length: 12 }, (_, i) => ({ id_membresia: i + 1 } as Membership));
    component.pageSize = 5;
    component.currentPage = 1;

    component.goToPage(2);
    expect(component.currentPage).toBe(2);
  });

  // 17. No debe navegar a una página inválida (menor a 1)
  it('should not navigate to invalid page less than 1', () => {
    component.memberships = Array.from({ length: 12 }, (_, i) => ({ id_membresia: i + 1 } as Membership));
    component.currentPage = 1;

    component.goToPage(0);
    expect(component.currentPage).toBe(1);
  });

  // 18. No debe navegar a una página inválida (mayor al total)
  it('should not navigate to invalid page greater than total', () => {
    component.memberships = Array.from({ length: 12 }, (_, i) => ({ id_membresia: i + 1 } as Membership));
    component.pageSize = 5;
    component.currentPage = 1;

    component.goToPage(10);
    expect(component.currentPage).toBe(1);
  });

  // 19. Debe navegar a la página anterior
  it('should navigate to previous page', () => {
    component.memberships = Array.from({ length: 12 }, (_, i) => ({ id_membresia: i + 1 } as Membership));
    component.currentPage = 2;

    component.previousPage();
    expect(component.currentPage).toBe(1);
  });

  // 20. No debe navegar a página anterior si está en la primera página
  it('should not navigate to previous page when on first page', () => {
    component.currentPage = 1;

    component.previousPage();
    expect(component.currentPage).toBe(1);
  });

  // 21. Debe navegar a la página siguiente
  it('should navigate to next page', () => {
    component.memberships = Array.from({ length: 12 }, (_, i) => ({ id_membresia: i + 1 } as Membership));
    component.pageSize = 5;
    component.currentPage = 1;

    component.nextPage();
    expect(component.currentPage).toBe(2);
  });

  // 22. No debe navegar a página siguiente si está en la última página
  it('should not navigate to next page when on last page', () => {
    component.memberships = Array.from({ length: 12 }, (_, i) => ({ id_membresia: i + 1 } as Membership));
    component.pageSize = 5;
    component.currentPage = 3;

    component.nextPage();
    expect(component.currentPage).toBe(3);
  });

  // 23. Debe mostrar los controles de paginación cuando hay más de una página
  it('should show pagination controls when there are multiple pages', () => {
    component.memberships = Array.from({ length: 12 }, (_, i) => ({
      id_membresia: i + 1,
      tipo: `Tipo ${i + 1}`,
      precio: 50 + i,
      duracion_meses: 6
    } as Membership));
    component.pageSize = 5;
    fixture.detectChanges();

    const pagination = fixture.debugElement.query(By.css('.pagination'));
    expect(pagination).toBeTruthy();
  });

  // 24. No debe mostrar los controles de paginación cuando hay solo una página
  it('should not show pagination controls when there is only one page', () => {
    component.memberships = [mockMemberships[0]];
    fixture.detectChanges();

    const pagination = fixture.debugElement.query(By.css('.pagination'));
    expect(pagination).toBeFalsy();
  });

  // 25. Debe marcar el botón de página anterior como deshabilitado en la primera página
  it('should disable previous button on first page', () => {
    component.memberships = Array.from({ length: 12 }, (_, i) => ({
      id_membresia: i + 1,
      tipo: `Tipo ${i + 1}`,
      precio: 50 + i,
      duracion_meses: 6
    } as Membership));
    component.currentPage = 1;
    fixture.detectChanges();

    const prevButton = fixture.debugElement.query(By.css('.page-item:first-child'));
    expect(prevButton.nativeElement.classList.contains('disabled')).toBeTrue();
  });

  // 26. Debe marcar el botón de página siguiente como deshabilitado en la última página
  it('should disable next button on last page', () => {
    component.memberships = Array.from({ length: 12 }, (_, i) => ({
      id_membresia: i + 1,
      tipo: `Tipo ${i + 1}`,
      precio: 50 + i,
      duracion_meses: 6
    } as Membership));
    component.pageSize = 5;
    component.currentPage = 3;
    fixture.detectChanges();

    const nextButton = fixture.debugElement.query(By.css('.page-item:last-child'));
    expect(nextButton.nativeElement.classList.contains('disabled')).toBeTrue();
  });

  // 27. Debe marcar la página actual como activa
  it('should mark current page as active', () => {
    component.memberships = Array.from({ length: 12 }, (_, i) => ({
      id_membresia: i + 1,
      tipo: `Tipo ${i + 1}`,
      precio: 50 + i,
      duracion_meses: 6
    } as Membership));
    component.currentPage = 2;
    fixture.detectChanges();

    const pageItems = fixture.debugElement.queryAll(By.css('.page-item'));
    const activePage = pageItems.find(item => item.nativeElement.classList.contains('active'));
    expect(activePage?.nativeElement.textContent).toContain('2');
  });

  // 28. Debe mostrar todas las páginas cuando el total es menor o igual a 5
  it('should show all pages when total pages is 5 or less', () => {
    component.memberships = Array.from({ length: 12 }, (_, i) => ({ id_membresia: i + 1 } as Membership));
    component.pageSize = 5;
    component.currentPage = 1;

    const visiblePages = component.visiblePages;
    expect(visiblePages.length).toBe(3);
    expect(visiblePages).toEqual([1, 2, 3]);
  });

  // 29. Debe mostrar máximo 5 páginas cuando hay más de 5 páginas totales
  it('should show maximum 5 pages when there are more than 5 total pages', () => {
    component.memberships = Array.from({ length: 50 }, (_, i) => ({ id_membresia: i + 1 } as Membership));
    component.pageSize = 5;
    component.currentPage = 5;

    const visiblePages = component.visiblePages;
    expect(visiblePages.length).toBe(5);
  });

  // 30. Debe mostrar páginas correctas al inicio (página 1)
  it('should show correct pages at the beginning', () => {
    component.memberships = Array.from({ length: 50 }, (_, i) => ({ id_membresia: i + 1 } as Membership));
    component.pageSize = 5;
    component.currentPage = 1;

    const visiblePages = component.visiblePages;
    expect(visiblePages).toEqual([1, 2, 3, 4, 5]);
  });

  // 31. Debe mostrar páginas correctas en el medio
  it('should show correct pages in the middle', () => {
    component.memberships = Array.from({ length: 50 }, (_, i) => ({ id_membresia: i + 1 } as Membership));
    component.pageSize = 5;
    component.currentPage = 5;

    const visiblePages = component.visiblePages;
    expect(visiblePages).toEqual([3, 4, 5, 6, 7]);
  });

  // 32. Debe mostrar páginas correctas al final
  it('should show correct pages at the end', () => {
    component.memberships = Array.from({ length: 50 }, (_, i) => ({ id_membresia: i + 1 } as Membership));
    component.pageSize = 5;
    component.currentPage = 10;

    const visiblePages = component.visiblePages;
    expect(visiblePages).toEqual([6, 7, 8, 9, 10]);
  });

  // 33. Debe alinear la paginación a la derecha
  it('should align pagination to the right', () => {
    component.memberships = Array.from({ length: 12 }, (_, i) => ({
      id_membresia: i + 1,
      tipo: `Tipo ${i + 1}`,
      precio: 50 + i,
      duracion_meses: 6
    } as Membership));
    fixture.detectChanges();

    const pagination = fixture.debugElement.query(By.css('.pagination'));
    expect(pagination.nativeElement.classList.contains('justify-content-end')).toBeTrue();
  });

  // 34. Debe mostrar solo las páginas visibles en el DOM
  it('should render only visible page numbers in DOM', () => {
    component.memberships = Array.from({ length: 50 }, (_, i) => ({
      id_membresia: i + 1,
      tipo: `Tipo ${i + 1}`,
      precio: 50 + i,
      duracion_meses: 6
    } as Membership));
    component.pageSize = 5;
    component.currentPage = 5;
    fixture.detectChanges();

    const pageItems = fixture.debugElement.queryAll(By.css('.page-item'));
    // 5 visible pages + 2 navigation buttons (prev/next)
    expect(pageItems.length).toBe(7);
  });
});