import { writable, type Writable } from "svelte/store";

export const NOTIFICATIONS: Writable<Notification[]> = writable([]);

const NOTIFICATION_DURATION = 4000;

let UID_COUNTER = 0;
export class Notification {
  readonly uid: number = UID_COUNTER++;
  readonly message: string;
  readonly duration: number = NOTIFICATION_DURATION;

  constructor(message: string) {
    this.message = message;
  }
}

export function notify(message: string) {
  const notification = new Notification(message);
  NOTIFICATIONS.update(n => [...n, notification]);
  setTimeout(() => {
    NOTIFICATIONS.update(n => n.filter(n => n.uid !== notification.uid));
  }, NOTIFICATION_DURATION);
}

