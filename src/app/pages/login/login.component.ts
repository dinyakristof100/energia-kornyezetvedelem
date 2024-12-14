import {Component, OnInit} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {TranslateService} from "@ngx-translate/core";
import {AuthService} from "../../shared/services/auth.service";
import {Router} from "@angular/router";

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
    private router: Router
    ) {
    this.loginForm = this.fb.group({
      email: ['', Validators.required],
      password: ['', Validators.required]
    });

    this.translate.setDefaultLang('hu');
    this.translate.use('hu');
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
      console.log(cred);
      this.router.navigateByUrl('/main');
      this.loading = false;
    }).catch(error =>{
      console.error(error);
      this.loading = false;
    })
  }
}
