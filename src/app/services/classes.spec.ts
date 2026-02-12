import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Classes } from './classes';
import { environment } from '../../environments/environment';
import { Class } from '../models/class';

describe('Classes Service', () => {
  let service: Classes;
  let httpMock: HttpTestingController;

  const apiUrl = `${environment.apiUrl}/classes`;

  const mockClasses: Class[] = [
    {
      id_clase: 1,
      nombre_clase: 'Yoga',
      descripcion: 'Clase de relajación',
      horario: '08:00',
      dia_semana: 'Lunes',
      id_entrenador: 10
    },
    {
      id_clase: 2,
      nombre_clase: 'Crossfit',
      descripcion: 'Alta intensidad',
      horario: '18:00',
      dia_semana: 'Martes',
      id_entrenador: 12
    }
  ];

  const mockClass: Class = {
    id_clase: 1,
    nombre_clase: 'Yoga',
    descripcion: 'Clase de relajación',
    horario: '08:00',
    dia_semana: 'Lunes',
    id_entrenador: 10
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [Classes]
    });

    service = TestBed.inject(Classes);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    // Verifica que no queden solicitudes HTTP pendientes al finalizar cada prueba
    httpMock.verify();
  });

  // 1. Verifica que el servicio se cree correctamente
  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // 2. Prueba de obtener todas las clases
  it('should get all classes', () => {
    service.getAll().subscribe(classes => {
      // Se espera que la respuesta no sea nula
      expect(classes).toBeTruthy();
      // Se espera recibir la cantidad correcta de elementos
      expect(classes.length).toBe(2);
      expect(classes.length).toBeGreaterThan(1);
      // Se verifica que los datos específicos sean correctos
      expect(classes[0].nombre_clase).toBe('Yoga');
      expect(classes[1].dia_semana).toContain('Martes');
    });

    // Simula la solicitud HTTP GET al endpoint correspondiente
    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('GET');

    // Envía los datos simulados como respuesta
    req.flush(mockClasses);
  });

  // 3. Prueba de obtener una clase por su ID
  it('should get class by id', () => {
    service.getById(1).subscribe(clase => {
      expect(clase).toBeTruthy();
      expect(clase.id_clase).toBe(1);
      expect(clase.nombre_clase).toEqual('Yoga');
      // Verifica que el horario tenga formato HH:MM
      expect(clase.horario).toMatch(/\d{2}:\d{2}/);
    });

    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('GET');
    req.flush(mockClass);
  });

  // 4. Prueba de creación de una nueva clase
  it('should create a new class', () => {
    service.create(mockClass).subscribe(clase => {
      expect(clase).toBeTruthy();
      expect(clase.nombre_clase).toBe('Yoga');
      expect(clase.dia_semana).toBeDefined();
      expect(clase.id_entrenador).toBe(10);
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockClass);

    req.flush(mockClass);
  });

  // 5. Prueba de actualización de una clase existente
  it('should update a class', () => {
    const updateData: Partial<Class> = {
      nombre_clase: 'Yoga Avanzado',
      horario: '09:00'
    };

    service.update(1, updateData).subscribe(clase => {
      expect(clase).toBeTruthy();
      expect(clase.nombre_clase).toBe('Yoga Avanzado');
      expect(clase.horario).toBe('09:00');
      expect(clase.id_clase).toBe(1);
    });

    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(updateData);

    req.flush({ ...mockClass, ...updateData });
  });

  // 6. Prueba de eliminación de una clase
  it('should delete a class', () => {
    service.delete(1).subscribe(response => {
      // Se espera que la respuesta sea null al eliminar
      expect(response).toBeNull();
    });

    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('DELETE');

    req.flush(null);
  });
});