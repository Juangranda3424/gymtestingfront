import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router, ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { Form } from './form';
import { Clients } from '../../services/clients';
import { Client } from '../../models/client';

describe('Client Form Component - Frontend Unit Tests', () => {
  let component: Form;
  let fixture: ComponentFixture<Form>;
  let router: Router;
  let service: jasmine.SpyObj<Clients>;
  let activatedRoute: any;

  // Datos válidos reutilizables
  const validFormData = {
    name: 'Juan',
    lastname: 'Perez',
    birthdate: '2000-01-01',
    email: 'juan@test.com',
    cell: '0999999999'
  };

  const mockClient: Client = {
    id_cliente: 1,
    nombre: 'Juan',
    apellido: 'Perez',
    fecha_nacimiento: '2000-01-01',
    email: 'juan@test.com',
    telefono: '0999999999'
  };

  beforeEach(async () => {
    const serviceSpy = jasmine.createSpyObj('Clients', ['getById', 'create', 'update']);
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
        { provide: Clients, useValue: serviceSpy },
        { provide: ActivatedRoute, useValue: activatedRoute }
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Form);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    service = TestBed.inject(Clients) as jasmine.SpyObj<Clients>;
    fixture.detectChanges();
  });

  // 1. El componente se crea correctamente y comprobamos que se cargo correctamente en la pagina
  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  // 2. El formulario reactivo se inicializa correctamente
  it('should create the form group', () => {
    expect(component.form).toBeDefined();
    expect(component.form.valid).toBeFalse();
  });

  // 3. El formulario debe ser inválido cuando está vacío
  it('should be invalid when form is empty', () => {
    expect(component.form.valid).toBeFalse();
  });

  // 4. El formulario debe contener todos los controles requeridos
  it('should contain required form controls', () => {
    expect(component.form.contains('name')).toBeTrue();
    expect(component.form.contains('lastname')).toBeTrue();
    expect(component.form.contains('birthdate')).toBeTrue();
    expect(component.form.contains('email')).toBeTrue();
    expect(component.form.contains('cell')).toBeTrue();
  });

  // 5. El formulario es válido cuando se completan los campos requeridos
  it('should be valid when required fields are filled', () => {
    component.form.setValue(validFormData);
    expect(component.form.valid).toBeTrue();
  });

  // 6. El campo email debe cumplir un formato válido
  it('should validate email format correctly', () => {
    component.form.patchValue({ email: 'correo-invalido' });
    const emailControl = component.form.get('email');

    expect(emailControl?.valid).toBeFalse();
    expect(emailControl?.value).toMatch(/correo/);
  });

  // 7. El botón Guardar debe estar deshabilitado cuando el formulario es inválido
  it('should disable submit button when form is invalid', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const button = compiled.querySelector(
      'button[type="submit"]'
    ) as HTMLButtonElement;

    expect(button).toBeTruthy();
    expect(button.disabled).toBeTrue();
  });

  // 8. Al presionar cancelar se debe navegar a /clients
  it('should navigate to /clients when cancel is called', () => {
    const navigateSpy = spyOn(router, 'navigate');

    component.cancel();

    expect(navigateSpy).toHaveBeenCalledWith(['/clients']);
  });

  // 9. No debe enviar el formulario si es inválido
  it('should not submit when form is invalid', () => {
    component.form.reset();
    component.submit();

    expect(service.create).not.toHaveBeenCalled();
    expect(service.update).not.toHaveBeenCalled();
  });

  // 10. Debe crear un cliente cuando el formulario es válido en modo creación
  it('should create client when form is valid in create mode', () => {
    const navigateSpy = spyOn(router, 'navigate');
    service.create.and.returnValue(of(mockClient));
    
    component.form.setValue(validFormData);
    component.isEdit = false;
    component.submit();

    expect(service.create).toHaveBeenCalledWith(validFormData as any);
    expect(navigateSpy).toHaveBeenCalledWith(['/clients']);
  });

  // 11. Debe actualizar un cliente cuando el formulario es válido en modo edición
  it('should update client when form is valid in edit mode', () => {
    const navigateSpy = spyOn(router, 'navigate');
    service.update.and.returnValue(of(mockClient));
    
    component.form.setValue(validFormData);
    component.isEdit = true;
    component.id = 1;
    component.submit();

    expect(service.update).toHaveBeenCalledWith(1, validFormData as any);
    expect(navigateSpy).toHaveBeenCalledWith(['/clients']);
  });

  // 12. Debe cargar datos del cliente en modo edición
  it('should load client data in edit mode', () => {
    service.getById.and.returnValue(of(mockClient));
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
    expect(compiled.querySelector('h2')?.textContent).toContain('Crear Cliente');
    
    component.isEdit = true;
    fixture.detectChanges();
    expect(compiled.querySelector('h2')?.textContent).toContain('Editar Cliente');
  });
});
