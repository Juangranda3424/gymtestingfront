import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Inscription } from '../models/inscription';

@Injectable({
  providedIn: 'root'
})
export class Inscriptions {

  private apiUrl = `${environment.apiUrl}/inscriptions`;

  constructor(private http: HttpClient) {}

  // Obtener todas las inscripciones
  getAll(): Observable<Inscription[]> {
    return this.http.get<Inscription[]>(this.apiUrl);
  }

  // Obtener inscripción por ID
  getById(id: number): Observable<Inscription> {
    return this.http.get<Inscription>(`${this.apiUrl}/${id}`);
  }

  // Crear inscripción
  create(inscription: Pick<Inscription, 'id_cliente' | 'id_clase'>): Observable<Inscription> {
    return this.http.post<Inscription>(this.apiUrl, inscription);
  }

  // Actualizar inscripción (solo cambia la clase)
  update(id: number, id_clase: number): Observable<Inscription> {
    return this.http.put<Inscription>(`${this.apiUrl}/${id}`, { id_clase });
  }

  // Eliminar inscripción
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
