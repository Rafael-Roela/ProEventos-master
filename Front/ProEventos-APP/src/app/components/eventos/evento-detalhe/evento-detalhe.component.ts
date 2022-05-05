import { Component, OnInit, TemplateRef } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { Evento } from '@app/models/Evento';
import { EventoService } from '@app/services/evento.service';
import { Lote } from '@app/models/Lote';

import { BsLocaleService } from 'ngx-bootstrap/datepicker';
import { ToastrService } from 'ngx-toastr';
import { LoteService } from '@app/services/lote.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { environment } from '@environments/environment';

@Component({
  selector: 'app-evento-detalhe',
  templateUrl: './evento-detalhe.component.html',
  styleUrls: ['./evento-detalhe.component.scss'],
})
export class EventoDetalheComponent implements OnInit {
  modalRef: BsModalRef;
  eventoId: number;
  evento = {} as Evento;
  form: FormGroup;
  estadoSalvar = 'post';
  loteAtual = {id: 0, nome: '', indice: 0};
  imagemURL = 'assets/img/upload.jpg';
  file: File;

  get modoEditar(): boolean {
    return this.estadoSalvar === 'put';
  }

  get lotes(): FormArray{
    return this.form.get('lotes') as FormArray;
  }

  get f(): any {
    return this.form.controls;
  }

  get bsConfig(): any {
    return {
      adaptivePosition: true,
      dateInputFormat: 'DD/MM/YYYY hh:mm a',
      containerClass: 'theme-default',
      showWeekNumbers: false
    };
  }

  constructor(private fb: FormBuilder,
              private localeService: BsLocaleService,
              private activatedRouter: ActivatedRoute,
              private eventoService: EventoService,
              private toastr: ToastrService,
              private modslService: BsModalService,
              private router: Router,
              private loteService: LoteService)
              {
                this.localeService.use('pt-br');
              }

  public carregarEvento(): void {
    this.eventoId = (Number (this.activatedRouter.snapshot.paramMap.get('id')));

    if (this.eventoId  !== null && this.eventoId !== 0){
      this.estadoSalvar = 'put';

      this.eventoService
        .getEventoById(this.eventoId)
        .subscribe(
        (evento: Evento) => {
          this.evento = { ...evento };
          this.form.patchValue(this.evento);
          if (this.evento.imagemURL !== '') {
            this.imagemURL = environment.apiURL + 'resources/images/' + this.evento.imagemURL;
          }
          this.carregarLotes();
        },
        (error: any) => {
          this.toastr.error('Erro ao tentar carregar Evento.', 'Error!');
          console.error(error);
        },
      );
    }
  }

  public carregarLotes(): void {
    this.loteService
      .getLotesByEventoId(this.eventoId)
      .subscribe(
      (lotesRetorno: Lote[]) => {
        lotesRetorno.forEach(lote => {
          this.lotes.push(this.criarLote(lote));
        });
      },
      () => {}
    );
  }

  ngOnInit(): void {
    this.carregarEvento();
    this.validation();
  }

  public validation(): void {
    this.form = this.fb.group({
      tema: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(50)]],
      local: ['', Validators.required],
      dataEvento: ['', Validators.required],
      qtdPessoas: ['', [Validators.required, Validators.maxLength(12000)]],
      telefone: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      imagemURL: [''],
      lotes: this.fb.array([])
    });
  }

  addLote(): void {
    this.lotes.push(this.criarLote({id: 0} as Lote));
  }

  criarLote(lote: Lote): FormGroup{
    return this.fb.group({
       id: [lote.id],
       nome: [lote.nome, Validators.required],
       quantidade: [lote.quantidade, Validators.required],
       preco: [lote.preco, Validators.required],
       dataInicio: [lote.dataInicio],
       dataFim: [lote.dataFim]
    });
  }

  public mudarValorData(value: Date, indice: number, campo: string): void {
    this.lotes.value[indice][campo] = value;
  }

  public retornaTituloLote(nome: string): string {
    return nome === null || nome === '' ? 'Nome do lote' : nome;
  }

  public resetForm(): void {
    this.form.reset();
  }

  public cssValidator(campoForm: FormControl | AbstractControl): any {
    return {'is-invalid': campoForm.errors && campoForm.touched};
  }

  public salvarEvento(): void {
    if (this.form.valid) {
      this.evento = this.estadoSalvar === 'post'
                ? {... this.form.value}
                : {id: this.evento.id, ... this.form.value};

      this.eventoService.post(this.evento).subscribe(
        (eventoRetorno: Evento) => {
          this.toastr.success('Evento salvo com Sucesso!', 'Sucesso!');
          this.router.navigate([`eventos/detalhe/${eventoRetorno.id}`]);
        },
        (error: any) => {
          console.error(error);
          this.toastr.error('Error ao salvar o evento!', 'Erro!');
        }
      );
    }
    else{
      this.eventoService.put(this.evento).subscribe(
        (eventoRetorno: Evento) => {
          this.toastr.success('Evento salvo com Sucesso!', 'Sucesso!');
          this.router.navigate([`eventos/detalhe/${eventoRetorno.id}`]);
        },
        (error: any) => {
          console.error(error);
          this.toastr.error('Error ao salvar o evento!', 'Erro!');
        }
      );
    }
  }
  public salvarLotes(): void {
    if (this.form.controls.lotes.valid) {
      this.loteService
        .saveLote(this.eventoId, this.form.value.lotes)
        .subscribe(
          () => {
            this.toastr.success('Lotes salvos com Sucesso!', 'Sucesso!');
          },
          (error: any) => {
            this.toastr.error('Erro ao tentar salvar lotes.', 'Erro');
            console.error(error);
          }
        );
    }
  }


  public removerLote(template: TemplateRef<any>, indice: number): void {

    this.loteAtual.indice = indice;
    this.loteAtual.id = this.lotes.get(indice + '.id')?.value;
    this.loteAtual.nome = this.lotes.get(indice + '.nome')?.value;

    this.modalRef = this.modslService.show(template, {class: 'modal-sm' });
  }

  confirmDeleteLote(): void {
    this.modalRef.hide();
    this.loteService.deleteLote(this.eventoId, this.loteAtual.id).subscribe(
      () => {
        this.toastr.success('Lote deletado com secesso.', 'Sucesso!');
        this.lotes.removeAt(this.loteAtual.indice);
      },
      (error: any) => {
        this.toastr.error(`Error ao tentar deletar o Lote ${this.loteAtual.id}`, 'Error!');
        console.error(error);
      }
    );
  }

  declineDeleteLote(): void {
    this.modalRef.hide();
  }

  onFileChange(ev: any): void {
    const reader = new FileReader();

    reader.onload = (event: any) => this.imagemURL = event.target.result;

    this.file = ev.target.files;
    reader.readAsDataURL(this.file);

    this.uploadImagem();
  }

  uploadImagem(): void {
    this.eventoService.postUpload(this.eventoId, this.file).subscribe(
      () => {
        this.carregarEvento();
        this.toastr.show('Imagem atualizada com Sucesso.', 'Sucesso!');
      },
      (error: any) => {
        this.toastr.error('Erro ao fazer upload da Imagem.', 'Error!');
        console.log(error);
      }
    );
  }

}
