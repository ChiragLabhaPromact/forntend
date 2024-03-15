import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { register } from '../../model/user';
import { AlertsToasterService } from '../../alerts-toaster/alerts-toaster.service';
import { SocialAuthService, SocialUser } from '@abacritt/angularx-social-login';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent implements OnInit {

  registerForm!: FormGroup;
  loggedIn: boolean = false;
  user: SocialUser | null = null;

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
    this.registerForm = this.formBuilder.group({
      name: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required, Validators.minLength(6)])
    })
  }

  getControl(name: any): AbstractControl | null {
    return this.registerForm.get(name);
  }

  registration(data: register) {
    this.userService.postData('register', data).subscribe({
      next: response => {
        this.alert.success("You have successfully registered");
        this.router.navigateByUrl('/login');
      }, error: error => {
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
      next: response =>  {
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
