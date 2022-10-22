import { KernelElement } from "./bases/KernelElement";
import { MessagingBroker } from "./messaging/MessagingBroker";
import { ChannelsBroker } from "./channels/ChannelsBroker";
import { EndpointsBroker } from "./endpoints/EndpointsBroker";
import { ComputeBroker } from "./compute/ComputeBroker";
import { ApplicationsBroker } from "./applications/ApplicationsBroker";
import { LogBroker } from "./logging/LogBroker";

export class Kernel extends KernelElement {
  production: boolean;
  started: boolean;
  applications: ApplicationsBroker;
  channels: ChannelsBroker;
  messaging: MessagingBroker;
  endpoints: EndpointsBroker;
  compute: ComputeBroker;
  logging: LogBroker;
  constructor() {
    super("kernel");
    this.production = process.env.NODE_ENV === "production";
    this.logging = new LogBroker(this);
    this.messaging = new MessagingBroker(this);
    this.compute = new ComputeBroker(this);
    this.channels = new ChannelsBroker(this);
    this.applications = new ApplicationsBroker(this);

    this.endpoints = new EndpointsBroker(this);
    this.started = false;
  }

  async run() {
    await this.start();
    const rc = await this.listen();
    await this.stop();
    return rc;
  }

  askShutdown = async () => {
    this.log.debug("ask for shutdown");
    await new Promise<void>((resolve) => {
      this.started = false;
      setTimeout(() => {
        resolve();
      }, 100);
    });
    this.log.debug("asked for shutdown");
  };

  private async start() {
    await this.compute.initialize();
    await this.channels.initialize();
    await this.applications.initialize();

    this.started = true;
  }

  private async listen() {
    await this.endpoints.openEndpoints();
    await this.channels.openAllInputs();
    await this.channels.openAllOutputs();
    return await this.applications.executeRootProcess();
  }

  private async stop() {
    this.started = false;
    await this.applications.shutdown();
    await this.channels.closeAllInputs();
    await this.channels.closeAllOutputs();
    await this.endpoints.closeEndpoints();
    await this.compute.shutdown();
  }

  async output(message: string) {
    await this.channels.outputOnAll(message);
  }
}
