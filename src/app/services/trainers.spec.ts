import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { Trainers } from './trainers';
import { environment } from '../../environments/environment';
import { Trainer } from '../models/trainer';

describe('Trainers Service', () => {
  let service: Trainers;
  let httpMock: HttpTestingController;

  const apiUrl = `${environment.apiUrl}/trainers`;

  const mockTrainer: Trainer = {
    id_entrenador: 1,
    nombre: 'Carlos',
    apellido: 'Lopez',
    email: 'carlos@correo.com',
    telefono: '0999999999',
    especialidad: 'Fitness',
    fecha_contratacion: '2024-01-10',
    estado: true,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),          // Provee HttpClient real
        provideHttpClientTesting(),   // Provee HttpClient para testing
      ],
    });

    service = TestBed.inject(Trainers);          // Inyecta servicio Trainers
    httpMock = TestBed.inject(HttpTestingController); // Inyecta mock de HTTP
  });

  afterEach(() => {
    // Verifica que no queden solicitudes HTTP pendientes
    httpMock.verify();
  });

  // 1. CREACIÓN DEL SERVICIO
  // Verifica que el servicio Trainers se haya creado correctamente
  it('should be created', () => {
    expect(service).toBeTruthy(); // Servicio existe
    expect(service).toBeDefined(); // Servicio está definido
  });

  // 2. OBTENER TODOS LOS ENTRENADORES
  // Prueba que getAll devuelve un array de entrenadores correctamente
  it('should get all trainers', () => {
    service.getAll().subscribe(trainers => {
      expect(trainers).toBeTruthy(); // Debe retornar algo
      expect(trainers.length).toBeGreaterThan(0); // Al menos 1 entrenador
      expect(trainers[0].especialidad).toBe('Fitness'); // Especialidad correcta
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('GET'); // Solicitud GET

    req.flush([mockTrainer]); // Respuesta simulada
  });

  // 3. OBTENER ENTRENADOR POR ID
  // Prueba que getById devuelve el entrenador correcto según ID
  it('should get trainer by id', () => {
    service.getById(1).subscribe(trainer => {
      expect(trainer).toBeTruthy(); // Entrenador existe
      expect(trainer.id_entrenador).toBe(1); // ID correcto
      expect(trainer.nombre).toEqual('Carlos'); // Nombre correcto
      expect(trainer.estado).toBeTrue(); // Estado activo
    });

    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('GET'); // Solicitud GET por ID

    req.flush(mockTrainer); // Respuesta simulada
  });

  // 4. CREAR ENTRENADOR
  // Prueba que create envía y recibe correctamente un nuevo entrenador
  it('should create a trainer', () => {
    const createPayload: Trainer = {
      nombre: 'Carlos',
      apellido: 'Lopez',
      email: 'carlos@correo.com',
      telefono: '0999999999',
      especialidad: 'Fitness',
      fecha_contratacion: '2024-01-10',
    };

    service.create(createPayload).subscribe(trainer => {
      expect(trainer).toBeDefined(); // Entrenador creado
      expect(trainer.id_entrenador).toBeGreaterThan(0); // ID asignado
      expect(trainer.email).toContain('@'); // Email válido
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('POST'); // Solicitud POST
    expect(req.request.body.nombre).toBe('Carlos'); // Body correcto

    req.flush(mockTrainer); // Respuesta simulada
  });

  // 5. ACTUALIZAR ENTRENADOR
  // Prueba que update modifica correctamente la especialidad del entrenador
  it('should update a trainer', () => {
    const updatePayload: Trainer = {
      ...mockTrainer,
      especialidad: 'Crossfit',
    };

    service.update(1, updatePayload).subscribe(trainer => {
      expect(trainer.especialidad).toBe('Crossfit'); // Especialidad actualizada
      expect(trainer.nombre).toBe('Carlos'); // Nombre permanece igual
    });

    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('PUT'); // Solicitud PUT
    expect(req.request.body.especialidad).toBe('Crossfit'); // Body correcto

    req.flush(updatePayload); // Respuesta simulada
  });

  // 6. ELIMINAR ENTRENADOR
  // Prueba que delete elimina el entrenador correctamente
  it('should delete a trainer', () => {
    service.delete(1).subscribe(response => {
      expect(response).toBeNull(); // Respuesta esperada null
    });

    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('DELETE'); // Solicitud DELETE

    req.flush(null); // Respuesta simulada
  });
});
