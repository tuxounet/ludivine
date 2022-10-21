export interface IMessageEvent {
  date: string;
  sender: string;
  recipient: string;
  body: Record<string, string>;
}
