import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { Payments } from './payments';
import { environment } from '../../environments/environment';
import { Payment } from '../models/payment';

describe('Payments Service', () => {
  let service: Payments;
  let httpMock: HttpTestingController;

  const apiUrl = `${environment.apiUrl}/payments`;

  const mockPayment: Payment = {
    id_pago: 1,
    id_cliente: 10,
    id_membresia: 3,
    monto: 45,
    fecha_pago: '2025-01-01',
    cliente_nombre: 'Juan',
    cliente_apellido: 'Perez',
    membresia_tipo: 'Premium',
    membresia_precio: 50,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),          // Provee HttpClient real
        provideHttpClientTesting(),   // Provee HttpClient para testing
      ],
    });

    service = TestBed.inject(Payments);          // Inyecta servicio Payments
    httpMock = TestBed.inject(HttpTestingController); // Inyecta mock de HTTP
  });

  afterEach(() => {
    // Verifica que no queden solicitudes HTTP pendientes
    httpMock.verify();
  });

  // 1. CREACIÓN DEL SERVICIO
  // Verifica que el servicio Payments se haya creado correctamente
  it('should be created', () => {
    expect(service).toBeTruthy(); // Servicio existe
    expect(service).toBeDefined(); // Servicio está definido
  });

  // 2. OBTENER TODOS LOS PAGOS
  // Prueba que getAll devuelve un array de pagos correctamente
  it('should get all payments', () => {
    service.getAll().subscribe(payments => {
      expect(payments).toBeTruthy(); // Debe retornar algo
      expect(payments.length).toBeGreaterThan(0); // Al menos 1 pago
      expect(payments[0].monto).toBeGreaterThan(0); // Monto válido
      expect(payments[0].cliente_nombre).toBe('Juan'); // Nombre del cliente correcto
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('GET'); // Solicitud GET

    req.flush([mockPayment]); // Respuesta simulada
  });

  // 3. OBTENER PAGO POR ID
  // Prueba que getById devuelve el pago correcto según ID
  it('should get payment by id', () => {
    service.getById(1).subscribe(payment => {
      expect(payment).toBeTruthy(); // Pago existe
      expect(payment.id_pago).toBe(1); // ID correcto
      expect(payment.id_cliente).toEqual(10); // ID cliente correcto
      expect(payment.monto).toBe(45); // Monto correcto
    });

    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('GET'); // Solicitud GET por ID

    req.flush(mockPayment); // Respuesta simulada
  });

  // 4. CREAR PAGO
  // Prueba que create envía y recibe correctamente un nuevo pago
  it('should create a payment', () => {
    const createPayload: Pick<Payment, 'id_cliente' | 'id_membresia' | 'monto'> = {
      id_cliente: 10,
      id_membresia: 3,
      monto: 45,
    };

    service.create(createPayload).subscribe(payment => {
      expect(payment).toBeDefined(); // Pago creado
      expect(payment.id_pago).toBeGreaterThan(0); // ID asignado
      expect(payment.monto).toBe(45); // Monto correcto
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('POST'); // Solicitud POST
    expect(req.request.body.id_cliente).toBe(10); // Body correcto
    expect(req.request.body.monto).toEqual(45); // Body correcto

    req.flush(mockPayment); // Respuesta simulada
  });

  // 5. ACTUALIZAR PAGO
  // Prueba que update modifica correctamente el pago
  it('should update a payment', () => {
    const updatePayload = {
      id_membresia: 4,
      monto: 60,
    };

    service.update(1, updatePayload).subscribe(payment => {
      expect(payment.id_membresia).toBe(4); // Membresía actualizada
      expect(payment.monto).toBeGreaterThan(50); // Monto actualizado
    });

    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('PUT'); // Solicitud PUT
    expect(req.request.body.id_membresia).toBe(4); // Body correcto

    req.flush({ ...mockPayment, ...updatePayload }); // Respuesta simulada
  });

  // 6. ELIMINAR PAGO
  // Prueba que delete elimina el pago correctamente
  it('should delete a payment', () => {
    service.delete(1).subscribe(response => {
      expect(response).toBeNull(); // Respuesta esperada null
    });

    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('DELETE'); // Solicitud DELETE

    req.flush(null); // Respuesta simulada
  });
});
