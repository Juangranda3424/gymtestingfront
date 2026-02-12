import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Membership } from '../models/membership';

@Injectable({
  providedIn: 'root'
})
export class Memberships {

  private apiUrl = `${environment.apiUrl}/memberships`;

  constructor(private http: HttpClient) {}

  // Obtener todas las membresías
  getAll(): Observable<Membership[]> {
    return this.http.get<Membership[]>(this.apiUrl);
  }

  // Obtener membresía por ID
  getById(id: number): Observable<Membership> {
    return this.http.get<Membership>(`${this.apiUrl}/${id}`);
  }

  // Crear una nueva membresía
  create(membership: Membership): Observable<Membership> {
    return this.http.post<Membership>(this.apiUrl, membership);
  }

  // Actualizar una membresía
  update(id: number, membership: Membership): Observable<Membership> {
    return this.http.put<Membership>(`${this.apiUrl}/${id}`, membership);
  }

  // Eliminar una membresía
  delete(id: number): Observable<Membership> {
    return this.http.delete<Membership>(`${this.apiUrl}/${id}`);
  }
}
