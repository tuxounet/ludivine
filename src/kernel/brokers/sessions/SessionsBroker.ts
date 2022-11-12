import {
  bases,
  errors,
  logging,
  sessions,
  messaging,
  kernel,
} from "@ludivine/runtime";

import { Session } from "./Session";

export class SessionsBroker
  extends bases.KernelElement
  implements sessions.ISessionsBroker
{
  constructor(readonly kernel: kernel.IKernel) {
    super("sessions", kernel);
    this.sessions = new Map();
    this.messaging = this.kernel.container.get("messaging");
  }

  messaging: messaging.IMessagingBroker;

  sessions: Map<string, sessions.ISession>;

  @logging.logMethod()
  async initialize(): Promise<void> {
    await super.initialize();
  }

  @logging.logMethod()
  async shutdown(): Promise<void> {
    await super.shutdown();
  }

  @logging.logMethod()
  async begin(): Promise<string> {
    const id = "session-" + String(this.sessions.size + 1);
    const session = new Session(id, this);
    this.sessions.set(id, session);
    await session.initialize();

    return id;
  }

  @logging.logMethod()
  async get(id: string): Promise<sessions.ISession> {
    const instance = this.sessions.get(id);
    if (instance == null) {
      throw errors.BasicError.notFound(this.fullName, "get", id);
    }
    return instance;
  }

  @logging.logMethod()
  async terminate(id: string): Promise<boolean> {
    if (!this.sessions.has(id)) return false;
    const session = this.sessions.get(id);
    if (session == null) return false;

    await session.terminate();
    await session.shutdown();
    this.sessions.delete(id);
    return true;
  }
}
