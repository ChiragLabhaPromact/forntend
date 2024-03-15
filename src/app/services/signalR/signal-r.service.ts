import { Injectable } from '@angular/core';
import * as signalR from "@microsoft/signalr"
import { environment } from '../../../environments/environment';
import { MessageDto } from '../../model/chat';
import { Observable, Subject } from 'rxjs';
import { HttpTransportType } from "@microsoft/signalr";



@Injectable({
  providedIn: 'root'
})
export class SignalRService {

  private connection: any = new signalR.HubConnectionBuilder().withUrl(`${environment.base_url}/chat`, {
    transport: HttpTransportType.WebSockets,
        accessTokenFactory: () => {
          const token = localStorage.getItem('accessToken');
          return token || '';
        }
  })
    .configureLogging(signalR.LogLevel.Information)
    .build();

  private msgInboxArray: MessageDto[] = [];
  private sharedObj = new Subject<MessageDto>();;

  constructor() {
    this.connection.onclose(async () => {
    });
    this.connection.on("ReceiveOne", (message: any) => { this.mapReceivedMessage(message); });
    // this.connection.on("ReceiveEdited", (message: any) => { this.mapReceivedEditedMessage( message ); });
    // this.connection.on("ReceiveDeleted", (message: any) => { this.mapReceivedDeletedMessage( message ); });

    this.start();
  }

  public async start() {
    try {
      await this.connection.start();
      console.log("connected");
    } catch (err) {
      console.log(err);
      setTimeout(() => this.start(), 5000);
    }
  }

  private mapReceivedMessage(message: any): void {
    debugger;
    const receivedMessageObject: MessageDto = {
      id: message.id,
      senderId: message.senderId,
      ReceiverId: message.receiverId,
      content: message.content
    };

    this.sharedObj.next(receivedMessageObject);
  }

  public broadcastMessage(msgDto: any) {
    this.connection.invoke("SendMessage", msgDto).catch((err: any) => console.error(err));
  }

  public retrieveMappedObject(): Observable<MessageDto> {
    return this.sharedObj.asObservable();
  }
}
