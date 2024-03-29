import { Component, OnInit } from '@angular/core';
import { AuthService } from './../../service/auth-service/auth.service';
import { UserService } from 'src/app/service/user-service/user.service';
import { User } from './../../model/user';
import { Router } from '@angular/router';
import { ValueShareService } from './../../service/value-share-service/value-share.service'
declare const $;

interface Login {
  email: string;
  password: string;
}

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  public login: Login;

  constructor(
    private _router: Router,
    private _authService: AuthService,
    private _userService:  UserService,
    private _valueShareService: ValueShareService,
    ) { }

  ngOnInit() {
    this.login = {
      email: null,
      password: null
    }
  }

  submit(): void {
    this._valueShareService.setLoading(true);;
    this._authService.login(this.login.email, this.login.password)
      .subscribe((credential: firebase.auth.UserCredential) => {
        this._userService.fetchDetailUser(credential.user.uid).subscribe((res: User) => {
          if (res) {
            if (res.email !== credential.user.email) {
              res.email = credential.user.email;
              this._userService.saveUser(res).subscribe(() =>{
                this._valueShareService.setLoading(false);;
                this._router.navigate(['/inventory/list']);
              },(err) => {
                console.error(err);
                this._valueShareService.setCompleteModal('※ ログインには成功しましたが、担当者の登録データに誤りがあります。自分の担当者データを更新して下さい', 20000);

                setTimeout(() => {
                  this._router.navigate(['/inventory/list']);
                }, 4000);
              });
            } else {
              this._valueShareService.setLoading(false);;
              this._router.navigate(['/inventory/list']);
            }
          }
        });
      },(err) => {
        console.log(err);
        this._valueShareService.setCompleteModal('※ ログインに失敗しました。', 5000);
      });
  }
}
