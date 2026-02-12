import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';
import { By } from '@angular/platform-browser';

import { List } from './list';
import { Clients } from '../../services/clients';
import { Client } from '../../models/client';

describe('List Component - Clients', () => {
  let component: List;
  let fixture: ComponentFixture<List>;
  let service: jasmine.SpyObj<Clients>;
  let router: Router;

  const mockClients: Client[] = [
    {
      id_cliente: 1,
      nombre: 'Juan',
      apellido: 'Perez',
      email: 'juan@test.com',
      telefono: '0999999999',
      fecha_nacimiento: '2000-01-01',
    } as Client,
  ];

  beforeEach(async () => {
    const serviceSpy = jasmine.createSpyObj('Clients', ['getAll', 'delete']);

    await TestBed.configureTestingModule({
      imports: [List],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: Clients, useValue: serviceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(List);
    component = fixture.componentInstance;
    service = TestBed.inject(Clients) as jasmine.SpyObj<Clients>;
    router = TestBed.inject(Router);

    service.getAll.and.returnValue(of(mockClients));
    fixture.detectChanges();
  });

  // 1. El componente se crea correctamente
  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  // 2. La lista de clientes se carga al inicializar
  it('should load clients on init', () => {
    expect(service.getAll).toHaveBeenCalled();
    expect(component.clients.length).toBe(1);
    expect(component.clients[0].nombre).toBe('Juan');
  });

  // 3. Navegación al formulario de creación
  it('should navigate to create form', () => {
    const navigateSpy = spyOn(router, 'navigate');
    component.navigateToCreate();
    expect(navigateSpy).toHaveBeenCalledWith(['/clients/form']);
  });

  // 4. Navegación al formulario de edición de un cliente existente
  it('should navigate to edit form', () => {
    const navigateSpy = spyOn(router, 'navigate');
    component.edit(1);
    expect(navigateSpy).toHaveBeenCalledWith(['/clients/form', 1]);
  });

  // 5. Confirmación de eliminación: eliminar cliente cuando se acepta
  it('should delete client when confirmed', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    service.delete.and.returnValue(of({} as any));

    component.delete(1);
    fixture.detectChanges();

    expect(service.delete).toHaveBeenCalledWith(1);
    expect(component.clients.length).toBe(0);
  });

  // 6. Cancelar eliminación: cliente no se elimina si el usuario cancela
  it('should not delete client when cancelled', () => {
    spyOn(window, 'confirm').and.returnValue(false);
    component.delete(1);
    expect(service.delete).not.toHaveBeenCalled();
    expect(component.clients.length).toBe(1);
  });

  // 7. La tabla renderiza correctamente los datos del cliente
  it('should render client data correctly in table', () => {
    const rows = fixture.debugElement.queryAll(By.css('tbody tr'));
    expect(rows.length).toBe(1);
    const cells = rows[0].queryAll(By.css('td'));
    expect(cells[1].nativeElement.textContent).toContain('Juan');
    expect(cells[2].nativeElement.textContent).toContain('Perez');
    expect(cells[3].nativeElement.textContent).toContain('juan@test.com');
  });

  // 8. Los botones de acción (Editar / Eliminar) existen y son visibles
  it('should have Edit and Delete buttons in table', () => {
    const row = fixture.debugElement.query(By.css('tbody tr'));
    const editButton = row.query(By.css('.btn-warning'));
    const deleteButton = row.query(By.css('.btn-danger'));
    expect(editButton).toBeTruthy();
    expect(deleteButton).toBeTruthy();
  });

  // 9. No navegar cuando edit recibe null
  it('should not navigate when edit receives null', () => {
    const navigateSpy = spyOn(router, 'navigate');
    component.edit(null as any);
    expect(navigateSpy).not.toHaveBeenCalled();
  });

  // 10. No navegar cuando edit recibe undefined
  it('should not navigate when edit receives undefined', () => {
    const navigateSpy = spyOn(router, 'navigate');
    component.edit(undefined);
    expect(navigateSpy).not.toHaveBeenCalled();
  });

  // 11. No eliminar cuando delete recibe null
  it('should not delete when delete receives null', () => {
    const confirmSpy = spyOn(window, 'confirm');
    component.delete(null as any);
    expect(confirmSpy).not.toHaveBeenCalled();
    expect(service.delete).not.toHaveBeenCalled();
  });

  // 12. No eliminar cuando delete recibe undefined
  it('should not delete when delete receives undefined', () => {
    const confirmSpy = spyOn(window, 'confirm');
    component.delete(undefined);
    expect(confirmSpy).not.toHaveBeenCalled();
    expect(service.delete).not.toHaveBeenCalled();
  });
});