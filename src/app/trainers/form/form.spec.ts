import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router, ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { Form } from './form';
import { Trainers } from '../../services/trainers';
import { Trainer } from '../../models/trainer';

describe('Trainer Form Component - Frontend Unit Tests', () => {
  let component: Form;
  let fixture: ComponentFixture<Form>;
  let service: jasmine.SpyObj<Trainers>;
  let router: Router;
  let activatedRoute: any;

  const mockTrainer: Trainer = {
    id_entrenador: 1,
    nombre: 'Carlos',
    apellido: 'Gómez',
    email: 'carlos@test.com',
    telefono: '0999999999',
    especialidad: 'Fuerza',
    fecha_contratacion: '2024-01-01',
  } as Trainer;

  const validFormData = {
    nombre: 'Carlos',
    apellido: 'Gómez',
    email: 'carlos@test.com',
    telefono: '0999999999',
    especialidad: 'Fuerza',
    fecha_contratacion: '2024-01-01',
  };

  beforeEach(async () => {
    const serviceSpy = jasmine.createSpyObj('Trainers', ['getById', 'create', 'update']);
    
    activatedRoute = {
      snapshot: {
        params: {}
      }
    };

    await TestBed.configureTestingModule({
      imports: [Form],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: Trainers, useValue: serviceSpy },
        { provide: ActivatedRoute, useValue: activatedRoute }
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Form);
    component = fixture.componentInstance;
    service = TestBed.inject(Trainers) as jasmine.SpyObj<Trainers>;
    router = TestBed.inject(Router);

    service.getById.and.returnValue(of(mockTrainer));
    service.create.and.returnValue(of({} as any));
    service.update.and.returnValue(of({} as any));

    fixture.detectChanges();
  });

  // 1. El componente se crea correctamente
  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  // 2. El formulario reactivo se inicializa correctamente
  it('should create the form group', () => {
    expect(component.form).toBeDefined();
    expect(component.form.valid).toBeFalse();
  });

  // 3. El formulario debe contener todos los controles requeridos
  it('should contain required form controls', () => {
    const controls = [
      'nombre',
      'apellido',
      'email',
      'telefono',
      'especialidad',
      'fecha_contratacion'
    ];
    controls.forEach(ctrl => {
      expect(component.form.contains(ctrl)).toBeTrue();
    });
  });

  // 4. El formulario debe ser inválido cuando está vacío
  it('should be invalid when form is empty', () => {
    component.form.reset();
    expect(component.form.valid).toBeFalse();
  });

  // 5. El formulario es válido cuando se completan los campos requeridos
  it('should be valid when required fields are filled', () => {
    component.form.setValue(validFormData);
    expect(component.form.valid).toBeTrue();
  });

  // 6. Validación de email: formato incorrecto
  it('should invalidate email with wrong format', () => {
    const emailControl = component.form.get('email');
    emailControl?.setValue('correo-invalido');
    expect(emailControl?.valid).toBeFalse();
    expect(emailControl?.errors).toBeDefined();
  });

  // 7. Prevención de submit cuando el formulario es inválido
  it('should not submit if form is invalid', () => {
    component.form.reset();
    component.submit();
    expect(service.create).not.toHaveBeenCalled();
    expect(service.update).not.toHaveBeenCalled();
  });

  // 8. Crear entrenador en modo creación
  it('should call create when submitting in create mode', () => {
    const navigateSpy = spyOn(router, 'navigate');
    component.form.setValue(validFormData);
    component.submit();
    expect(service.create).toHaveBeenCalledWith(validFormData);
    expect(navigateSpy).toHaveBeenCalledWith(['/trainers']);
  });

  // 9. Botón Guardar debe habilitarse/deshabilitarse según la validez del formulario
  it('should enable/disable submit button based on form validity', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const button = compiled.querySelector('button[type="submit"]') as HTMLButtonElement;

    component.form.reset();
    fixture.detectChanges();
    expect(button.disabled).toBeTrue();

    component.form.setValue(validFormData);
    fixture.detectChanges();
    expect(button.disabled).toBeFalse();
  });

  // 10. Cancelar navegación
  it('should navigate back on cancel', () => {
    const navigateSpy = spyOn(router, 'navigate');
    component.cancel();
    expect(navigateSpy).toHaveBeenCalledWith(['/trainers']);
  });

  // 11. Debe actualizar un entrenador cuando el formulario es válido en modo edición
  it('should update trainer when form is valid in edit mode', () => {
    const navigateSpy = spyOn(router, 'navigate');
    
    component.form.setValue(validFormData);
    component.isEdit = true;
    component.id = 1;
    component.submit();

    expect(service.update).toHaveBeenCalledWith(1, validFormData);
    expect(navigateSpy).toHaveBeenCalledWith(['/trainers']);
  });

  // 12. Debe cargar datos del entrenador en modo edición
  it('should load trainer data in edit mode', () => {
    service.getById.and.returnValue(of(mockTrainer));
    activatedRoute.snapshot.params = { id: '1' };
    
    component.ngOnInit();

    expect(component.isEdit).toBeTrue();
    expect(component.id).toBe(1);
    expect(service.getById).toHaveBeenCalledWith(1);
  });

  // 13. No debe cargar datos en modo creación
  it('should not load data in create mode', () => {
    activatedRoute.snapshot.params = {};
    
    component.ngOnInit();

    expect(component.isEdit).toBeFalse();
    expect(component.id).toBeUndefined();
    expect(service.getById).not.toHaveBeenCalled();
  });

  // 14. El título debe cambiar según el modo (crear/editar)
  it('should display correct title based on mode', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    
    component.isEdit = false;
    fixture.detectChanges();
    expect(compiled.querySelector('h2')?.textContent).toContain('Crear Entrenador');
    
    component.isEdit = true;
    fixture.detectChanges();
    expect(compiled.querySelector('h2')?.textContent).toContain('Editar Entrenador');
  });
});
