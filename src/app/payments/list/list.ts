import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Payments } from '../../services/payments';
import { Payment } from '../../models/payment';

@Component({
  selector: 'app-list',
  imports: [CommonModule],
  templateUrl: './list.html',
  styleUrl: './list.css',
})
export class List implements OnInit {
  payments: Payment[] = [];

  constructor(private service: Payments, private router: Router) {}

  ngOnInit() {
    this.service.getAll().subscribe((data: Payment[]) => (this.payments = data));
  }

  navigateToCreate() {
    this.router.navigate(['/payments/form']);
  }

  edit(id?: number) {
    if (id == null) return;
    this.router.navigate(['/payments/form', id]);
  }

  delete(id?: number) {
    if (id == null) return;
    if (confirm('¿Seguro que quieres eliminar?')) {
      this.service.delete(id).subscribe(() => {
        this.payments = this.payments.filter(p => p.id_pago !== id);
      });
    }
  }
}