import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Class } from '../models/class';

@Injectable({
  providedIn: 'root'
})
export class Classes {

  private apiUrl = `${environment.apiUrl}/classes`;

  constructor(private http: HttpClient) {}

  // Obtener todas las clases
  getAll(): Observable<Class[]> {
    return this.http.get<Class[]>(this.apiUrl);
  }

  // Obtener clase por ID
  getById(id: number): Observable<Class> {
    return this.http.get<Class>(`${this.apiUrl}/${id}`);
  }

  // Crear nueva clase
  create(clase: Class): Observable<Class> {
    return this.http.post<Class>(this.apiUrl, clase);
  }

  // Actualizar clase
  update(id: number, clase: Partial<Class>): Observable<Class> {
    return this.http.put<Class>(`${this.apiUrl}/${id}`, clase);
  }

  // Eliminar clase
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
