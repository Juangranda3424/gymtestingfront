import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router, ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { Form } from './form';
import { Inscriptions } from '../../services/inscriptions';
import { Clients } from '../../services/clients';
import { Classes } from '../../services/classes';
import { Inscription } from '../../models/inscription';
import { Client } from '../../models/client';
import { Class } from '../../models/class';

describe('Inscription Form Component - Frontend Unit Tests', () => {
  let component: Form;
  let fixture: ComponentFixture<Form>;
  let router: Router;
  let inscriptionsService: jasmine.SpyObj<Inscriptions>;
  let clientsService: jasmine.SpyObj<Clients>;
  let classesService: jasmine.SpyObj<Classes>;
  let activatedRoute: any;

  // Datos válidos reutilizables
  const validFormData = {
    id_cliente: 1,
    id_clase: 2
  };

  const mockClients: Client[] = [
    { id_cliente: 1, nombre: 'Juan', apellido: 'Perez' } as Client,
    { id_cliente: 2, nombre: 'Maria', apellido: 'Lopez' } as Client
  ];

  const mockClasses: Class[] = [
    { id_clase: 1, nombre_clase: 'Yoga' } as Class,
    { id_clase: 2, nombre_clase: 'Pilates' } as Class
  ];

  const mockInscription: Inscription = {
    id_inscripcion: 1,
    id_cliente: 1,
    id_clase: 2
  } as Inscription;

  beforeEach(async () => {
    const inscriptionsSpy = jasmine.createSpyObj('Inscriptions', ['getById', 'create', 'update']);
    const clientsSpy = jasmine.createSpyObj('Clients', ['getAll']);
    const classesSpy = jasmine.createSpyObj('Classes', ['getAll']);
    
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
        { provide: Inscriptions, useValue: inscriptionsSpy },
        { provide: Clients, useValue: clientsSpy },
        { provide: Classes, useValue: classesSpy },
        { provide: ActivatedRoute, useValue: activatedRoute }
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Form);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    inscriptionsService = TestBed.inject(Inscriptions) as jasmine.SpyObj<Inscriptions>;
    clientsService = TestBed.inject(Clients) as jasmine.SpyObj<Clients>;
    classesService = TestBed.inject(Classes) as jasmine.SpyObj<Classes>;

    clientsService.getAll.and.returnValue(of(mockClients));
    classesService.getAll.and.returnValue(of(mockClasses));
    
    fixture.detectChanges();
  });

  // 1. El componente se crea correctamente
  it('should create the component', () => {
    // Assert - Verificar que el componente se instanció
    expect(component).toBeTruthy();
  });

  // 2. El formulario reactivo se inicializa correctamente e inválido cuando está vacío
  it('should create the form group and be invalid when empty', () => {
    // Assert - Verificar que el formulario se inicializó y está inválido
    expect(component.form).toBeDefined();
    expect(component.form.valid).toBeFalse();
  });

  // 3. El formulario debe contener los controles requeridos
  it('should contain required form controls', () => {
    // Assert - Verificar que existen los controles necesarios
    expect(component.form.contains('id_cliente')).toBeTrue();
    expect(component.form.contains('id_clase')).toBeTrue();
  });

  // 4. El formulario es válido cuando se selecciona cliente y clase
  it('should be valid when required fields are filled', () => {
    // Arrange & Act - Establecer valores válidos en el formulario
    component.form.setValue(validFormData);
    
    // Assert - Verificar que el formulario es válido
    expect(component.form.valid).toBeTrue();
  });

  // 5. Las listas de clientes y clases deben inicializarse como arreglos
  it('should initialize clients and classes arrays', () => {
    // Assert - Verificar que las listas están definidas y son arrays
    expect(component.clients).toBeDefined();
    expect(component.classes).toBeDefined();
    expect(component.clients instanceof Array).toBeTrue();
    expect(component.classes instanceof Array).toBeTrue();
  });

  // 6. El botón Guardar debe estar deshabilitado cuando el formulario es inválido
  it('should disable submit button when form is invalid', () => {
    // Arrange - Obtener referencia al DOM y al botón
    const compiled = fixture.nativeElement as HTMLElement;
    const button = compiled.querySelector(
      'button[type="submit"]'
    ) as HTMLButtonElement;

    // Assert - Verificar que el botón existe y está deshabilitado
    expect(button).toBeTruthy();
    expect(button.disabled).toBeTrue();
  });

  // 7. Al presionar cancelar se debe navegar a /inscriptions
  it('should navigate to /inscriptions when cancel is called', () => {
    // Arrange - Configurar el spy para el router
    const navigateSpy = spyOn(router, 'navigate');

    // Act - Ejecutar el método cancel
    component.cancel();

    // Assert - Verificar que se navegó correctamente
    expect(navigateSpy).toHaveBeenCalledWith(['/inscriptions']);
  });

  // 8. Debe cargar la lista de clientes al inicializar
  it('should load clients on init', () => {
    // Assert - Verificar que se cargaron los clientes correctamente
    expect(clientsService.getAll).toHaveBeenCalled();
    expect(component.clients.length).toBe(2);
    expect(component.clients[0].nombre).toBe('Juan');
  });

  // 9. Debe cargar la lista de clases al inicializar
  it('should load classes on init', () => {
    // Assert - Verificar que se cargaron las clases correctamente
    expect(classesService.getAll).toHaveBeenCalled();
    expect(component.classes.length).toBe(2);
    expect(component.classes[0].nombre_clase).toBe('Yoga');
  });

  // 10. No debe enviar el formulario si es inválido
  it('should not submit when form is invalid', () => {
    // Arrange - Resetear el formulario para que sea inválido
    component.form.reset();
    
    // Act - Intentar enviar el formulario
    component.submit();

    // Assert - Verificar que no se llamaron los servicios
    expect(inscriptionsService.create).not.toHaveBeenCalled();
    expect(inscriptionsService.update).not.toHaveBeenCalled();
  });

  // 11. Debe crear una inscripción cuando el formulario es válido en modo creación
  it('should create inscription when form is valid in create mode', () => {
    // Arrange - Configurar spies y datos de prueba
    const navigateSpy = spyOn(router, 'navigate');
    inscriptionsService.create.and.returnValue(of(mockInscription));
    component.form.setValue(validFormData);
    component.isEdit = false;
    
    // Act - Enviar el formulario
    component.submit();

    // Assert - Verificar que se creó la inscripción y se navegó
    expect(inscriptionsService.create).toHaveBeenCalledWith(validFormData);
    expect(navigateSpy).toHaveBeenCalledWith(['/inscriptions']);
  });

  // 12. Debe actualizar una inscripción cuando el formulario es válido en modo edición
  it('should update inscription when form is valid in edit mode', () => {
    // Arrange - Configurar el modo edición con datos existentes
    const navigateSpy = spyOn(router, 'navigate');
    inscriptionsService.update.and.returnValue(of(mockInscription));
    component.form.setValue(validFormData);
    component.isEdit = true;
    component.id = 1;
    
    // Act - Enviar el formulario en modo edición
    component.submit();

    // Assert - Verificar que se actualizó la inscripción correctamente
    expect(inscriptionsService.update).toHaveBeenCalledWith(1, validFormData.id_clase);
    expect(navigateSpy).toHaveBeenCalledWith(['/inscriptions']);
  });

  // 13. Debe cargar datos de la inscripción en modo edición
  it('should load inscription data in edit mode', () => {
    // Arrange - Configurar la ruta con un ID y el servicio mock
    inscriptionsService.getById.and.returnValue(of(mockInscription));
    activatedRoute.snapshot.params = { id: '1' };
    
    // Act - Inicializar el componente
    component.ngOnInit();

    // Assert - Verificar que se cargaron los datos correctamente
    expect(component.isEdit).toBeTrue();
    expect(component.id).toBe(1);
    expect(inscriptionsService.getById).toHaveBeenCalledWith(1);
  });

  // 14. No debe cargar datos en modo creación
  it('should not load inscription data in create mode', () => {
    // Arrange - Configurar la ruta sin parámetros
    activatedRoute.snapshot.params = {};
    
    // Act - Inicializar el componente
    component.ngOnInit();

    // Assert - Verificar que está en modo creación
    expect(component.isEdit).toBeFalse();
    expect(component.id).toBeUndefined();
    expect(inscriptionsService.getById).not.toHaveBeenCalled();
  });

  // 15. El título debe cambiar según el modo (crear/editar)
  it('should display correct title based on mode', () => {
    // Arrange - Obtener referencia al DOM compilado
    const compiled = fixture.nativeElement as HTMLElement;
    
    // Act - Probar modo creación
    component.isEdit = false;
    fixture.detectChanges();
    // Assert - Verificar título de creación
    expect(compiled.querySelector('h2')?.textContent).toContain('Crear Inscripción');
    
    // Act - Probar modo edición
    component.isEdit = true;
    fixture.detectChanges();
    // Assert - Verificar título de edición
    expect(compiled.querySelector('h2')?.textContent).toContain('Editar Inscripción');
  });
});