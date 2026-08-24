import { Component, OnInit, computed, inject, signal } from '@angular/core';

import { FiltroChamados } from '../../components/filtro-chamados/filtro-chamados';
import { ChamadoFormulario } from '../../components/chamado-formulario/chamado-formulario';
import { ListaChamados } from '../../components/lista-chamados/lista-chamados';
import { Chamado, NovoChamado, StatusChamado } from '../../models/chamado';
import { ChamadosService } from '../../services/chamados.service';

@Component({
  selector: 'app-chamados-page',
  standalone: true,
  imports: [FiltroChamados, ListaChamados, ChamadoFormulario],
  templateUrl: './chamados-page.html',
  styleUrl: './chamados-page.css',
})
export class ChamadosPage implements OnInit {
  private readonly chamadosService = inject(ChamadosService);

  readonly chamados = signal<Chamado[]>([]);

  readonly pesquisa = signal('');

  readonly filtroStatus = signal<StatusChamado | 'todos'>('todos');

  readonly carregando = signal(false);

  readonly erro = signal<string | null>(null);

  readonly exibindoFormulario = signal(false);

  readonly salvando = signal(false);

  readonly erroAoSalvar = signal<string | null>(null);

  readonly chamadosFiltrados = computed(() => {
    const termo = this.pesquisa().trim().toLowerCase();

    const status = this.filtroStatus();

    return this.chamados().filter((chamado) => {
      const correspondeTexto =
        termo === '' ||
        chamado.titulo.toLowerCase().includes(termo) ||
        chamado.descricao.toLowerCase().includes(termo);

      const correspondeStatus = status === 'todos' || chamado.status === status;

      return correspondeTexto && correspondeStatus;
    });
  });

  ngOnInit(): void {
    void this.carregarChamados();
  }

  async carregarChamados(): Promise<void> {
    this.carregando.set(true);
    this.erro.set(null);

    try {
      const dados = await this.chamadosService.listar();

      this.chamados.set(dados);
    } catch {
      this.erro.set('Não foi possível carregar os chamados.');
    } finally {
      this.carregando.set(false);
    }
  }

  atualizarPesquisa(valor: string): void {
    this.pesquisa.set(valor);
  }

  atualizarStatus(valor: StatusChamado | 'todos'): void {
    this.filtroStatus.set(valor);
  }

  abrirFormulario(): void {
    this.erroAoSalvar.set(null);
    this.exibindoFormulario.set(true);
  }

  fecharFormulario(): void {
    this.erroAoSalvar.set(null);
    this.exibindoFormulario.set(false);
  }

  async adicionarChamado(dados: NovoChamado): Promise<void> {
    this.salvando.set(true);
    this.erroAoSalvar.set(null);

    try {
      const novoChamado = await this.chamadosService.adicionar(dados);
      this.chamados.update((chamados) => [...chamados, novoChamado]);
      this.fecharFormulario();
    } catch {
      this.erroAoSalvar.set('Não foi possível adicionar o chamado.');
    } finally {
      this.salvando.set(false);
    }
  }
}
