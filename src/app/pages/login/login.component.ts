import { Component } from '@angular/core';
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { error } from 'console';
import { login } from '../../model/user';
import { AlertsToasterService } from '../../alerts-toaster/alerts-toaster.service';
import { SocialAuthService, SocialUser } from '@abacritt/angularx-social-login';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  user: SocialUser | null = null;
  loginForm!: FormGroup;
  loggedIn: boolean = false;

  constructor(private formBuilder: FormBuilder,
    private userService: UserService,
    private router: Router,
    private alert: AlertsToasterService,
    private authService: SocialAuthService

  ) { }

  ngOnInit(): void {
    this.initializeForm();
    this.authService.authState.subscribe((user) => {
      this.user = user
      this.googleTokenVerifier(this.user.idToken);
    })
  }

  initializeForm() {
    this.loginForm = this.formBuilder.group({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required, Validators.minLength(6)])
    })
  }

  getControl(name: any): AbstractControl | null {
    return this.loginForm.get(name);
  }

  navigatePage() {
    this.router.navigateByUrl("/register");
  }

  login(data: login) {
    this.userService.postData("login", data).subscribe({
      next: response => {
        localStorage.setItem("accessToken", response.token);
        this.router.navigateByUrl("/chat");
      },
      error: error => {
        if (error instanceof HttpErrorResponse) {
          const errorMessage = error.error;
          this.alert.error(errorMessage);
        }
      }
    })
  }

  googleTokenVerifier(token: string) {
    let body = {
      "token": token
    }
    this.userService.postData("SocialLogin", body).subscribe({
      next: response => {
        localStorage.setItem("accessToken", response.token);
        this.router.navigateByUrl("/chat");
      }, error: error => {
        if (error instanceof HttpErrorResponse) {
          const errorMessage = error.error;
          this.alert.error(errorMessage);
        }
      }
    })
  }

}
