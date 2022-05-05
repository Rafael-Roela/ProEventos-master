import { Component, OnInit } from '@angular/core';
import { AccountService } from '@app/services/account.service';
import { ToastrService } from 'ngx-toastr';
import { UserUpdate } from '@app/models/identity/UserUpdate';
import { environment } from '@environments/environment';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.scss']
})
export class PerfilComponent implements OnInit {
  usuario = {} as UserUpdate;
  imagemURL = '';
  file: File;

  public get ehPalestrante(): boolean {
    return this.usuario.funcao === 'Palestrante';
  }

  constructor(
    private toastr: ToastrService,
    private accountService: AccountService
  ) {}

  ngOnInit(): void {
  }

  public setFormValue(usuario: UserUpdate): void {
    this.usuario = usuario;
    if (this.usuario.imagemURL){
      this.imagemURL = environment.apiURL + `resources/perfil/${this.usuario.imagemURL}`;
    }else{
      this.imagemURL = './assets/img/perfil.png';
    }
  }

  onFileChange(ev: any): void {
    const reader = new FileReader();

    reader.onload = (event: any) => this.imagemURL = event.target.result;

    this.file = ev.target.files;
    reader.readAsDataURL(this.file);

    this.uploadImagem();
  }

  private uploadImagem(): void {
    this.accountService
      .postUpload(this.file)
      .subscribe(
        () => this.toastr.success('Imagem atualizada com Sucesso', 'Sucesso!'),
        (error: any) => {
          this.toastr.error('Erro ao fazer o upload da Imagem', 'Error!');
          console.error(error);
        }
      );
  }

}
