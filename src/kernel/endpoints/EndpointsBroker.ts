import { bases, kernel, endpoints, sessions, errors } from "@ludivine/runtime";
import { CliEndpoint } from "./cli/CliEndpoint";

export class EndpointsBroker
  extends bases.KernelElement
  implements endpoints.IEndpointsBroker
{
  constructor(readonly kernel: kernel.IKernel) {
    super("endpoints-broker", kernel);
    this.providers = new Map();
    this.providers.set("cli", (session) => new CliEndpoint(session, this));
    this.sessions = new Map();
  }

  providers: Map<string, (session: sessions.ISession) => endpoints.IEndpoint>;

  sessions: Map<string, endpoints.IEndpoint>;

  async openEndpoint(session: sessions.ISession, type: string): Promise<void> {
    const provider = this.providers.get(type);
    if (provider == null) {
      throw errors.BasicError.notFound(
        this.fullName,
        "openEndpoint/provider",
        type
      );
    }

    const endpointSession = provider(session);

    this.sessions.set(session.id, endpointSession);
  }

  async closeEndpoint(session: string): Promise<void> {}

  async get(session: string): Promise<endpoints.IEndpoint> {
    const endpoint = this.sessions.get(session);
    if (endpoint == null) {
      throw errors.BasicError.notFound(this.fullName, "get/session", session);
    }
    return endpoint;
  }

  async initialize(): Promise<void> {}

  async shutdown(): Promise<void> {}
}
