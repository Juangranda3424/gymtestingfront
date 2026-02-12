import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Payments } from '../../services/payments';
import { Clients } from '../../services/clients';
import { Memberships } from '../../services/memberships';
import { Payment } from '../../models/payment';
import { Client } from '../../models/client';
import { Membership } from '../../models/membership';

@Component({
  selector: 'app-form',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './form.html',
  styleUrl: './form.css',
})
export class Form implements OnInit {
  form: FormGroup;
  isEdit = false;
  id?: number;
  clients: Client[] = [];
  memberships: Membership[] = [];

  constructor(
    private fb: FormBuilder,
    private service: Payments,
    private clientsService: Clients,
    private membershipsService: Memberships,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.form = this.fb.group({
      id_cliente: [null, Validators.required],
      id_membresia: [null, Validators.required],
      monto: [0, [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit() {
    this.clientsService.getAll().subscribe((data: Client[]) => (this.clients = data));
    this.membershipsService.getAll().subscribe((data: Membership[]) => (this.memberships = data));
    const idParam = this.route.snapshot.params['id'];
    if (idParam) {
      this.id = +idParam;
      this.isEdit = true;
      this.service.getById(this.id).subscribe((data: Payment) => this.form.patchValue(data));
    }
  }

  submit() {
    if (this.form.invalid) return;
    const payment: Payment = this.form.value;
    if (this.isEdit && this.id) {
      this.service
        .update(this.id, { id_membresia: payment.id_membresia, monto: payment.monto })
        .subscribe(() => this.router.navigate(['/payments']));
    } else {
      this.service.create(payment).subscribe(() => this.router.navigate(['/payments']));
    }
  }

  cancel() {
    this.router.navigate(['/payments']);
  }
}