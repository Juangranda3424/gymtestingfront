import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router, ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { Form } from './form';
import { Memberships } from '../../services/memberships';
import { Membership } from '../../models/membership';

describe('Membership Form', () => {
  let component: Form;
  let fixture: ComponentFixture<Form>;
  let compiled: HTMLElement;
  let router: Router;
  let service: jasmine.SpyObj<Memberships>;
  let activatedRoute: any;

  const mockMembership: Membership = {
    id_membresia: 1,
    tipo: 'Premium',
    precio: 80,
    duracion_meses: 12
  } as Membership;

  const validFormData = {
    tipo: 'Premium',
    precio: 80,
    duracion_meses: 12
  };

  beforeEach(async () => {
    const serviceSpy = jasmine.createSpyObj('Memberships', ['getById', 'create', 'update']);
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
        { provide: Memberships, useValue: serviceSpy },
        { provide: ActivatedRoute, useValue: activatedRoute }
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Form);
    component = fixture.componentInstance;
    compiled = fixture.nativeElement as HTMLElement;
    router = TestBed.inject(Router);
    service = TestBed.inject(Memberships) as jasmine.SpyObj<Memberships>;
    fixture.detectChanges();
  });

  // 1. El componente se crea correctamente
  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  // 2. El formulario reactivo se inicializa correctamente
  it('should create the form group', () => {
    expect(component.form).toBeDefined();
    expect(component.form instanceof Object).toBeTrue();
  });

  // 3. El formulario debe ser inválido cuando está vacío
  it('should be invalid when form is empty', () => {
    expect(component.form.valid).toBeFalse();
  });

  // 4. El formulario debe contener los controles requeridos
  it('should contain required form controls', () => {
    expect(component.form.contains('tipo')).toBeTrue();
    expect(component.form.contains('precio')).toBeTrue();
    expect(component.form.contains('duracion_meses')).toBeTrue();
  });

  // 5. El formulario debe ser inválido si el precio es negativo
  it('should be invalid when precio is negative', () => {
    component.form.setValue({
      tipo: 'Básica',
      precio: -10,
      duracion_meses: 3
    });

    expect(component.form.valid).toBeFalse();
  });

  // 6. El formulario debe ser inválido si la duración es menor a 1
  it('should be invalid when duracion_meses is less than 1', () => {
    component.form.setValue({
      tipo: 'Premium',
      precio: 50,
      duracion_meses: 0
    });

    expect(component.form.valid).toBeFalse();
  });

  // 7. El formulario es válido cuando se completan los campos requeridos
  it('should be valid when all required fields are filled correctly', () => {
    component.form.setValue({
      tipo: 'Premium',
      precio: 80,
      duracion_meses: 12
    });

    expect(component.form.valid).toBeTrue();
  });

  // 8. El botón Guardar debe estar deshabilitado cuando el formulario es inválido
  it('should disable submit button when form is invalid', () => {
    const button = compiled.querySelector(
      'button[type="submit"]'
    ) as HTMLButtonElement;

    expect(button).toBeTruthy();
    expect(button.disabled).toBeTrue();
  });

  // 9. Al presionar cancelar se debe navegar a /memberships
  it('should navigate to /memberships when cancel is called', () => {
    const navigateSpy = spyOn(router, 'navigate');
    component.cancel();
    expect(navigateSpy).toHaveBeenCalledWith(['/memberships']);
  });

  // 10. No debe enviar el formulario si es inválido
  it('should not submit when form is invalid', () => {
    component.form.reset();
    component.submit();

    expect(service.create).not.toHaveBeenCalled();
    expect(service.update).not.toHaveBeenCalled();
  });

  // 11. Debe crear una membresía cuando el formulario es válido en modo creación
  it('should create membership when form is valid in create mode', () => {
    const navigateSpy = spyOn(router, 'navigate');
    service.create.and.returnValue(of(mockMembership));
    
    component.form.setValue(validFormData);
    component.isEdit = false;
    component.submit();

    expect(service.create).toHaveBeenCalledWith(validFormData);
    expect(navigateSpy).toHaveBeenCalledWith(['/memberships']);
  });

  // 12. Debe actualizar una membresía cuando el formulario es válido en modo edición
  it('should update membership when form is valid in edit mode', () => {
    const navigateSpy = spyOn(router, 'navigate');
    service.update.and.returnValue(of(mockMembership));
    
    component.form.setValue(validFormData);
    component.isEdit = true;
    component.id = 1;
    component.submit();

    expect(service.update).toHaveBeenCalledWith(1, validFormData);
    expect(navigateSpy).toHaveBeenCalledWith(['/memberships']);
  });

  // 13. Debe cargar datos de la membresía en modo edición
  it('should load membership data in edit mode', () => {
    service.getById.and.returnValue(of(mockMembership));
    activatedRoute.snapshot.params = { id: '1' };
    
    component.ngOnInit();

    expect(component.isEdit).toBeTrue();
    expect(component.id).toBe(1);
    expect(service.getById).toHaveBeenCalledWith(1);
  });

  // 14. No debe cargar datos en modo creación
  it('should not load data in create mode', () => {
    activatedRoute.snapshot.params = {};
    
    component.ngOnInit();

    expect(component.isEdit).toBeFalse();
    expect(component.id).toBeUndefined();
    expect(service.getById).not.toHaveBeenCalled();
  });

  // 15. El título debe cambiar según el modo (crear/editar)
  it('should display correct title based on mode', () => {
    component.isEdit = false;
    fixture.detectChanges();
    expect(compiled.querySelector('h2')?.textContent).toContain('Crear Membresía');
    
    component.isEdit = true;
    fixture.detectChanges();
    expect(compiled.querySelector('h2')?.textContent).toContain('Editar Membresía');
  });
});
