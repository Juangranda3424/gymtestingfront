export interface Trainer {
  id_entrenador?: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  especialidad: string;
  fecha_contratacion: string; // YYYY-MM-DD
  estado?: boolean;
}