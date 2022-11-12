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
import { InitialLogBroker } from "./brokers/logging/InitialLogBroker";
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
    this.logs = new InitialLogBroker(this);
    this.container = new ioc.Container(this);
    this.started = false;
  }

  logs: logging.ILogsBroker;

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
      sender: sender,
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
    this.container.registerType("config", ConfigBroker, [this]);
    this.container.registerType("storage", StoragesBroker, [this]);
    this.container.registerType("logs", LogsBroker, [this]);
    this.container.registerType("compute", ComputeBroker, [this]);
    this.container.registerType("messaging", MessagingBroker, [this]);
    this.container.registerType("modules", ModulesBroker, [this]);
    this.container.registerType("endpoints", EndpointsBroker, [this]);
    this.container.registerType("sessions", SessionsBroker, [this]);
    this.container.registerType("applications", ApplicationsBroker, [this]);

    const bootOrder = [
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
    await this.container.initialize(bootOrder);

    this.started = true;
  }
  private async shutdown(): Promise<void> {
    this.started = false;
    await new Promise<void>((resolve) => {
      setTimeout(() => {
        resolve();
      }, 100);
    });
    await this.container.shutdown();
  }

  private async endpoint(): Promise<number> {
    const endpoints =
      this.container.get<endpoints.IEndpointsBroker>("endpoints");
    await endpoints.openEndpoint("tui");
    await endpoints.closeEndpoint("tui");
    return 0;
  }

  private async eval(request: string): Promise<number> {
    const sessions = this.container.get<sessions.ISessionsBroker>("sessions");
    const sessionId = await sessions.begin();
    const applications =
      this.container.get<applications.IApplicationsBroker>("applications");

    const result = await applications.eval(sessionId, request);

    await sessions.terminate(sessionId);
    return result;
  }
}
