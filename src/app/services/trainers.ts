import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Trainer } from '../models/trainer';

@Injectable({
  providedIn: 'root'
})
export class Trainers {

  private apiUrl = `${environment.apiUrl}/trainers`;

  constructor(private http: HttpClient) {}

  // Obtener todos los entrenadores
  getAll(): Observable<Trainer[]> {
    return this.http.get<Trainer[]>(this.apiUrl);
  }

  // Obtener entrenador por ID
  getById(id: number): Observable<Trainer> {
    return this.http.get<Trainer>(`${this.apiUrl}/${id}`);
  }

  // Crear entrenador
  create(trainer: Trainer): Observable<Trainer> {
    return this.http.post<Trainer>(this.apiUrl, trainer);
  }

  // Actualizar entrenador
  update(id: number, trainer: Trainer): Observable<Trainer> {
    return this.http.put<Trainer>(`${this.apiUrl}/${id}`, trainer);
  }

  // Eliminar entrenador
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
