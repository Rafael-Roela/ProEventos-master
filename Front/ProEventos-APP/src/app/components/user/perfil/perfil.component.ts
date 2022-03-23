import { ValidatorField } from './../../../helpers/ValidatorField';
import { Component, OnInit } from '@angular/core';
import { AbstractControlOptions, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AccountService } from '@app/services/account.service';
import { ToastrService } from 'ngx-toastr';
import { UserUpdate } from '@app/models/identity/UserUpdate';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.scss']
})
export class PerfilComponent implements OnInit {

  userUpdate = {} as UserUpdate;
  form!: FormGroup;

  constructor(
      private fb: FormBuilder,
      public accountService: AccountService,
      private router: Router,
      private toaster: ToastrService) {}

  ngOnInit(): void {
    this.validation();
    this.carregarUsuario();
  }

  private carregarUsuario(): void {
    this.accountService.getUser().subscribe(
    (userRetorno: UserUpdate) => {
      console.log(userRetorno);
      this.userUpdate = userRetorno;
      this.form.patchValue(this.userUpdate);
      this.toaster.success('Usuário carregado', 'Sucesso');
    },
    (error) => {
      console.error(error);
      this.toaster.error('Usuário não Carregado', 'Error');
      this.router.navigate(['/dashboard']);
    }
    );
  }

  private validation(): void {
    const formOptions: AbstractControlOptions = {
      validators: ValidatorField.MustMatch('password', 'confirmePassword')
    };

    this.form = this.fb.group({
      userName: [''],
      titulo: ['NaoInformado', Validators.required],
      primeiroNome: ['', Validators.required],
      ultimoNome: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.required]],
      descricao: ['', Validators.required],
      funcao: ['NaoInformado', Validators.required],
      password: ['', [Validators.minLength(4), Validators.nullValidator]],
      confirmePassword: ['', Validators.nullValidator]
    }, formOptions);
  }

  // Conveniente para pegar um FormField apenas com a letra F
  get f(): any { return this.form.controls; }

  onSubmit(): void {

    this.atualizarUsuario();
  }

  public atualizarUsuario(): void {
    this.userUpdate = { ...this.form.value };

    this.accountService.updateUser(this.userUpdate).subscribe(
      () => this.toaster.success('Usuário atualizado', 'Sucesso'),
      (error) => {
        this.toaster.error(error.error);
        console.error(error);
      }
    );
  }

  public resetForm(event: any): void {
    event.preventDefault();
    this.form.reset();
  }
}