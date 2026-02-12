import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Inscriptions } from '../../services/inscriptions';
import { Clients } from '../../services/clients';
import { Classes } from '../../services/classes';
import { Inscription } from '../../models/inscription';
import { Client } from '../../models/client';
import { Class } from '../../models/class';

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
  classes: Class[] = [];

  constructor(
    private fb: FormBuilder,
    private service: Inscriptions,
    private clientsService: Clients,
    private classesService: Classes,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.form = this.fb.group({
      id_cliente: [null, Validators.required],
      id_clase: [null, Validators.required]
    });
  }

  ngOnInit() {
    this.clientsService.getAll().subscribe((data: Client[]) => (this.clients = data));
    this.classesService.getAll().subscribe((data: Class[]) => (this.classes = data));
    const idParam = this.route.snapshot.params['id'];
    if (idParam) {
      this.id = +idParam;
      this.isEdit = true;
      this.service.getById(this.id).subscribe((data: Inscription) => this.form.patchValue(data));
    }
  }

  submit() {
    if (this.form.invalid) return;
    const inscription: Inscription = this.form.value;
    if (this.isEdit && this.id) {
      this.service
        .update(this.id, inscription.id_clase)
        .subscribe(() => this.router.navigate(['/inscriptions']));
    } else {
      this.service.create(inscription).subscribe(() => this.router.navigate(['/inscriptions']));
    }
  }

  cancel() {
    this.router.navigate(['/inscriptions']);
  }
}