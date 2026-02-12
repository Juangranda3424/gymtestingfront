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
});