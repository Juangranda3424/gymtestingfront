import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Memberships } from '../../services/memberships';
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

  constructor(
    private fb: FormBuilder,
    private service: Memberships,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.form = this.fb.group({
      tipo: ['', Validators.required],
      precio: [0, [Validators.required, Validators.min(0)]],
      duracion_meses: [0, [Validators.required, Validators.min(1)]]
    });
  }

  ngOnInit() {
    const idParam = this.route.snapshot.params['id'];
    if (idParam) {
      this.id = +idParam;
      this.isEdit = true;
      this.service.getById(this.id).subscribe((data: Membership) => this.form.patchValue(data));
    }
  }

  submit() {
    if (this.form.invalid) return;
    const membership: Membership = this.form.value;
    if (this.isEdit && this.id) {
      this.service.update(this.id, membership).subscribe(() => this.router.navigate(['/memberships']));
    } else {
      this.service.create(membership).subscribe(() => this.router.navigate(['/memberships']));
    }
  }

  cancel() {
    this.router.navigate(['/memberships']);
  }
}