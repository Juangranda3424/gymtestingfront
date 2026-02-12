import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { Clients } from './clients';
import { environment } from '../../environments/environment';
import { Client } from '../models/client';

describe('Clients Service', () => {
  let service: Clients;
  let httpMock: HttpTestingController;

  const apiUrl = `${environment.apiUrl}/clients`;

  const mockClient: Client = {
    id_cliente: 1,
    nombre: 'Juan',
    apellido: 'Perez',
    fecha_nacimiento: '1995-05-10',
    email: 'juan@test.com',
    telefono: '0999999999',
    estado: true,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),          // Provee HttpClient real
        provideHttpClientTesting(),   // Provee HttpClient para testing
      ],
    });

    service = TestBed.inject(Clients);          // Inyecta el servicio a testear
    httpMock = TestBed.inject(HttpTestingController); // Inyecta el mock de HTTP
  });

  afterEach(() => {
    // Verifica que no queden solicitudes HTTP pendientes después de cada prueba
    httpMock.verify();
  });

  // 1. CREACIÓN DEL SERVICIO
  // Verifica que el servicio de Clients se haya creado correctamente
  it('should be created', () => {
    expect(service).toBeTruthy(); // Servicio existe
    expect(service).toBeDefined(); // Servicio está definido
  });

  // 2. OBTENER TODOS LOS CLIENTES
  // Prueba que el método getAll retorna una lista de clientes correctamente
  it('should get all clients', () => {
    service.getAll().subscribe(clients => {
      expect(clients).toBeTruthy(); // Debe retornar algo
      expect(clients.length).toBeGreaterThan(0); // Debe tener al menos un cliente
      expect(clients[0].nombre).toBe('Juan'); // Verifica datos del primer cliente
      expect(clients[0].email).toContain('@'); // Email con formato válido
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('GET'); // Debe ser una solicitud GET

    req.flush([mockClient]); // Simula la respuesta del servidor
  });

  // 3. OBTENER CLIENTE POR ID
  // Prueba que getById devuelve el cliente correcto según su ID
  it('should get client by id', () => {
    service.getById(1).subscribe(client => {
      expect(client).toBeTruthy(); // Debe existir el cliente
      expect(client.id_cliente).toBe(1); // Verifica el ID
      expect(client.nombre).toEqual('Juan'); // Verifica el nombre
      expect(client.apellido).not.toBe(''); // Apellido no vacío
    });

    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('GET'); // Solicitud GET por ID

    req.flush(mockClient); // Respuesta simulada
  });

  // 4. CREAR CLIENTE
  // Prueba que el método create envía y recibe un cliente correctamente
  it('should create a client', () => {
    service.create(mockClient).subscribe(client => {
      expect(client).toBeDefined(); // Debe retornar cliente creado
      expect(client.nombre).toBe('Juan'); // Nombre correcto
      expect(client.id_cliente).toBeGreaterThan(0); // ID válido
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('POST'); // Solicitud POST
    expect(req.request.body.nombre).toBe('Juan'); // Body enviado correcto

    req.flush(mockClient); // Respuesta simulada
  });

  // 5. ACTUALIZAR CLIENTE
  // Prueba que update modifica los datos del cliente correctamente
  it('should update a client', () => {
    const updatedClient: Client = {
      ...mockClient,
      nombre: 'Carlos', // Cambiamos el nombre
    };

    service.update(1, updatedClient).subscribe(client => {
      expect(client.nombre).toBe('Carlos'); // Verifica actualización
      expect(client.nombre).not.toBe('Juan'); // Nombre anterior no debe aparecer
    });

    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('PUT'); // Solicitud PUT
    expect(req.request.body.nombre).toBe('Carlos'); // Body actualizado

    req.flush(updatedClient); // Respuesta simulada
  });

  // 6. ELIMINAR CLIENTE
  // Prueba que delete elimina el cliente correctamente
  it('should delete a client', () => {
    service.delete(1).subscribe(response => {
      expect(response).toBeNull(); // Respuesta null esperado
    });

    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('DELETE'); // Solicitud DELETE

    req.flush(null); // Respuesta simulada
  });
});