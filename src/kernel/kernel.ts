import { kernel, sys, ioc, logging, applications } from "@ludivine/runtime";
import { MessagingBroker } from "./brokers/messaging/MessagingBroker";
import { ComputeBroker } from "./brokers/compute/ComputeBroker";
import { ApplicationsBroker } from "./brokers/applications/ApplicationsBroker";
import { StoragesBroker } from "./brokers/storage/StoragesBroker";
import { InitialLogBroker } from "./brokers/logging/InitialLogBroker";
import { LogsBroker } from "./brokers/logging/LogsBroker";
import { ModulesBroker } from "./brokers/modules/ModulesBroker";
import { EndpointsBroker } from "./brokers/endpoints/EndpointsBroker";
import { SessionsBroker } from "./brokers/sessions/SessionsBroker";

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

  run = async (commandLine?: string[]): Promise<number> => {
    // Greetings
    console.info(
      this.nickname,
      this.version,
      ">",
      commandLine?.join(" "),
      "(",
      this.options.cwdFolder,
      ")"
    );

    // boot
    await this.initialize();
    const rc = await this.execute();
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

  private async initialize(): Promise<void> {
    this.container.registerType("storage", StoragesBroker, [this]);
    this.container.registerType("logs", LogsBroker, [this]);
    this.container.registerType("compute", ComputeBroker, [this]);
    this.container.registerType("messaging", MessagingBroker, [this]);
    this.container.registerType("modules", ModulesBroker, [this]);
    this.container.registerType("endpoints", EndpointsBroker, [this]);
    this.container.registerType("sessions", SessionsBroker, [this]);
    this.container.registerType("applications", ApplicationsBroker, [this]);

    const bootOrder = [
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

    await this.container.shutdown();
  }

  private async endpoint(): Promise<number> {
    return 0;
  }

  private async execute(): Promise<number> {
    // await this.channels.openAllInputs();
    // await this.channels.openAllOutputs();
    const applications =
      this.container.get<applications.IApplicationsBroker>("applications");
    return await applications.executeRootProcess();
  }
}
