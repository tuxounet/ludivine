export type IOutputMessageType = "message" | "object";
export interface IOutputMessage {
  type: IOutputMessageType;
  body: string;
}
