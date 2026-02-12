import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { Inscriptions } from './inscriptions';
import { environment } from '../../environments/environment';
import { Inscription } from '../models/inscription';

describe('Inscriptions Service', () => {
  let service: Inscriptions;
  let httpMock: HttpTestingController;

  const apiUrl = `${environment.apiUrl}/inscriptions`;

  const mockInscription: Inscription = {
    id_inscripcion: 1,
    id_cliente: 10,
    id_clase: 5,
    fecha_inscripcion: '2025-01-10',
    cliente_nombre: 'Ana',
    cliente_apellido: 'Lopez',
    nombre_clase: 'Yoga',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),          // Provee HttpClient real
        provideHttpClientTesting(),   // Provee HttpClient para testing
      ],
    });

    service = TestBed.inject(Inscriptions);          // Inyecta servicio
    httpMock = TestBed.inject(HttpTestingController); // Inyecta mock de HTTP
  });

  afterEach(() => {
    // Verifica que no queden solicitudes HTTP pendientes después de cada prueba
    httpMock.verify();
  });

  // 1. CREACIÓN DEL SERVICIO
  // Verifica que el servicio Inscriptions se haya creado correctamente
  it('should be created', () => {
    expect(service).toBeTruthy(); // Servicio existe
    expect(service).toBeDefined(); // Servicio está definido
  });

  // 2. OBTENER TODAS LAS INSCRIPCIONES
  // Prueba que getAll devuelve correctamente un array de inscripciones
  it('should get all inscriptions', () => {
    service.getAll().subscribe(inscriptions => {
      expect(inscriptions).toBeTruthy(); // Debe retornar algo
      expect(inscriptions.length).toBeGreaterThan(0); // Al menos 1 inscripcion
      expect(inscriptions[0].id_cliente).toBe(10); // Verifica id_cliente
      expect(inscriptions[0].nombre_clase).toBe('Yoga'); // Verifica nombre_clase
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('GET'); // Solicitud GET

    req.flush([mockInscription]); // Respuesta simulada
  });

  // 3. OBTENER INSCRIPCIÓN POR ID
  // Prueba que getById devuelve la inscripcion correcta según su ID
  it('should get inscription by id', () => {
    service.getById(1).subscribe(inscription => {
      expect(inscription).toBeTruthy(); // Inscripcion existe
      expect(inscription.id_inscripcion).toBe(1); // ID correcto
      expect(inscription.id_clase).toEqual(5); // Clase correcta
      expect(inscription.cliente_nombre).not.toBe(''); // Nombre cliente no vacío
    });

    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('GET'); // Solicitud GET por ID

    req.flush(mockInscription); // Respuesta simulada
  });

  // 4. CREAR INSCRIPCIÓN
  // Prueba que create envía y recibe correctamente una nueva inscripcion
  it('should create an inscription', () => {
    const createPayload = {
      id_cliente: 10,
      id_clase: 5,
    };

    service.create(createPayload).subscribe(inscription => {
      expect(inscription).toBeDefined(); // Debe retornar la inscripcion creada
      expect(inscription.id_cliente).toBe(10); // Verifica id_cliente
      expect(inscription.id_clase).toBe(5); // Verifica id_clase
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('POST'); // Solicitud POST
    expect(req.request.body.id_cliente).toBe(10); // Body correcto
    expect(req.request.body.id_clase).toBe(5); // Body correcto

    req.flush(mockInscription); // Respuesta simulada
  });

  // 5. ACTUALIZAR INSCRIPCIÓN
  // Prueba que update modifica la clase de la inscripcion correctamente
  it('should update inscription class', () => {
    service.update(1, 8).subscribe(inscription => {
      expect(inscription.id_clase).toBe(8); // Verifica cambio de clase
      expect(inscription.id_clase).not.toBe(5); // No debe ser la clase anterior
    });

    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('PUT'); // Solicitud PUT
    expect(req.request.body.id_clase).toBe(8); // Body con nueva clase

    req.flush({ ...mockInscription, id_clase: 8 }); // Respuesta simulada
  });

  // 6. ELIMINAR INSCRIPCIÓN
  // Prueba que delete elimina la inscripcion correctamente
  it('should delete an inscription', () => {
    service.delete(1).subscribe(response => {
      expect(response).toBeNull(); // Respuesta esperada null
    });

    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('DELETE'); // Solicitud DELETE

    req.flush(null); // Respuesta simulada
  });
});
