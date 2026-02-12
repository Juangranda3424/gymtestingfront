import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';
import { By } from '@angular/platform-browser';

import { List } from './list';
import { Trainers } from '../../services/trainers';
import { Trainer } from '../../models/trainer';

describe('List Component - Trainers', () => {
  let component: List;
  let fixture: ComponentFixture<List>;
  let service: jasmine.SpyObj<Trainers>;
  let router: Router;

  const mockTrainers: Trainer[] = [
    {
      id_entrenador: 1,
      nombre: 'Juan',
      apellido: 'Pérez',
      email: 'juan@test.com',
      telefono: '0999999999',
      especialidad: 'Cardio',
    } as Trainer,
  ];

  beforeEach(async () => {
    const serviceSpy = jasmine.createSpyObj('Trainers', ['getAll', 'delete']);

    await TestBed.configureTestingModule({
      imports: [List],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: Trainers, useValue: serviceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(List);
    component = fixture.componentInstance;
    service = TestBed.inject(Trainers) as jasmine.SpyObj<Trainers>;
    router = TestBed.inject(Router);

    service.getAll.and.returnValue(of(mockTrainers));
    fixture.detectChanges();
  });

  // 1. Componente creado correctamente
  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  // 2. Carga de entrenadores al iniciar
  it('should load trainers on init', () => {
    expect(service.getAll).toHaveBeenCalled();
    expect(component.trainers.length).toBe(1);
    expect(component.trainers[0].nombre).toBe('Juan');
  });

  // 3. Navegación al formulario de creación
  it('should navigate to create form', () => {
    const navigateSpy = spyOn(router, 'navigate');
    component.navigateToCreate();
    expect(navigateSpy).toHaveBeenCalledWith(['/trainers/form']);
  });

  // 4. Navegación al formulario de edición
  it('should navigate to edit form', () => {
    const navigateSpy = spyOn(router, 'navigate');
    component.edit(1);
    expect(navigateSpy).toHaveBeenCalledWith(['/trainers/form', 1]);
  });

  // 5. Eliminación confirmada de entrenador
  it('should delete trainer when confirmed', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    service.delete.and.returnValue(of({} as any));

    component.delete(1);
    fixture.detectChanges();

    expect(service.delete).toHaveBeenCalledWith(1);
    expect(component.trainers.length).toBe(0);
  });

  // 6. Cancelación de eliminación: no se elimina si el usuario cancela
  it('should not delete trainer when cancelled', () => {
    spyOn(window, 'confirm').and.returnValue(false);
    component.delete(1);

    expect(service.delete).not.toHaveBeenCalled();
    expect(component.trainers.length).toBe(1);
  });

  // 7. Renderizado correcto de datos en la tabla
  it('should render trainer data correctly in table', () => {
    const row = fixture.debugElement.query(By.css('tbody tr'));
    const cells = row.queryAll(By.css('td'));
    expect(cells[1].nativeElement.textContent).toContain('Juan');
    expect(cells[2].nativeElement.textContent).toContain('Pérez');
    expect(cells[3].nativeElement.textContent).toContain('juan@test.com');
    expect(cells[5].nativeElement.textContent).toContain('Cardio');
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
