export interface Payment {
  id_pago?: number;
  id_cliente: number;
  id_membresia: number;
  monto: number;
  fecha_pago?: string;
  cliente_nombre?: string;
  cliente_apellido?: string;
  membresia_tipo?: string;
  membresia_precio?: number;
}