import {
  kernel,
  sys,
  ioc,
  logging,
  applications,
  sessions,
  endpoints,
} from "@ludivine/runtime";
import { MessagingBroker } from "./brokers/messaging/MessagingBroker";
import { ComputeBroker } from "./brokers/compute/ComputeBroker";
import { ApplicationsBroker } from "./brokers/applications/ApplicationsBroker";
import { StoragesBroker } from "./brokers/storage/StoragesBroker";
import { LogsBroker } from "./brokers/logging/LogsBroker";
import { ModulesBroker } from "./brokers/modules/ModulesBroker";
import { EndpointsBroker } from "./brokers/endpoints/EndpointsBroker";
import { SessionsBroker } from "./brokers/sessions/SessionsBroker";
import { ConfigBroker } from "./brokers/config/ConfigBroker";

export class Kernel implements kernel.IKernel {
  production: boolean;
  started: boolean;
  readonly version: string;
  readonly nickname: string;
  container: ioc.Container;

  brokers: Map<string, kernel.IKernelBroker>;

  constructor(readonly options: kernel.IKernelOptions) {
    this.nickname = options.nickname != null ? options.nickname : "ludivine";
    const pkg = sys.files.readJSONFileSync(
      options.entryPoint,
      "..",
      "package.json"
    );
    this.version = pkg.version;

    this.production = process.env.NODE_ENV === "production";
    this.brokers = new Map();
    this.logs = new LogsBroker(this);
    this.container = new ioc.Container(this);
    this.started = false;
  }

  logs: LogsBroker;
  bootOrder = [
    "config",
    "storage",
    "logs",
    "compute",
    "messaging",
    "modules",
    "endpoints",
    "sessions",
    "applications",
  ];
  run = async (args: string[]): Promise<number> => {
    console.info(
      this.nickname,
      this.version,
      ">",
      "[",
      args.join(","),
      "]",
      "(",
      this.options.cwdFolder,
      ")"
    );

    await this.initialize();
    let rc = 0;
    if (args.length === 0) {
      rc = await this.endpoint();
    } else {
      rc = await this.eval(args.join(" "));
    }

    await this.shutdown();
    return rc;
  };

  askShutdown = async (): Promise<void> => {
    await new Promise<void>((resolve) => {
      this.started = false;
      setTimeout(() => {
        resolve();
      }, 100);
    });
  };

  async waitForShutdown(sender: string): Promise<void> {
    this.logs.output({
      level: logging.LogLevel.DEBUG,
      date: new Date().toISOString(),
      line: "waiting until end by " + sender,
      sender,
    });
    let loopinterval: NodeJS.Timer;
    await new Promise<void>((resolve) => {
      loopinterval = setInterval(() => {
        if (!this.started) {
          clearInterval(loopinterval);
          resolve();
        }
      }, 50);
    });
  }

  private async initialize(): Promise<void> {
    this.container.registerInstance("logs", this.logs);
    this.container.registerType("config", ConfigBroker, [this]);
    this.container.registerType("storage", StoragesBroker, [this]);
    this.container.registerType("compute", ComputeBroker, [this]);
    this.container.registerType("messaging", MessagingBroker, [this]);
    this.container.registerType("modules", ModulesBroker, [this]);
    this.container.registerType("endpoints", EndpointsBroker, [this]);
    this.container.registerType("sessions", SessionsBroker, [this]);
    this.container.registerType("applications", ApplicationsBroker, [this]);
    await this.container.initialize(this.bootOrder);

    this.started = true;
  }

  private async shutdown(): Promise<void> {
    this.started = false;
    await new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve();
      }, 100);
    });
    await this.container.shutdown(this.bootOrder);
  }

  private async endpoint(): Promise<number> {
    const endpoints =
      this.container.get<endpoints.IEndpointsBroker>("endpoints");
    const config = this.container.get<ConfigBroker>("config");
    const registeredEndpoint = await config.get("endpoints", []);

    await Promise.race(
      registeredEndpoint.map((endpoint) => endpoints.openEndpoint(endpoint))
    );
    await Promise.all(
      registeredEndpoint.map((endpoint) => endpoints.closeEndpoint(endpoint))
    );

    return 0;
  }

  private async eval(request: string): Promise<number> {
    const sessions = this.container.get<sessions.ISessionsBroker>("sessions");
    const sessionId = await sessions.begin();
    const session = await sessions.get(sessionId);
    const applications =
      this.container.get<applications.IApplicationsBroker>("applications");

    const result = await applications.eval(sessionId, request);
    await session.terminate();

    return result;
  }
}
