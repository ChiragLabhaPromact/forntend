import { Injectable } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AlertsToasterService {

  public subject = new Subject<Notification | null>();
  public keepAfterRouteChange = true;

  constructor(public router: Router) {
    router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        if (this.keepAfterRouteChange) {
          this.keepAfterRouteChange = false;
        } else {
          this.clear();
        }
      }
    });
  }

  getAlert(): Observable<any> {
    return this.subject.asObservable();
  }

  success(message: string, keepAfterRouteChange = true) {
    this.showNotification(NotificationType.Success, message, keepAfterRouteChange);
  }

  error(message: string, keepAfterRouteChange = true) {
    this.showNotification(NotificationType.Error, message, keepAfterRouteChange);
  }

  info(message: string, keepAfterRouteChange = true) {
    this.showNotification(NotificationType.Info, message, keepAfterRouteChange);
  }

  warn(message: string, keepAfterRouteChange = true) {
    this.showNotification(NotificationType.Warning, message, keepAfterRouteChange);
  }

  showNotification(type: NotificationType, message: string, keepAfterRouteChange = true) {
    this.keepAfterRouteChange = keepAfterRouteChange;
    this.subject.next(<Notification>{ type: type, message: message });
  }

  clear() {
    this.subject.next(null);
  }
}

export class Notification {
  type!: NotificationType;
  message!: string;
}
export enum NotificationType {
  Success,
  Error,
  Info,
  Warning
}
