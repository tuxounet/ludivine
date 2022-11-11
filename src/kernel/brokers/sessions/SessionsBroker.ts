import {
  bases,
  errors,
  logging,
  sessions,
  endpoints,
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
    this.endpoints = this.kernel.container.get("endpoints");
    this.messaging = this.kernel.container.get("messaging");
  }

  endpoints: endpoints.IEndpointsBroker;

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

  begin = async (): Promise<string> => {
    const id = "session-" + String(this.sessions.size + 1);
    const session = new Session(id, this);
    this.sessions.set(id, session);
    await session.initialize();
    await this.endpoints.openEndpoint(session, "cli");
    return id;
  };

  get = async (id: string): Promise<sessions.ISession> => {
    const instance = this.sessions.get(id);
    if (instance == null) {
      throw errors.BasicError.notFound(this.fullName, "get", id);
    }
    return instance;
  };

  terminate = async (id: string): Promise<boolean> => {
    if (!this.sessions.has(id)) return false;
    const session = this.sessions.get(id);
    if (session == null) return false;
    await this.endpoints.closeEndpoint(session.id);
    await session.terminate();
    await session.shutdown();
    this.sessions.delete(id);
    return true;
  };
}
