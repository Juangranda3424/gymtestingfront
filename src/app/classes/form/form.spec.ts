import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { Form } from './form';
import { Classes } from '../../services/classes';
import { Trainers } from '../../services/trainers';

describe('Form Component - Frontend Unit Tests', () => {
  let component: Form;
  let fixture: ComponentFixture<Form>;
  let router: Router;
  let classesService: Classes;
  let trainersService: Trainers;
  let activatedRoute: ActivatedRoute;

  // Datos reutilizables para evitar código duplicado
  const validFormData = {
    nombre_clase: 'Yoga',
    descripcion: 'Clase de relajación',
    horario: '08:00',
    dia_semana: 'Lunes',
    id_entrenador: undefined
  };

  const mockTrainers = [
    { 
      id_entrenador: 1, 
      nombre: 'Juan', 
      apellido: 'Pérez',
      email: 'juan.perez@gym.com',
      telefono: '123456789',
      especialidad: 'Yoga',
      fecha_contratacion: '2024-01-15'
    },
    { 
      id_entrenador: 2, 
      nombre: 'María', 
      apellido: 'González',
      email: 'maria.gonzalez@gym.com',
      telefono: '987654321',
      especialidad: 'Pilates',
      fecha_contratacion: '2024-02-20'
    }
  ];

  const mockClass = {
    id_clase: 1,
    nombre_clase: 'Pilates',
    descripcion: 'Clase de estiramiento',
    horario: '10:00',
    dia_semana: 'Martes',
    id_entrenador: 1
  };
  // Datos válidos reutilizables
  beforeEach(async () => {    //Configuramos el entorno de pruebas para el componente Form
    await TestBed.configureTestingModule({
      imports: [Form],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              params: {}
            }
          }
        }
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Form);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    classesService = TestBed.inject(Classes);
    trainersService = TestBed.inject(Trainers);
    activatedRoute = TestBed.inject(ActivatedRoute);
    
    // Prevent ngOnInit from making real HTTP calls during component initialization
    spyOn(trainersService, 'getAll').and.returnValue(of([]));
  });
  // verificamos que el componente "Clases" nazca con las condiciones mínimas necesarias.

  // 1. El componente se crea correctamente
  it('should create the component', () => {
    expect(component).toBeTruthy(); //Confirmamos que el componente existe en memoria
  });

  // 2. El formulario reactivo se inicializa correctamente
  it('should create the form group', () => {
    expect(component.form).toBeDefined(); //Verificamos que el formulario esté definido
    expect(component.form.valid).toBeFalsy();  //El formulario debe ser inválido al inicio
  });

  // 3. El formulario debe ser inválido cuando está vacío
  it('should be invalid when form is empty', () => {
    expect(component.form.valid).toBe(false); //aqui tobe(false) verificar que el formulario este invalido cuando esta vacio
  });

  // 4. El formulario es válido cuando se completan los campos requeridos
  it('should be valid when required fields are filled', () => {
    component.form.patchValue(validFormData);  
    expect(component.form.valid).toBe(true);
  });

  // 5. La lista de días válidos existe y contiene valores esperados
  it('should define validDays correctly', () => {   //Verificamos que la lista de días válidos esté definida correctamente
    expect(component.validDays.length).toBeGreaterThan(0);  //comprobamos el arreglo validDays esté poblado
    expect(component.validDays).toContain('Lunes'); // Esto asegura que el usuario siempre tenga opciones para elegir en el formulario.
  });

  // 6. El nombre de la clase debe cumplir un patrón básico (solo letras)
  it('should match class name pattern', () => { //usamos una expresión regular para asegurar queel nombre de la clase (ej. "Pilates")
    component.form.patchValue({ nombre_clase: 'Pilates' });  //solo contenga letras.
    expect(component.form.value.nombre_clase).toMatch(/^[A-Za-z]+$/); //evita que se guarden caracteres extraños y coincida con el patrón esperado.
  });

  // 7. El botón Guardar debe estar deshabilitado cuando el formulario es inválido
  it('should disable submit button when form is invalid', () => {
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const button = compiled.querySelector(    //querySelector busca en el DOM el botón de submit
      'button[type="submit"]'
    ) as HTMLButtonElement;

    expect(button.disabled).toBeTruthy();
  });

  // 8. Al presionar cancelar se debe navegar a /classes
  it('should navigate to /classes when cancel is called', () => {
    const navigateSpy = spyOn(router, 'navigate');

    component.cancel();

    expect(navigateSpy).toHaveBeenCalledWith(['/classes']); //Verificamos que la navegación se haya realizado a la ruta correcta
  });

  // 9. ngOnInit debe cargar la lista de entrenadores
  it('should load trainers on ngOnInit', () => {
    (trainersService.getAll as jasmine.Spy).and.returnValue(of(mockTrainers));

    component.ngOnInit();

    expect(trainersService.getAll).toHaveBeenCalled();
    expect(component.trainers).toEqual(mockTrainers);
  });

  // 10. ngOnInit debe cargar datos de la clase en modo edición
  it('should load class data in edit mode', () => {
    activatedRoute.snapshot.params = { id: '1' };
    (trainersService.getAll as jasmine.Spy).and.returnValue(of(mockTrainers));
    spyOn(classesService, 'getById').and.returnValue(of(mockClass));

    component.ngOnInit();

    expect(component.isEdit).toBe(true);
    expect(component.id).toBe(1);
    expect(classesService.getById).toHaveBeenCalledWith(1);
  });

  // 11. submit debe crear una nueva clase cuando no está en modo edición
  it('should create a new class when submitting in create mode', () => {
    component.form.patchValue(validFormData);
    spyOn(classesService, 'create').and.returnValue(of(mockClass));
    spyOn(router, 'navigate');

    component.submit();

    expect(classesService.create).toHaveBeenCalledWith(validFormData);
    expect(router.navigate).toHaveBeenCalledWith(['/classes']);
  });

  // 12. submit debe actualizar la clase existente en modo edición
  it('should update existing class when submitting in edit mode', () => {
    component.isEdit = true;
    component.id = 1;
    component.form.patchValue(validFormData);   
    spyOn(classesService, 'update').and.returnValue(of(mockClass));
    spyOn(router, 'navigate');

    component.submit();

    expect(classesService.update).toHaveBeenCalledWith(1, validFormData); 
    expect(router.navigate).toHaveBeenCalledWith(['/classes']);
  });

  // 13. submit no debe hacer nada si el formulario es inválido
  it('should not submit when form is invalid', () => {
    spyOn(classesService, 'create');
    spyOn(classesService, 'update');
    component.form.reset();

    component.submit();

    expect(classesService.create).not.toHaveBeenCalled();
    expect(classesService.update).not.toHaveBeenCalled();
  });

  // 14. Verificar que todos los campos del formulario existen
  it('should have all form controls', () => {
    expect(component.form.get('nombre_clase')).toBeTruthy();
    expect(component.form.get('descripcion')).toBeTruthy();
    expect(component.form.get('horario')).toBeTruthy();
    expect(component.form.get('dia_semana')).toBeTruthy();
    expect(component.form.get('id_entrenador')).toBeTruthy();
  });

  // 15. nombre_clase debe ser requerido
  it('should require nombre_clase field', () => {
    const control = component.form.get('nombre_clase');
    control?.setValue('');
    expect(control?.hasError('required')).toBe(true);
  });

  // 16. horario debe ser requerido
  it('should require horario field', () => {
    const control = component.form.get('horario');
    control?.setValue('');
    expect(control?.hasError('required')).toBe(true);
  });

  // 17. dia_semana debe ser requerido
  it('should require dia_semana field', () => {
    const control = component.form.get('dia_semana');
    control?.setValue('');
    expect(control?.hasError('required')).toBe(true);
  });

  // 18. descripcion no debe ser requerido
  it('should not require descripcion field', () => {
    component.form.patchValue({
      nombre_clase: 'Yoga',
      horario: '08:00',
      dia_semana: 'Lunes',
      descripcion: ''
    });
    expect(component.form.get('descripcion')?.hasError('required')).toBe(false);
  });

  // 19. id_entrenador no debe ser requerido
  it('should not require id_entrenador field', () => {
    component.form.patchValue({
      nombre_clase: 'Yoga',
      horario: '08:00',
      dia_semana: 'Lunes',
      id_entrenador: null
    });
    expect(component.form.get('id_entrenador')?.hasError('required')).toBe(false);
  });

  // 20. isEdit debe ser false por defecto
  it('should initialize isEdit as false', () => {
    expect(component.isEdit).toBe(false);
  });

  // 21. validDays debe contener todos los días de la semana
  it('should contain all weekdays in validDays', () => {
    expect(component.validDays).toEqual([
      'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'
    ]);
  });

  // 22. El formulario debe actualizar sus valores correctamente con patchValue
  it('should update form values with patchValue', () => {
    component.form.patchValue({ nombre_clase: 'Zumba' });
    expect(component.form.get('nombre_clase')?.value).toBe('Zumba');
  });

  // 23. ngOnInit no debe establecer modo edición sin parámetro id
  it('should not set edit mode when no id param exists', () => {
    (trainersService.getAll as jasmine.Spy).and.returnValue(of(mockTrainers));
    activatedRoute.snapshot.params = {};

    component.ngOnInit();

    expect(component.isEdit).toBe(false);
    expect(component.id).toBeUndefined();
  });
});
