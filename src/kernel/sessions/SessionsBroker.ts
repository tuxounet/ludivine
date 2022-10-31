import { bases, errors, kernel, logging, sessions } from "@ludivine/runtime";
import { Session } from "./Session";

export class SessionsBroker
  extends bases.KernelElement
  implements sessions.ISessionsBroker
{
  constructor(readonly kernel: kernel.IKernel) {
    super("sessions", kernel);
    this.sessions = new Map();
  }

  sessions: Map<string, sessions.ISession>;

  @logging.logMethod()
  async initialize(): Promise<void> {
    await super.initialize();
  }

  @logging.logMethod()
  async shutdown(): Promise<void> {
    await super.shutdown();
  }

  begin = async (): Promise<string> => {
    const id = "session-" + this.sessions.size + 1;
    const session = new Session(id, this.kernel, this);
    this.sessions.set(id, session);
    await session.initialize();
    await this.kernel.endpoints.openEndpoint(session, "cli");
    return id;
  };

  get = async (id: string): Promise<sessions.ISession> => {
    const instance = this.sessions.get(id);
    if (!instance) {
      throw errors.BasicError.notFound(this.fullName, "get", id);
    }
    return instance;
  };

  terminate = async (id: string): Promise<boolean> => {
    if (!this.sessions.has(id)) return false;
    const session = this.sessions.get(id);
    if (!session) return false;
    await this.kernel.endpoints.closeEndpoint(session.id);
    await session.terminate();
    await session.shutdown();
    this.sessions.delete(id);
    return true;
  };
}
