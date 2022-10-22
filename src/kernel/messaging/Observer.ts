import { IMessageEvent } from "./IMessageEvent";

export abstract class Observer {
  async onMessage?(messageEvent: IMessageEvent): Promise<void> {}
}
