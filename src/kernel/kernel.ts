import { MessagingBroker } from "./messaging/MessagingBroker";
import { ChannelsBroker } from "./channels/ChannelsBroker";
import { EndpointsBroker } from "./endpoints/EndpointsBroker";
import { ComputeBroker } from "./compute/ComputeBroker";
import { ApplicationsBroker } from "./applications/ApplicationsBroker";
import { LogBroker } from "./logging/LogBroker";
import { StoragesBroker } from "./storage/StoragesBroker";
import { IKernel } from "../shared/kernel/IKernel";

export class Kernel implements IKernel {
  production: boolean;
  started: boolean;
  applications: ApplicationsBroker;
  channels: ChannelsBroker;
  messaging: MessagingBroker;
  endpoints: EndpointsBroker;
  compute: ComputeBroker;
  logging: LogBroker;
  storage: StoragesBroker;
  constructor() {
    this.fullName = "kernel";
    this.production = process.env.NODE_ENV === "production";
    this.logging = new LogBroker(this);
    this.messaging = new MessagingBroker(this);
    this.compute = new ComputeBroker(this);
    this.channels = new ChannelsBroker(this);
    this.applications = new ApplicationsBroker(this);
    this.storage = new StoragesBroker(this);
    this.endpoints = new EndpointsBroker(this);
    this.started = false;
  }

  fullName: string;

  async run(): Promise<number> {
    await this.initialize();
    const rc = await this.listen();
    await this.shutdown();
    return rc;
  }

  askShutdown = async (): Promise<void> => {
    this.logging.output("DEBUG", "ask for shutdown");
    await new Promise<void>((resolve) => {
      this.started = false;
      setTimeout(() => {
        this.logging.output("DEBUG", "asked for shutdown");
        resolve();
      }, 100);
    });
  };

  async initialize(): Promise<void> {
    await this.storage.initialize();
    await this.compute.initialize();
    await this.channels.initialize();
    await this.endpoints.initialize();
    await this.applications.initialize();
    this.started = true;
  }

  private async listen(): Promise<number> {
    await this.channels.openAllInputs();
    await this.channels.openAllOutputs();
    return await this.applications.executeRootProcess();
  }

  async shutdown(): Promise<void> {
    this.started = false;
    await this.applications.shutdown();
    await this.endpoints.shutdown();
    await this.channels.shutdown();
    await this.compute.shutdown();
    await this.storage.shutdown();
  }
}
