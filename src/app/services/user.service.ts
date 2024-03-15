import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private httpService: HttpService) {}

  getData(url: string): Observable<any> {
    return this.httpService.get(url);
  }
  
  postData(url: string, data: any): Observable<any> {
    return this.httpService.post(url, data);
  }
  
  changeData(url: string, data: any): Observable<any> {
    return this.httpService.put(url, data);
  }

  deleteData(url: string): Observable<any> {
    return this.httpService.delete(url);
  }
}
