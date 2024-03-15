import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { DatePipe } from '@angular/common';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { jwtDecode } from "jwt-decode";
import { HttpErrorResponse } from '@angular/common/http';
import { AlertsToasterService } from '../../alerts-toaster/alerts-toaster.service';
import { MessageDto, sendMessage } from '../../model/chat';
import { SignalRService } from '../../services/signalR/signal-r.service';

@Component({
  selector: 'app-conversation',
  templateUrl: './conversation.component.html',
  styleUrl: './conversation.component.css'
})
export class ConversationComponent implements OnInit {

  before!: string | null;
  currentId!: string;
  userId!: string
  userName!: string
  sendMessageForm!: FormGroup
  displyMessage: string = ''
  msgInboxArray: MessageDto[] = [];
  users: string = '';
  editMessageId: string = '';
  messageEdit: boolean = false;
  selectedMessageId: string | null = '';
  isDropdownOpen: boolean = false;
  allMessages: any[] = [];
  msgDto: MessageDto = new MessageDto();

  constructor(private userService: UserService,
    private datePipe: DatePipe,
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private alert: AlertsToasterService,
    private signalR: SignalRService,
  ) { }

  ngOnInit(): void {
    const currentDate = new Date();
    this.before = this.datePipe.transform(currentDate, 'dd/MM/yyyy HH:mm');
    this.route.params.subscribe(params => {
      this.currentId = params['id'];
      this.getUser(this.currentId);
      this.getMessage(this.currentId);
    });
    this.signalR.retrieveMappedObject().subscribe((receivedObj: MessageDto) => {
      this.addToInbox(receivedObj);
    })
    this.initializeForm();
  }

  initializeForm() {
    this.sendMessageForm = this.formBuilder.group({
      message: new FormControl('', [Validators.required]),
    })
  }

  getControl(name: any): AbstractControl | null {
    return this.sendMessageForm.get(name);
  }

  getUser(id: string) {
    this.userService.getData(`users/${id}`).subscribe({
      next: response => {
        this.users = response.name;
      },
      error: error => {
        if (error instanceof HttpErrorResponse) {
          const errorMessage = error.error;
          this.alert.error(errorMessage);
        }
      }
    })

    const token = localStorage.getItem('accessToken');

    if (!token) {
      console.error('JWT Token not found in local storage');
      return;
    }

    const decoded: any = jwtDecode(token);
    this.userId = decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];
    this.userName = decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'];
  }

  getMessage(id: string) {
    this.msgInboxArray = [];
    this.userService.getData(`Message/${id}`).subscribe({
      next: response => {
        this.msgInboxArray = response
      },
      error: error => {
        if (error instanceof HttpErrorResponse) {
          const errorMessage = error.error;
          this.alert.error(errorMessage);
        }
      }
    })
  }

  sendMessages(data: sendMessage) {
    console.log(data);


    let body = {
      "content": data.message,
      "receiverId": this.currentId
    }

    this.userService.postData("message", body).subscribe({
      next: response => {        
        this.addToInbox(response)
        this.msgDto = {
          content: response.content,
          ReceiverId: response.receiverId,
          id: response.messageId,
        }
        this.signalR.broadcastMessage(this.msgDto);
        
      },
      error: error => {
        if (error instanceof HttpErrorResponse) {
          const errorMessage = error.error;
          this.alert.error(errorMessage);
        }
      }
    })
    this.sendMessageForm.reset();
  }

  showDropdown(messageId: string) {
    this.isDropdownOpen = !this.isDropdownOpen;
    this.selectedMessageId = this.selectedMessageId === messageId ? null : messageId;
  }

  editMessage(message: MessageDto) {
    this.displyMessage = message.content;
    this.editMessageId = message.id;
    this.messageEdit = true;
  }

  saveMessage(event: any, messageId: string) {
    event.preventDefault();

    let body = {
      "content": this.displyMessage
    }

    this.userService.changeData(`Message/${messageId}`, body).subscribe({
      next: response => {
        const editedMessageIndex = this.msgInboxArray.findIndex(msg => msg.id == response.id);
        if (editedMessageIndex !== -1) {
          this.msgInboxArray[editedMessageIndex].content = response.content;
        }
        this.alert.success("Message Edited Successfully");
        this.messageEdit = false
      },
      error: error => {
        if (error instanceof HttpErrorResponse) {
          const errorMessage = error.error;
          this.alert.error(errorMessage);
        }
      }
    })
  }

  deleteMessage(messageId: string) {
    const isConfirmed = confirm("Are you sure you want to delete this message?");
    if (isConfirmed) {
      this.userService.deleteData(`Message/${messageId}`).subscribe({
        next: response => {
          const editedMessageIndex = this.msgInboxArray.findIndex(msg => msg.id == messageId);
          if (editedMessageIndex !== -1) {
            this.msgInboxArray.splice(editedMessageIndex, 1);
          }
          this.alert.success("Message Deleted Successfully");
        },
        error: error => {
          if (error instanceof HttpErrorResponse) {
            const errorMessage = error.error;
            this.alert.error(errorMessage);
          }
        }
      })
    }
  }

  cancelEdit(event: any) {
    event.preventDefault();
    this.messageEdit = false
  }

  addToInbox(obj: MessageDto) {
    const messageExists = this.msgInboxArray.some((message) => message.id === obj.id);
    if (!messageExists) {
      this.msgInboxArray.push(obj);
      this.allMessages = this.msgInboxArray.filter(
        (message) => message.senderId === this.userId || message.ReceiverId === this.userId
      );
    }
  }
}
