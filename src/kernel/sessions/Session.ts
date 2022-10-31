import { bases, channels, sessions } from "@ludivine/runtime";

export class Session extends bases.KernelElement implements sessions.ISession {
  output = async (out: channels.IOutputMessage): Promise<void> => {
    this.log.info("out", out);
  };
  terminate = async () => {
    this.log.warn("terminate query ");
    return true;
  };
}
