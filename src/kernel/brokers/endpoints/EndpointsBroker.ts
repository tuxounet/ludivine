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

    const descriptor = await this.findEndpointsDescriptor(name);
    if (!descriptor) {
      throw errors.BasicError.notFound(
        this.fullName,
        "openEndpoint/descriptor",
        name
      );
    }
    const endpoint = descriptor.ctor(this);
    await endpoint.initialize();
    this.endpoints.set(name, endpoint);

    const endpointProms = [
      endpoint.renderUI(),
      endpoint.listenAPI(),
      this.kernel.waitForShutdown(this.fullName),
    ];

    await Promise.race(endpointProms);
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

  private readonly findEndpointsDescriptor = async (
    name: string
  ): Promise<modules.IModuleEndpointDescriptor | undefined> => {
    const result = Array.from(this.modules.modules.values())
      .map((item) => item.definition.endpoints)
      .flat()
      .find((item) => item?.name === name);

    return result;
  };
}