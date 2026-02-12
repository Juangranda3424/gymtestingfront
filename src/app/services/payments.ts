import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Payment } from '../models/payment';

@Injectable({
  providedIn: 'root'
})
export class Payments {

  private apiUrl = `${environment.apiUrl}/payments`;

  constructor(private http: HttpClient) {}

  // Obtener todos los pagos
  getAll(): Observable<Payment[]> {
    return this.http.get<Payment[]>(this.apiUrl);
  }

  // Obtener pago por ID
  getById(id: number): Observable<Payment> {
    return this.http.get<Payment>(`${this.apiUrl}/${id}`);
  }

  // Crear un nuevo pago
  create(payment: Pick<Payment, 'id_cliente' | 'id_membresia' | 'monto'>): Observable<Payment> {
    return this.http.post<Payment>(this.apiUrl, payment);
  }

  // Actualizar un pago (parcial)
  update(
    id: number,
    data: Partial<Pick<Payment, 'id_membresia' | 'monto'>>
  ): Observable<Payment> {
    return this.http.put<Payment>(`${this.apiUrl}/${id}`, data);
  }

  // Eliminar un pago
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
