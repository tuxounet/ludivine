import {
  bases,
  endpoints,
  errors,
  kernel,
  messaging,
  logging,
  modules,
} from "@ludivine/runtime";

export class EndpointsBroker
  extends bases.KernelElement
  implements endpoints.IEndpointsBroker
{
  constructor(readonly kernel: kernel.IKernel) {
    super("endpoints", kernel);

    this.endpoints = new Map();
    this.messaging = this.kernel.container.get("messaging");
    this.modules = this.kernel.container.get("modules");
  }

  messaging: messaging.IMessagingBroker;
  modules: modules.IModulesBroker;
  endpoints: Map<string, endpoints.IEndpoint>;

  @logging.logMethod()
  async openEndpoint(name: string): Promise<void> {
    if (this.endpoints.has(name)) {
      await this.closeEndpoint(name);
    }

    const descriptor = await this.modules.findEndpointsDescriptor(name);
    if (descriptor == null) {
      throw errors.BasicError.notFound(
        this.fullName,
        "openEndpoint/descriptor",
        name
      );
    }
    const endpoint = descriptor.ctor(this);
    await endpoint.initialize();
    this.endpoints.set(name, endpoint);
    await endpoint.listenAPI();
    await endpoint.renderUI();
  }

  @logging.logMethod()
  async closeEndpoint(name: string): Promise<void> {}

  @logging.logMethod()
  async get(name: string): Promise<endpoints.IEndpoint> {
    const endpoint = this.endpoints.get(name);
    if (endpoint == null) {
      throw errors.BasicError.notFound(this.fullName, "get", name);
    }
    return endpoint;
  }
}
