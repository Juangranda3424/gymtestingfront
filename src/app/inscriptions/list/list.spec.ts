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
    expect(component).toBeTruthy();
  });

  // 2. La lista de inscripciones se carga al inicializar
  it('should load inscriptions on init', () => {
    expect(service.getAll).toHaveBeenCalled();
    expect(component.inscriptions.length).toBe(1);
    expect(component.inscriptions[0].nombre_clase).toBe('Yoga');
  });

  // 3. Navegación al formulario de creación
  it('should navigate to create form', () => {
    const navigateSpy = spyOn(router, 'navigate');
    component.navigateToCreate();
    expect(navigateSpy).toHaveBeenCalledWith(['/inscriptions/form']);
  });

  // 4. Navegación al formulario de edición de una inscripción existente
  it('should navigate to edit form', () => {
    const navigateSpy = spyOn(router, 'navigate');
    component.edit(1);
    expect(navigateSpy).toHaveBeenCalledWith(['/inscriptions/form', 1]);
  });

  // 5. Eliminación de inscripción confirmada
  it('should delete inscription when confirmed', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    service.delete.and.returnValue(of({} as any));

    component.delete(1);
    fixture.detectChanges();

    expect(service.delete).toHaveBeenCalledWith(1);
    expect(component.inscriptions.length).toBe(0);
  });

  // 6. Cancelar eliminación: no se elimina si el usuario cancela
  it('should not delete inscription when cancelled', () => {
    spyOn(window, 'confirm').and.returnValue(false);
    component.delete(1);

    expect(service.delete).not.toHaveBeenCalled();
    expect(component.inscriptions.length).toBe(1);
  });

  // 7. Renderizado correcto de datos en la tabla
  it('should render inscription data correctly in table', () => {
    const row = fixture.debugElement.query(By.css('tbody tr'));
    const cells = row.queryAll(By.css('td'));
    expect(cells[1].nativeElement.textContent).toContain('2025-01-01');
    expect(cells[2].nativeElement.textContent).toContain('Juan');
    expect(cells[3].nativeElement.textContent).toContain('Yoga');
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
