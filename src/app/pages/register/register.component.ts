import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../shared/services/auth.service';
import { Router } from '@angular/router';
import {User} from "../../shared/model/models";
import {UserService} from "../../shared/services/user.service";

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
  registerForm: FormGroup;
  hidePassword = true;
  hideConfirmPassword = true;
  loading = true;


  constructor(
    private fb: FormBuilder,
    private translate: TranslateService,
    private authService: AuthService,
    private router: Router,
    private userService: UserService
  ) {
    this.registerForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      admin: [false]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  ngOnInit(): void {}

  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.hideConfirmPassword = !this.hideConfirmPassword;
  }

  changeLanguage(lang: string): void {
    this.translate.use(lang);
  }

  passwordMatchValidator(group: FormGroup): { [key: string]: boolean } | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  onSubmit(): void {
    const email = this.registerForm?.get('email')?.value.toString() || '';
    const password = this.registerForm?.get('password')?.value.toString()  || '';
    const firstName = this.registerForm?.get('firstName')?.value.toString() || '';
    const lastName = this.registerForm?.get('lastName')?.value.toString() || '';

    this.authService.signup(email, password)
      .then(cred => {
        console.log(cred);
        const user: User = {
          id: cred.user?.uid as string,
          email: email,
          nev:{
            vezeteknev: firstName,
            keresztnev: lastName
          },
          username: email.split('@')[0],
          admin: false
        }

        this.userService.create(user).then(_ =>{
          console.log("User added succesfully!");
        }).catch(error =>{
          console.error(error);
        })

        this.router.navigateByUrl('/main');
        this.loading = false;
      })
      .catch(error => {
        console.error(error);
        this.loading = false;
      });
  }
}
