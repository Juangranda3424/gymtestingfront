import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { Memberships } from './memberships';
import { environment } from '../../environments/environment';
import { Membership } from '../models/membership';

describe('Memberships Service', () => {
  let service: Memberships;
  let httpMock: HttpTestingController;

  const apiUrl = `${environment.apiUrl}/memberships`;

  const mockMembership: Membership = {
    id_membresia: 1,
    tipo: 'Premium',
    precio: 50,
    duracion_meses: 6,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),          // Provee HttpClient real
        provideHttpClientTesting(),   // Provee HttpClient para testing
      ],
    });

    service = TestBed.inject(Memberships);          // Inyecta servicio
    httpMock = TestBed.inject(HttpTestingController); // Inyecta mock de HTTP
  });

  afterEach(() => {
    // Verifica que no queden solicitudes HTTP pendientes después de cada prueba
    httpMock.verify();
  });

  // 1. CREACIÓN DEL SERVICIO
  // Verifica que el servicio Memberships se haya creado correctamente
  it('should be created', () => {
    expect(service).toBeTruthy(); // Servicio existe
    expect(service).toBeDefined(); // Servicio está definido
  });

  // 2. OBTENER TODAS LAS MEMBRESÍAS
  // Prueba que getAll devuelve correctamente un array de membresías
  it('should get all memberships', () => {
    service.getAll().subscribe(memberships => {
      expect(memberships).toBeTruthy(); // Debe retornar algo
      expect(memberships.length).toBeGreaterThan(0); // Al menos 1 membresía
      expect(memberships[0].tipo).toBe('Premium'); // Verifica tipo
      expect(memberships[0].precio).toBeGreaterThan(0); // Verifica precio
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('GET'); // Solicitud GET

    req.flush([mockMembership]); // Respuesta simulada
  });

  // 3. OBTENER MEMBRESÍA POR ID
  // Prueba que getById devuelve la membresía correcta según su ID
  it('should get membership by id', () => {
    service.getById(1).subscribe(membership => {
      expect(membership).toBeTruthy(); // Membresía existe
      expect(membership.id_membresia).toBe(1); // ID correcto
      expect(membership.duracion_meses).toEqual(6); // Duración correcta
      expect(membership.tipo).not.toBe(''); // Tipo no vacío
    });

    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('GET'); // Solicitud GET por ID

    req.flush(mockMembership); // Respuesta simulada
  });

  // 4. CREAR MEMBRESÍA
  // Prueba que create envía y recibe correctamente una nueva membresía
  it('should create a membership', () => {
    const createPayload: Membership = {
      tipo: 'Basic',
      precio: 20,
      duracion_meses: 3,
    };

    service.create(createPayload).subscribe(membership => {
      expect(membership).toBeDefined(); // Debe retornar la membresía creada
      expect(membership.tipo).toBe('Premium'); // Respuesta simulada retorna Premium
      expect(membership.id_membresia).toBeGreaterThan(0); // ID asignado
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('POST'); // Solicitud POST
    expect(req.request.body.tipo).toBe('Basic'); // Body correcto
    expect(req.request.body.precio).toBe(20); // Body correcto

    req.flush(mockMembership); // Respuesta simulada
  });

  // 5. ACTUALIZAR MEMBRESÍA
  // Prueba que update modifica la membresía correctamente
  it('should update a membership', () => {
    const updatePayload: Membership = {
      tipo: 'Gold',
      precio: 70,
      duracion_meses: 12,
    };

    service.update(1, updatePayload).subscribe(membership => {
      expect(membership.tipo).toBe('Gold'); // Tipo actualizado
      expect(membership.precio).toBe(70); // Precio actualizado
      expect(membership.duracion_meses).toBeGreaterThan(6); // Duración mayor
    });

    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('PUT'); // Solicitud PUT
    expect(req.request.body.tipo).toBe('Gold'); // Body actualizado

    req.flush({ ...updatePayload, id_membresia: 1 }); // Respuesta simulada
  });

  // 6. ELIMINAR MEMBRESÍA
  // Prueba que delete elimina la membresía correctamente
  it('should delete a membership', () => {
    service.delete(1).subscribe(response => {
      expect(response).toBeNull(); // Respuesta esperada null
    });

    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('DELETE'); // Solicitud DELETE

    req.flush(null); // Respuesta simulada
  });
});
