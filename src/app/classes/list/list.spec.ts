import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';
import { List } from './list';
import { Classes } from '../../services/classes';
import { Class } from '../../models/class';
import { By } from '@angular/platform-browser';

describe('List Component - Classes', () => {
  let component: List;
  let fixture: ComponentFixture<List>;
  let service: jasmine.SpyObj<Classes>;
  let router: Router;

  const mockClasses: Class[] = [
    {
      id_clase: 1,
      nombre_clase: 'Yoga',
      descripcion: 'Relajación',
      horario: '08:00',
      dia_semana: 'Lunes',
      entrenador_nombre: 'Ana',
      entrenador_apellido: 'Pérez',
    } as Class,
  ];

  beforeEach(async () => {
    const serviceSpy = jasmine.createSpyObj('Classes', ['getAll', 'delete']);

    await TestBed.configureTestingModule({
      imports: [List],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: Classes, useValue: serviceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(List);
    component = fixture.componentInstance;
    service = TestBed.inject(Classes) as jasmine.SpyObj<Classes>;
    router = TestBed.inject(Router);

    service.getAll.and.returnValue(of(mockClasses));
    fixture.detectChanges();
  });

  // 1. El componente se crea correctamente
  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  // 2. La lista de clases se carga al inicializar
  it('should load classes on init', () => {
    expect(service.getAll).toHaveBeenCalled();
    expect(component.classes.length).toBe(1);
    expect(component.classes[0].nombre_clase).toBe('Yoga');
  });

  // 3. Navegación al formulario de creación
  it('should navigate to create form', () => {
    const navigateSpy = spyOn(router, 'navigate');
    component.navigateToCreate();
    expect(navigateSpy).toHaveBeenCalledWith(['/classes/form']);
  });

  // 4. Navegación al formulario de edición de una clase existente
  it('should navigate to edit form', () => {
    const navigateSpy = spyOn(router, 'navigate');
    component.edit(1);
    expect(navigateSpy).toHaveBeenCalledWith(['/classes/form', 1]);
  });

  // 5. Confirmación de eliminación: eliminar clase cuando el usuario acepta
  it('should delete class when confirmed', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    service.delete.and.returnValue(of({} as any));

    component.delete(1);
    fixture.detectChanges();

    expect(service.delete).toHaveBeenCalledWith(1);
    expect(component.classes.length).toBe(0);
  });

  // 6. Cancelar eliminación: clase no se elimina si el usuario cancela
  it('should not delete class when cancelled', () => {
    spyOn(window, 'confirm').and.returnValue(false);
    component.delete(1);
    expect(service.delete).not.toHaveBeenCalled();
    expect(component.classes.length).toBe(1);
  });

  // 7. La tabla muestra correctamente los datos de la clase
  it('should render class data correctly in table', () => {
    const rows = fixture.debugElement.queryAll(By.css('tbody tr'));
    expect(rows.length).toBe(1);
    const cells = rows[0].queryAll(By.css('td'));
    expect(cells[1].nativeElement.textContent).toContain('Yoga');
    expect(cells[2].nativeElement.textContent).toContain('Relajación');
    expect(cells[5].nativeElement.textContent).toContain('Ana Pérez');
  });

  // 8. Los botones de acción (Editar / Eliminar) existen y son visibles
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

  // 13. Debe retornar las clases paginadas correctamente
  it('should return paginated classes correctly', () => {
    component.classes = Array.from({ length: 12 }, (_, i) => ({
      id_clase: i + 1,
      nombre_clase: `Clase ${i + 1}`
    } as Class));
    component.currentPage = 1;
    component.pageSize = 5;

    const paginated = component.paginatedClasses;
    expect(paginated.length).toBe(5);
    expect(paginated[0].id_clase).toBe(1);
    expect(paginated[4].id_clase).toBe(5);
  });

  // 14. Debe calcular el total de páginas correctamente
  it('should calculate total pages correctly', () => {
    component.classes = Array.from({ length: 12 }, (_, i) => ({ id_clase: i + 1 } as Class));
    component.pageSize = 5;

    expect(component.totalPages).toBe(3);
  });

  // 15. Debe generar el array de números de página correctamente
  it('should generate pages array correctly', () => {
    component.classes = Array.from({ length: 12 }, (_, i) => ({ id_clase: i + 1 } as Class));
    component.pageSize = 5;

    const pages = component.pages;
    expect(pages.length).toBe(3);
    expect(pages).toEqual([1, 2, 3]);
  });

  // 16. Debe navegar a una página específica
  it('should navigate to specific page', () => {
    component.classes = Array.from({ length: 12 }, (_, i) => ({ id_clase: i + 1 } as Class));
    component.pageSize = 5;
    component.currentPage = 1;

    component.goToPage(2);
    expect(component.currentPage).toBe(2);
  });

  // 17. No debe navegar a una página inválida (menor a 1)
  it('should not navigate to invalid page less than 1', () => {
    component.classes = Array.from({ length: 12 }, (_, i) => ({ id_clase: i + 1 } as Class));
    component.currentPage = 1;

    component.goToPage(0);
    expect(component.currentPage).toBe(1);
  });

  // 18. No debe navegar a una página inválida (mayor al total)
  it('should not navigate to invalid page greater than total', () => {
    component.classes = Array.from({ length: 12 }, (_, i) => ({ id_clase: i + 1 } as Class));
    component.pageSize = 5;
    component.currentPage = 1;

    component.goToPage(10);
    expect(component.currentPage).toBe(1);
  });

  // 19. Debe navegar a la página anterior
  it('should navigate to previous page', () => {
    component.classes = Array.from({ length: 12 }, (_, i) => ({ id_clase: i + 1 } as Class));
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
    component.classes = Array.from({ length: 12 }, (_, i) => ({ id_clase: i + 1 } as Class));
    component.pageSize = 5;
    component.currentPage = 1;

    component.nextPage();
    expect(component.currentPage).toBe(2);
  });

  // 22. No debe navegar a página siguiente si está en la última página
  it('should not navigate to next page when on last page', () => {
    component.classes = Array.from({ length: 12 }, (_, i) => ({ id_clase: i + 1 } as Class));
    component.pageSize = 5;
    component.currentPage = 3;

    component.nextPage();
    expect(component.currentPage).toBe(3);
  });

  // 23. Debe mostrar los controles de paginación cuando hay más de una página
  it('should show pagination controls when there are multiple pages', () => {
    component.classes = Array.from({ length: 12 }, (_, i) => ({
      id_clase: i + 1,
      nombre_clase: `Clase ${i + 1}`,
      descripcion: 'Desc',
      horario: '08:00',
      dia_semana: 'Lunes',
      entrenador_nombre: 'Ana',
      entrenador_apellido: 'Pérez'
    } as Class));
    component.pageSize = 5;
    fixture.detectChanges();

    const pagination = fixture.debugElement.query(By.css('.pagination'));
    expect(pagination).toBeTruthy();
  });

  // 24. No debe mostrar los controles de paginación cuando hay solo una página
  it('should not show pagination controls when there is only one page', () => {
    component.classes = [mockClasses[0]];
    fixture.detectChanges();

    const pagination = fixture.debugElement.query(By.css('.pagination'));
    expect(pagination).toBeFalsy();
  });

  // 25. Debe marcar el botón de página anterior como deshabilitado en la primera página
  it('should disable previous button on first page', () => {
    component.classes = Array.from({ length: 12 }, (_, i) => ({
      id_clase: i + 1,
      nombre_clase: `Clase ${i + 1}`,
      descripcion: 'Desc',
      horario: '08:00',
      dia_semana: 'Lunes',
      entrenador_nombre: 'Ana',
      entrenador_apellido: 'Pérez'
    } as Class));
    component.currentPage = 1;
    fixture.detectChanges();

    const prevButton = fixture.debugElement.query(By.css('.page-item:first-child'));
    expect(prevButton.nativeElement.classList.contains('disabled')).toBeTrue();
  });

  // 26. Debe marcar el botón de página siguiente como deshabilitado en la última página
  it('should disable next button on last page', () => {
    component.classes = Array.from({ length: 12 }, (_, i) => ({
      id_clase: i + 1,
      nombre_clase: `Clase ${i + 1}`,
      descripcion: 'Desc',
      horario: '08:00',
      dia_semana: 'Lunes',
      entrenador_nombre: 'Ana',
      entrenador_apellido: 'Pérez'
    } as Class));
    component.pageSize = 5;
    component.currentPage = 3;
    fixture.detectChanges();

    const nextButton = fixture.debugElement.query(By.css('.page-item:last-child'));
    expect(nextButton.nativeElement.classList.contains('disabled')).toBeTrue();
  });

  // 27. Debe marcar la página actual como activa
  it('should mark current page as active', () => {
    component.classes = Array.from({ length: 12 }, (_, i) => ({
      id_clase: i + 1,
      nombre_clase: `Clase ${i + 1}`,
      descripcion: 'Desc',
      horario: '08:00',
      dia_semana: 'Lunes',
      entrenador_nombre: 'Ana',
      entrenador_apellido: 'Pérez'
    } as Class));
    component.currentPage = 2;
    fixture.detectChanges();

    const pageItems = fixture.debugElement.queryAll(By.css('.page-item'));
    const activePage = pageItems.find(item => item.nativeElement.classList.contains('active'));
    expect(activePage?.nativeElement.textContent).toContain('2');
  });

  // 28. Debe mostrar todas las páginas cuando el total es menor o igual a 5
  it('should show all pages when total pages is 5 or less', () => {
    component.classes = Array.from({ length: 12 }, (_, i) => ({ id_clase: i + 1 } as Class));
    component.pageSize = 5;
    component.currentPage = 1;

    const visiblePages = component.visiblePages;
    expect(visiblePages.length).toBe(3);
    expect(visiblePages).toEqual([1, 2, 3]);
  });

  // 29. Debe mostrar máximo 5 páginas cuando hay más de 5 páginas totales
  it('should show maximum 5 pages when there are more than 5 total pages', () => {
    component.classes = Array.from({ length: 50 }, (_, i) => ({ id_clase: i + 1 } as Class));
    component.pageSize = 5;
    component.currentPage = 5;

    const visiblePages = component.visiblePages;
    expect(visiblePages.length).toBe(5);
  });

  // 30. Debe mostrar páginas correctas al inicio (página 1)
  it('should show correct pages at the beginning', () => {
    component.classes = Array.from({ length: 50 }, (_, i) => ({ id_clase: i + 1 } as Class));
    component.pageSize = 5;
    component.currentPage = 1;

    const visiblePages = component.visiblePages;
    expect(visiblePages).toEqual([1, 2, 3, 4, 5]);
  });

  // 31. Debe mostrar páginas correctas en el medio
  it('should show correct pages in the middle', () => {
    component.classes = Array.from({ length: 50 }, (_, i) => ({ id_clase: i + 1 } as Class));
    component.pageSize = 5;
    component.currentPage = 5;

    const visiblePages = component.visiblePages;
    expect(visiblePages).toEqual([3, 4, 5, 6, 7]);
  });

  // 32. Debe mostrar páginas correctas al final
  it('should show correct pages at the end', () => {
    component.classes = Array.from({ length: 50 }, (_, i) => ({ id_clase: i + 1 } as Class));
    component.pageSize = 5;
    component.currentPage = 10;

    const visiblePages = component.visiblePages;
    expect(visiblePages).toEqual([6, 7, 8, 9, 10]);
  });

  // 33. Debe alinear la paginación a la derecha
  it('should align pagination to the right', () => {
    component.classes = Array.from({ length: 12 }, (_, i) => ({
      id_clase: i + 1,
      nombre_clase: `Clase ${i + 1}`,
      descripcion: 'Desc',
      horario: '08:00',
      dia_semana: 'Lunes',
      entrenador_nombre: 'Ana',
      entrenador_apellido: 'Pérez'
    } as Class));
    fixture.detectChanges();

    const pagination = fixture.debugElement.query(By.css('.pagination'));
    expect(pagination.nativeElement.classList.contains('justify-content-end')).toBeTrue();
  });

  // 34. Debe mostrar solo las páginas visibles en el DOM
  it('should render only visible page numbers in DOM', () => {
    component.classes = Array.from({ length: 50 }, (_, i) => ({
      id_clase: i + 1,
      nombre_clase: `Clase ${i + 1}`,
      descripcion: 'Desc',
      horario: '08:00',
      dia_semana: 'Lunes',
      entrenador_nombre: 'Ana',
      entrenador_apellido: 'Pérez'
    } as Class));
    component.pageSize = 5;
    component.currentPage = 5;
    fixture.detectChanges();

    const pageItems = fixture.debugElement.queryAll(By.css('.page-item'));
    // 5 visible pages + 2 navigation buttons (prev/next)
    expect(pageItems.length).toBe(7);
  });
});