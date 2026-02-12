export interface Client {
  id_cliente?: number;
  nombre: string;
  apellido: string;
  fecha_nacimiento: string; // YYYY-MM-DD
  email: string;
  telefono: string;
  estado?: boolean;
}