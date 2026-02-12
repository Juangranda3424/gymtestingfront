import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Clients } from '../../services/clients';
import { Client } from '../../models/client';

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

  constructor(
    private fb: FormBuilder,
    private service: Clients,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      lastname: ['', Validators.required],
      birthdate: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      cell: ['', Validators.required]
    });
  }

  ngOnInit() {
    const idParam = this.route.snapshot.params['id'];
    if (idParam) {
      this.id = +idParam;
      this.isEdit = true;
      this.service.getById(this.id).subscribe((data: Client) => this.form.patchValue(data));
    }
  }

  submit() {
    if (this.form.invalid) return;
    const client: Client = this.form.value;
    if (this.isEdit && this.id) {
      this.service.update(this.id, client).subscribe(() => this.router.navigate(['/clients']));
    } else {
      this.service.create(client).subscribe(() => this.router.navigate(['/clients']));
    }
  }

  cancel() {
    this.router.navigate(['/clients']);
  }
}