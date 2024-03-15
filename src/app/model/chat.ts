export interface sendMessage {
    message: string
}

// export interface MessageDto {
//     id: string;
//     senderId?: string;
//     ReceiverId: string;
//     content: string;
// }  

export class MessageDto {
    id: string;
    senderId?: string;
    ReceiverId: string;
    content: string;
  
    constructor() {
      this.senderId = '';
      this.ReceiverId = '';
      this.content = '';
      this.id = '';
    }
  }