import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { error } from 'console';
import { GetUser } from '../../model/user';
import { AlertsToasterService } from '../../alerts-toaster/alerts-toaster.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css'
})
export class ChatComponent {
  users: GetUser[] = [];
  serchForm!: FormGroup
  searchResult = false;

  constructor(private userService: UserService,
    private formBuilder: FormBuilder,
    private router: Router,
    private alert: AlertsToasterService
  ) { }

  ngOnInit(): void {
    this.getUserList();
    this.initializeForm();
  }

  initializeForm() {
    this.serchForm = this.formBuilder.group({
      search: new FormControl('', [Validators.required]),
    })
  }

  getControl(name: any): AbstractControl | null {
    return this.serchForm.get(name);
  }

  getUserList() {
    this.userService.getData("users").subscribe({
      next: response => {
        this.users = response;
      }, error: error => {
        if (error instanceof HttpErrorResponse) {
          const errorMessage = error.error;
          if (errorMessage === undefined) {
            this.alert.error("unauthorized access");
            this.router.navigateByUrl("/login");
          } else {
            this.alert.error(errorMessage);
          }
        }
      }
    })
  }

  showMessage(id: any) {
    this.router.navigate(['/chat', { outlets: { childPopup: ['user', id] } }]);
  }

}
