import {Component, OnInit} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {TranslateService} from "@ngx-translate/core";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  hide = true;

  constructor(
    private fb: FormBuilder,
    private translate: TranslateService
    ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });

    this.translate.setDefaultLang('hu');
    this.translate.use('hu');
  }

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  togglePasswordVisibility(): void {
    this.hide = !this.hide;
  }

  changeLanguage(lang: string): void {
    this.translate.use(lang);
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      console.log('Bejelentkezési adatok:', this.loginForm.value);
      // API hívás itt
    } else {
      console.log('A form nem érvényes.');
    }
  }
}
