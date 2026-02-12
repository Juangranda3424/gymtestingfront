import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';
import { By } from '@angular/platform-browser';

import { List } from './list';
import { Inscriptions } from '../../services/inscriptions';
import { Inscription } from '../../models/inscription';

describe('List Component - Inscriptions', () => {
  let component: List;
  let fixture: ComponentFixture<List>;
  let service: jasmine.SpyObj<Inscriptions>;
  let router: Router;

  const mockInscriptions: Inscription[] = [
    {
      id_inscripcion: 1,
      fecha_inscripcion: '2025-01-01',
      cliente_nombre: 'Juan',
      cliente_apellido: 'Perez',
      nombre_clase: 'Yoga'
    } as Inscription,
  ];

  beforeEach(async () => {
    const serviceSpy = jasmine.createSpyObj('Inscriptions', ['getAll', 'delete']);

    await TestBed.configureTestingModule({
      imports: [List],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: Inscriptions, useValue: serviceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(List);
    component = fixture.componentInstance;
    service = TestBed.inject(Inscriptions) as jasmine.SpyObj<Inscriptions>;
    router = TestBed.inject(Router);

    service.getAll.and.returnValue(of(mockInscriptions));
    fixture.detectChanges();
  });

  // 1. El componente se crea correctamente
  it('should create the component', () => {
    // Assert - Verificar que el componente se instanció
    expect(component).toBeTruthy();
  });

  // 2. La lista de inscripciones se carga al inicializar
  it('should load inscriptions on init', () => {
    // Assert - Verificar que se cargaron los datos del servicio
    expect(service.getAll).toHaveBeenCalled();
    expect(component.inscriptions.length).toBe(1);
    expect(component.inscriptions[0].nombre_clase).toBe('Yoga');
  });

  // 3. Navegación al formulario de creación
  it('should navigate to create form', () => {
    // Arrange - Configurar spy de navegación
    const navigateSpy = spyOn(router, 'navigate');
    
    // Act - Ejecutar navegación a crear
    component.navigateToCreate();
    
    // Assert - Verificar la ruta correcta
    expect(navigateSpy).toHaveBeenCalledWith(['/inscriptions/form']);
  });

  // 4. Navegación al formulario de edición
  it('should navigate to edit form', () => {
    // Arrange - Configurar spy de navegación
    const navigateSpy = spyOn(router, 'navigate');
    
    // Act - Ejecutar edición con ID válido
    component.edit(1);
    
    // Assert - Verificar la ruta con ID
    expect(navigateSpy).toHaveBeenCalledWith(['/inscriptions/form', 1]);
  });

  // 5. Eliminación de inscripción confirmada
  it('should delete inscription when confirmed', () => {
    // Arrange - Configurar confirmación y respuesta del servicio
    spyOn(window, 'confirm').and.returnValue(true);
    service.delete.and.returnValue(of({} as any));

    // Act - Ejecutar eliminación
    component.delete(1);
    fixture.detectChanges();

    // Assert - Verificar que se eliminó
    expect(service.delete).toHaveBeenCalledWith(1);
    expect(component.inscriptions.length).toBe(0);
  });

  // 6. Cancelar eliminación
  it('should not delete inscription when cancelled', () => {
    // Arrange - Configurar cancelación
    spyOn(window, 'confirm').and.returnValue(false);
    
    // Act - Intentar eliminar
    component.delete(1);

    // Assert - Verificar que no se eliminó
    expect(service.delete).not.toHaveBeenCalled();
    expect(component.inscriptions.length).toBe(1);
  });

  // 7. Renderizado correcto de datos en la tabla
  it('should render inscription data correctly in table', () => {
    // Arrange - Obtener elementos del DOM
    const row = fixture.debugElement.query(By.css('tbody tr'));
    const cells = row.queryAll(By.css('td'));
    
    // Assert - Verificar contenido renderizado
    expect(cells[1].nativeElement.textContent).toContain('2025-01-01');
    expect(cells[2].nativeElement.textContent).toContain('Juan');
    expect(cells[3].nativeElement.textContent).toContain('Yoga');
  });

  // 8. Botones de acción existen en la tabla
  it('should have Edit and Delete buttons in table', () => {
    // Arrange - Obtener fila de la tabla
    const row = fixture.debugElement.query(By.css('tbody tr'));
    
    // Act - Buscar botones de acción
    const editButton = row.query(By.css('.btn-warning'));
    const deleteButton = row.query(By.css('.btn-danger'));
    
    // Assert - Verificar que existen
    expect(editButton).toBeTruthy();
    expect(deleteButton).toBeTruthy();
  });

  // 9. No navegar cuando edit recibe valores inválidos
  it('should not navigate when edit receives invalid values', () => {
    // Arrange - Configurar spy de navegación
    const navigateSpy = spyOn(router, 'navigate');
    
    // Act - Intentar editar con null y undefined
    component.edit(null as any);
    component.edit(undefined);
    
    // Assert - Verificar que no navegó
    expect(navigateSpy).not.toHaveBeenCalled();
  });

  // 10. No eliminar cuando delete recibe valores inválidos
  it('should not delete when delete receives invalid values', () => {
    // Arrange - Configurar spy de confirmación
    const confirmSpy = spyOn(window, 'confirm');
    
    // Act - Intentar eliminar con null y undefined
    component.delete(null as any);
    component.delete(undefined);
    
    // Assert - Verificar que no se llamó confirm ni delete
    expect(confirmSpy).not.toHaveBeenCalled();
    expect(service.delete).not.toHaveBeenCalled();
  });

  // 11. Paginación: debe calcular el número correcto de páginas totales
  it('should calculate total pages correctly', () => {
    // Arrange - Crear 12 inscripciones (más de una página)
    component.inscriptions = Array(12).fill(null).map((_, i) => ({ id_inscripcion: i + 1 } as Inscription));
    
    // Assert - Verificar cálculo de páginas (12 / 5 = 3 páginas)
    expect(component.totalPages).toBe(3);
  });

  // 12. Paginación: debe devolver solo los elementos de la página actual
  it('should return paginated inscriptions for current page', () => {
    // Arrange - Crear 12 inscripciones y establecer página actual
    component.inscriptions = Array(12).fill(null).map((_, i) => ({ id_inscripcion: i + 1 } as Inscription));
    component.currentPage = 1;
    
    // Assert - Verificar que devuelve 5 elementos de la primera página
    expect(component.paginatedInscriptions.length).toBe(5);
    expect(component.paginatedInscriptions[0].id_inscripcion).toBe(1);
  });

  // 13. Paginación: debe devolver elementos de la última página
  it('should return inscriptions for last page', () => {
    // Arrange - Crear 12 inscripciones y establecer última página
    component.inscriptions = Array(12).fill(null).map((_, i) => ({ id_inscripcion: i + 1 } as Inscription));
    component.currentPage = 3;
    
    // Assert - Verificar que devuelve 2 elementos restantes
    expect(component.paginatedInscriptions.length).toBe(2);
    expect(component.paginatedInscriptions[0].id_inscripcion).toBe(11);
  });

  // 14. Paginación: debe generar array con números de página
  it('should generate pages array', () => {
    // Arrange - Crear 12 inscripciones
    component.inscriptions = Array(12).fill(null).map((_, i) => ({ id_inscripcion: i + 1 } as Inscription));
    
    // Assert - Verificar array de páginas [1,2,3]
    expect(component.pages).toEqual([1, 2, 3]);
  });

  // 15. Paginación: debe mostrar todas las páginas si hay 5 o menos
  it('should show all pages when total pages <= 5', () => {
    // Arrange - Crear 12 inscripciones (3 páginas)
    component.inscriptions = Array(12).fill(null).map((_, i) => ({ id_inscripcion: i + 1 } as Inscription));
    
    // Assert - Verificar que muestra las 3 páginas
    expect(component.visiblePages).toEqual([1, 2, 3]);
  });

  // 16. Paginación: debe mostrar ventana de 5 páginas cuando está al inicio
  it('should show first 5 pages when near start', () => {
    // Arrange - Crear 30 inscripciones (6 páginas)
    component.inscriptions = Array(30).fill(null).map((_, i) => ({ id_inscripcion: i + 1 } as Inscription));
    component.currentPage = 2;
    
    // Assert - Verificar ventana de primeras 5 páginas
    expect(component.visiblePages).toEqual([1, 2, 3, 4, 5]);
  });

  // 17. Paginación: debe mostrar ventana de 5 páginas cuando está al final
  it('should show last 5 pages when near end', () => {
    // Arrange - Crear 30 inscripciones (6 páginas) y estar en la última
    component.inscriptions = Array(30).fill(null).map((_, i) => ({ id_inscripcion: i + 1 } as Inscription));
    component.currentPage = 5;
    
    // Assert - Verificar ventana de últimas 5 páginas
    expect(component.visiblePages).toEqual([2, 3, 4, 5, 6]);
  });

  // 18. Paginación: debe navegar a una página específica válida
  it('should navigate to specific valid page', () => {
    // Arrange - Crear 12 inscripciones
    component.inscriptions = Array(12).fill(null).map((_, i) => ({ id_inscripcion: i + 1 } as Inscription));
    
    // Act - Navegar a la página 2
    component.goToPage(2);
    
    // Assert - Verificar cambio de página
    expect(component.currentPage).toBe(2);
  });

  // 19. Paginación: no debe navegar a página menor que 1
  it('should not navigate to invalid page < 1', () => {
    // Arrange - Crear 12 inscripciones y establecer página actual
    component.inscriptions = Array(12).fill(null).map((_, i) => ({ id_inscripcion: i + 1 } as Inscription));
    component.currentPage = 2;
    
    // Act - Intentar navegar a página 0
    component.goToPage(0);
    
    // Assert - Verificar que no cambió de página
    expect(component.currentPage).toBe(2);
  });

  // 20. Paginación: no debe navegar a página mayor que totalPages
  it('should not navigate to invalid page > totalPages', () => {
    // Arrange - Crear 12 inscripciones y establecer página actual
    component.inscriptions = Array(12).fill(null).map((_, i) => ({ id_inscripcion: i + 1 } as Inscription));
    component.currentPage = 2;
    
    // Act - Intentar navegar a página 10
    component.goToPage(10);
    
    // Assert - Verificar que no cambió de página
    expect(component.currentPage).toBe(2);
  });

  // 21. Paginación: debe retroceder a la página anterior
  it('should go to previous page', () => {
    // Arrange - Crear 12 inscripciones y estar en página 2
    component.inscriptions = Array(12).fill(null).map((_, i) => ({ id_inscripcion: i + 1 } as Inscription));
    component.currentPage = 2;
    
    // Act - Retroceder una página
    component.previousPage();
    
    // Assert - Verificar que está en página 1
    expect(component.currentPage).toBe(1);
  });

  // 22. Paginación: no debe retroceder si está en la primera página
  it('should not go before first page', () => {
    // Arrange - Crear 12 inscripciones y estar en página 1
    component.inscriptions = Array(12).fill(null).map((_, i) => ({ id_inscripcion: i + 1 } as Inscription));
    component.currentPage = 1;
    
    // Act - Intentar retroceder
    component.previousPage();
    
    // Assert - Verificar que sigue en página 1
    expect(component.currentPage).toBe(1);
  });

  // 23. Paginación: debe avanzar a la página siguiente
  it('should go to next page', () => {
    // Arrange - Crear 12 inscripciones y estar en página 1
    component.inscriptions = Array(12).fill(null).map((_, i) => ({ id_inscripcion: i + 1 } as Inscription));
    component.currentPage = 1;
    
    // Act - Avanzar una página
    component.nextPage();
    
    // Assert - Verificar que está en página 2
    expect(component.currentPage).toBe(2);
  });

  // 24. Paginación: no debe avanzar si está en la última página
  it('should not go beyond last page', () => {
    // Arrange - Crear 12 inscripciones y estar en última página
    component.inscriptions = Array(12).fill(null).map((_, i) => ({ id_inscripcion: i + 1 } as Inscription));
    component.currentPage = 3;
    
    // Act - Intentar avanzar
    component.nextPage();
    
    // Assert - Verificar que sigue en página 3
    expect(component.currentPage).toBe(3);
  });

  // 25. Paginación: debe manejar lista vacía correctamente
  it('should handle empty inscriptions list', () => {
    // Arrange - Establecer lista vacía
    component.inscriptions = [];
    
    // Assert - Verificar valores para lista vacía
    expect(component.totalPages).toBe(0);
    expect(component.paginatedInscriptions).toEqual([]);
  });
});
