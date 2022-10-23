import { IMessageEvent } from "../../shared/messaging/IMessageEvent";

export abstract class Observer {
  async onMessage?(messageEvent: IMessageEvent): Promise<void> {}
}
