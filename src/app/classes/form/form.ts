import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Classes } from '../../services/classes';
import { Trainers } from '../../services/trainers';
import { Class } from '../../models/class';
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
  trainers: Trainer[] = [];
  validDays = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

  constructor(
    private fb: FormBuilder,
    private service: Classes,
    private trainersService: Trainers,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.form = this.fb.group({
      nombre_clase: ['', Validators.required],
      descripcion: [''],
      horario: ['', Validators.required],
      dia_semana: ['', Validators.required],
      id_entrenador: [null]
    });
  }

  ngOnInit() {
    this.trainersService.getAll().subscribe(data => this.trainers = data);
    const idParam = this.route.snapshot.params['id'];
    if (idParam) {
      this.id = +idParam;
      this.isEdit = true;
      this.service.getById(this.id).subscribe(data => this.form.patchValue(data));
    }
  }

  submit() {
    if (this.form.invalid) return;
    const cls: Class = this.form.value;
    if (this.isEdit && this.id) {
      this.service.update(this.id, cls).subscribe(() => this.router.navigate(['/classes']));
    } else {
      this.service.create(cls).subscribe(() => this.router.navigate(['/classes']));
    }
  }

  cancel() {
    this.router.navigate(['/classes']);
  }
}