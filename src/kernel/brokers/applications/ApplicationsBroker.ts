import { InterpreterApp } from "../../../apps/InterpreterApp";
import {
  bases,
  applications,
  modules,
  errors,
  sessions,
  messaging,
  logging,
} from "@ludivine/runtime";
import type { kernel } from "@ludivine/runtime";

export class ApplicationsBroker
  extends bases.KernelElement
  implements applications.IApplicationsBroker
{
  constructor(readonly kernel: kernel.IKernel) {
    super("applications", kernel);
    this.applications = new Map();
    this.sessions = this.kernel.container.get("sessions");
    this.modules = this.kernel.container.get("modules");
    this.messaging = this.kernel.container.get("messaging");
  }

  readonly sessions: sessions.ISessionsBroker;
  readonly modules: modules.IModulesBroker;
  readonly messaging: messaging.IMessagingBroker;

  readonly applications: Map<string, applications.IAppElement>;

  @logging.logMethod()
  async initialize(): Promise<void> {
    await super.initialize();
  }

  @logging.logMethod()
  async shutdown(): Promise<void> {
    await new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve();
      }, 100);
    });
    await super.shutdown();
  }

  @logging.logMethod()
  async eval(sessionId: string, request: string): Promise<number> {
    const session = await this.sessions.get(sessionId);

    const interpreterApp = new InterpreterApp(session, request);
    this.applications.set(interpreterApp.fullName, interpreterApp);

    const result = await interpreterApp.execute();
    this.applications.delete(interpreterApp.fullName);
    return result;
  }

  @logging.logMethod()
  async launchApplication(sessionId: string, name: string): Promise<number> {
    const session = await this.sessions.get(sessionId);

    const descriptor = await this.modules.findApplicationDescriptor(name);
    if (descriptor == null) {
      throw errors.BasicError.notFound(
        this.fullName,
        "launchApplication/descriptor",
        name
      );
    }

    const app: applications.IAppElement = descriptor.ctor(session);
    const key = app.fullName;
    this.applications.set(key, app);

    return await app
      .execute()
      .then((rc) => {
        this.applications.delete(key);
        return rc;
      })
      .catch((e) => {
        this.log.error("application failed", descriptor.name, e);
        this.applications.delete(key);
        throw errors.BasicError.badQuery(
          app.fullName,
          "application failed",
          descriptor.name
        );
      });
  }
}
