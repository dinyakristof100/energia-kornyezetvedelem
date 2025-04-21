import {Component, OnInit} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {TranslateService} from "@ngx-translate/core";
import {AuthService} from "../../shared/services/auth.service";
import {Router} from "@angular/router";
import {MatSnackBar} from "@angular/material/snack-bar";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  hide = true;
  loading = true;

  constructor(
    private fb: FormBuilder,
    private translate: TranslateService,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
    ) {
    this.loginForm = this.fb.group({
      email: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  ngOnInit(): void {

  }

  togglePasswordVisibility(): void {
    this.hide = !this.hide;
  }

  changeLanguage(lang: string): void {
    this.translate.use(lang);
  }

  onSubmit(): void {
    let email = this.loginForm?.get('email')?.value.toString() || '';
    let password = this.loginForm?.get('password')?.value.toString() || '';

    this.authService.login(email,password).then(cred =>{
      // console.log(cred);
      this.router.navigateByUrl('/main');
      this.loading = false;
    }).catch(error =>{
      // console.error(error);

      this.translate.get(['LOGIN.ERROR_INVALID', 'LOGIN.CLOSE']).subscribe(translations  => {
        this.snackBar.open(translations['LOGIN.ERROR_INVALID'], translations['LOGIN.CLOSE'], {
          duration: 3000,
          panelClass: ['bg-red-500', 'text-white', 'text-center'],
          verticalPosition: 'top'
        });
      });

      this.loading = false;
    }).finally(() => {
      this.loading = false;
    });
  }
}
