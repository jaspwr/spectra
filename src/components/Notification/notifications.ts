/**
 * This file is part of Spectra.
 *
 * Spectra is free software: you can redistribute it and/or modify it
 * under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Spectra is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Spectra. If not, see <https://www.gnu.org/licenses/>.
 * */

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
  NOTIFICATIONS.update((n) => [...n, notification]);
  setTimeout(() => {
    NOTIFICATIONS.update((n) => n.filter((n) => n.uid !== notification.uid));
  }, NOTIFICATION_DURATION);
}
