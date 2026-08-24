import { Component, inject, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NovoChamado, Prioridade, StatusChamado } from '../../models/chamado';

@Component({
  selector: 'app-chamado-formulario',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './chamado-formulario.html',
  styleUrl: './chamado-formulario.css',
})
export class ChamadoFormulario {
  private readonly formBuilder = inject(FormBuilder);

  readonly salvar = output<NovoChamado>();
  readonly cancelar = output<void>();

  readonly formulario = this.formBuilder.nonNullable.group({
    titulo: ['', Validators.required],
    descricao: ['', Validators.required],
    prioridade: ['media' as Prioridade, Validators.required],
    status: ['aberto' as StatusChamado, Validators.required],
    responsavel: [''],
  });

  enviar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    const dados = this.formulario.getRawValue();
    this.salvar.emit({
      ...dados,
      titulo: dados.titulo.trim(),
      descricao: dados.descricao.trim(),
      responsavel: dados.responsavel.trim() || undefined,
    });
  }

  campoInvalido(campo: 'titulo' | 'descricao'): boolean {
    const controle = this.formulario.controls[campo];
    return controle.invalid && controle.touched;
  }
}
