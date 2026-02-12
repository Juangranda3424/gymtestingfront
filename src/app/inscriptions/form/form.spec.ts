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

  // 4. El formulario debe contener los controles requeridos
  it('should contain required form controls', () => {
    expect(component.form.contains('id_cliente')).toBeTrue();
    expect(component.form.contains('id_clase')).toBeTrue();
  });

  // 5. El formulario es válido cuando se selecciona cliente y clase
  it('should be valid when required fields are filled', () => {
    component.form.setValue(validFormData);
    expect(component.form.valid).toBeTrue();
  });

  // 6. Las listas de clientes y clases deben inicializarse como arreglos
  it('should initialize clients and classes arrays', () => {
    expect(component.clients).toBeDefined();
    expect(component.classes).toBeDefined();
    expect(component.clients instanceof Array).toBeTrue();
    expect(component.classes instanceof Array).toBeTrue();
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

  // 8. Al presionar cancelar se debe navegar a /inscriptions
  it('should navigate to /inscriptions when cancel is called', () => {
    const navigateSpy = spyOn(router, 'navigate');

    component.cancel();

    expect(navigateSpy).toHaveBeenCalledWith(['/inscriptions']);
  });

  // 9. Debe cargar la lista de clientes al inicializar
  it('should load clients on init', () => {
    expect(clientsService.getAll).toHaveBeenCalled();
    expect(component.clients.length).toBe(2);
    expect(component.clients[0].nombre).toBe('Juan');
  });

  // 10. Debe cargar la lista de clases al inicializar
  it('should load classes on init', () => {
    expect(classesService.getAll).toHaveBeenCalled();
    expect(component.classes.length).toBe(2);
    expect(component.classes[0].nombre_clase).toBe('Yoga');
  });

  // 11. No debe enviar el formulario si es inválido
  it('should not submit when form is invalid', () => {
    component.form.reset();
    component.submit();

    expect(inscriptionsService.create).not.toHaveBeenCalled();
    expect(inscriptionsService.update).not.toHaveBeenCalled();
  });

  // 12. Debe crear una inscripción cuando el formulario es válido en modo creación
  it('should create inscription when form is valid in create mode', () => {
    const navigateSpy = spyOn(router, 'navigate');
    inscriptionsService.create.and.returnValue(of(mockInscription));
    
    component.form.setValue(validFormData);
    component.isEdit = false;
    component.submit();

    expect(inscriptionsService.create).toHaveBeenCalledWith(validFormData);
    expect(navigateSpy).toHaveBeenCalledWith(['/inscriptions']);
  });

  // 13. Debe actualizar una inscripción cuando el formulario es válido en modo edición
  it('should update inscription when form is valid in edit mode', () => {
    const navigateSpy = spyOn(router, 'navigate');
    inscriptionsService.update.and.returnValue(of(mockInscription));
    
    component.form.setValue(validFormData);
    component.isEdit = true;
    component.id = 1;
    component.submit();

    expect(inscriptionsService.update).toHaveBeenCalledWith(1, validFormData.id_clase);
    expect(navigateSpy).toHaveBeenCalledWith(['/inscriptions']);
  });

  // 14. Debe cargar datos de la inscripción en modo edición
  it('should load inscription data in edit mode', () => {
    inscriptionsService.getById.and.returnValue(of(mockInscription));
    activatedRoute.snapshot.params = { id: '1' };
    
    component.ngOnInit();

    expect(component.isEdit).toBeTrue();
    expect(component.id).toBe(1);
    expect(inscriptionsService.getById).toHaveBeenCalledWith(1);
  });

  // 15. No debe cargar datos en modo creación
  it('should not load inscription data in create mode', () => {
    activatedRoute.snapshot.params = {};
    
    component.ngOnInit();

    expect(component.isEdit).toBeFalse();
    expect(component.id).toBeUndefined();
    expect(inscriptionsService.getById).not.toHaveBeenCalled();
  });

  // 16. El título debe cambiar según el modo (crear/editar)
  it('should display correct title based on mode', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    
    component.isEdit = false;
    fixture.detectChanges();
    expect(compiled.querySelector('h2')?.textContent).toContain('Crear Inscripción');
    
    component.isEdit = true;
    fixture.detectChanges();
    expect(compiled.querySelector('h2')?.textContent).toContain('Editar Inscripción');
  });
});