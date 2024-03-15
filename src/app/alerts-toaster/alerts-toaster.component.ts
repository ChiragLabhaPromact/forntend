import { Component } from '@angular/core';
import { AlertsToasterService, NotificationType, Notification } from './alerts-toaster.service';

@Component({
  selector: 'app-alerts-toaster',
  templateUrl: './alerts-toaster.component.html',
  styleUrl: './alerts-toaster.component.css'
})
export class AlertsToasterComponent {
  notifications: Notification[] = [];

  constructor(public alertsToasterService: AlertsToasterService) { }

  ngOnInit() {
    this.alertsToasterService.getAlert().subscribe((alert: Notification) => {
      this.notifications = [];
      if (!alert) {
        this.notifications = [];
        return;
      }
      this.notifications.push(alert);
      setTimeout(() => {
        this.notifications = this.notifications.filter(x => x !== alert);
      }, 3000);
    });
  }

  removeNotification(notification: Notification) {
    this.notifications = this.notifications.filter(x => x !== notification);
  }

  /**Set css class for Alert -- Called from alert component**/
  cssClass(notification: Notification) {
    if (!notification) {
      return;
    }
    switch (notification.type) {
      case NotificationType.Success:
        return 'toast-success';
      case NotificationType.Error:
        return 'toast-error';
      case NotificationType.Info:
        return 'toast-info';
      case NotificationType.Warning:
        return 'toast-warning';
    }
  }
}
