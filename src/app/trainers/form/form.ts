import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Trainers } from '../../services/trainers';
import { Trainer } from '../../models/trainer';

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
    private service: Trainers,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.form = this.fb.group({
      nombre: ['', Validators.required],
      apellido: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telefono: ['', Validators.required],
      especialidad: ['', Validators.required],
      fecha_contratacion: ['', Validators.required]
    });
  }

  ngOnInit() {
    const idParam = this.route.snapshot.params['id'];
    if (idParam) {
      this.id = +idParam;
      this.isEdit = true;
      this.service.getById(this.id).subscribe((data: Trainer) => this.form.patchValue(data));
    }
  }

  submit() {
    if (this.form.invalid) return;
    const trainer: Trainer = this.form.value;
    if (this.isEdit && this.id) {
      this.service.update(this.id, trainer).subscribe(() => this.router.navigate(['/trainers']));
    } else {
      this.service.create(trainer).subscribe(() => this.router.navigate(['/trainers']));
    }
  }

  cancel() {
    this.router.navigate(['/trainers']);
  }
}