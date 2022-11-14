import {
  bases,
  errors,
  modules,
  kernel,
  storage,
  compute,
  logging,
  config,
} from "@ludivine/runtime";

export class ModulesBroker
  extends bases.KernelElement
  implements modules.IModulesBroker
{
  constructor(readonly kernel: kernel.IKernel) {
    super("modules", kernel);
    this.modules = new Map();

    this.config = this.kernel.container.get("config");
    this.storage = this.kernel.container.get("storage");
    this.compute = this.kernel.container.get("compute");
  }

  storage: storage.IStorageBroker;
  config: config.IConfigBroker;
  compute: compute.IComputeBroker;

  modules: Map<string, modules.IRuntimeModule>;

  @logging.logMethod()
  async initialize(): Promise<void> {
    const modulesVolume = await this.storage.getVolume("modules");

    const setuped = await modulesVolume.fileSystem.existsFile("package.json");
    if (!setuped) {
      await this.compute.executeEval(
        "bash-local",
        "npm init -y",
        modulesVolume
      );
    }

    const defaultRequiredModules: modules.IRuntimeModuleSource[] = [
      {
        name: "@ludivine/endpoints-tui",
        upstream: "@ludivine/endpoints-tui",
      },
      {
        name: "@ludivine-apps/shell-natural",
        upstream: "@ludivine-apps/shell-natural",
      },
    ];
    const requiredModules = await this.config.get(
      "modules.requiredModules",
      defaultRequiredModules
    );

    for (const requiredModule of requiredModules) {
      const modulePresent = await this.findModule(requiredModule.name);
      if (modulePresent != null) continue;
      const module = await this.registerModule(requiredModule);
      this.modules.set(module.id, module);
    }

    await super.initialize();
  }

  @logging.logMethod()
  async shutdown(): Promise<void> {
    // cleanup npm context
    await super.shutdown();
  }

  @logging.logMethod()
  async findModule(name: string): Promise<modules.IRuntimeModule | undefined> {
    const modulesVolume = await this.storage.getVolume("modules");

    const pkgExists = await modulesVolume.fileSystem.existsFile("package.json");
    if (!pkgExists) {
      throw errors.BasicError.notFound(
        this.fullName,
        "findModule/package.json",
        name
      );
    }
    const pkgBody = await modulesVolume.fileSystem.readObjectFile(
      "package.json"
    );
    if (pkgBody.body == null) {
      throw errors.BasicError.notFound(
        this.fullName,
        "findModule/package.json/body",
        name
      );
    }
    const deps = pkgBody.body.dependencies as Record<string, string>;
    if (deps == null) return undefined;
    if (!Object.keys(deps).includes(name)) {
      return undefined;
    }
    const instance = this.modules.get(name);
    return instance;
  }

  @logging.logMethod()
  async registerModule(
    source: modules.IRuntimeModuleSource
  ): Promise<modules.IRuntimeModule> {
    const modulesVolume = await this.storage.getVolume("modules");
    const cmd = `npm install --save ${source.upstream}`;
    const result = await this.compute.executeEval(
      "bash-local",
      cmd,
      modulesVolume
    );
    if (result.rc !== 0) {
      throw errors.BasicError.badQuery(
        this.fullName,
        "registerModule/" + cmd,
        result.errors
      );
    }
    const modulePackagePath = modulesVolume.paths.combinePaths(
      "node_modules",
      source.name
    );

    const modulePackageJson = modulesVolume.paths.combinePaths(
      modulePackagePath,
      "package.json"
    );

    const modulePackageJsonObj = await modulesVolume.fileSystem.readObjectFile<
      Record<string, string>
    >(modulePackageJson);
    if (modulePackageJsonObj.body == null) {
      throw errors.BasicError.notFound(
        this.fullName,
        "registerModule/package.json/body",
        modulePackageJson
      );
    }

    const moduleEntryPoint = modulesVolume.paths.combinePaths(
      modulePackagePath,
      modulePackageJsonObj.body.main
    );

    let realModuleEntryPoint = await modulesVolume.fileSystem.getRealPath(
      moduleEntryPoint
    );

    //TODO: put it in "storage path provider => convertToUri"
    realModuleEntryPoint = realModuleEntryPoint.replace("\\", "/");
    realModuleEntryPoint = realModuleEntryPoint.replace(":", "");
    realModuleEntryPoint = "file://" + realModuleEntryPoint;
    this.log.trace(
      "loading external module",
      modulePackageJsonObj.body.name,
      "from",
      realModuleEntryPoint
    );
    const moduleDefinition = await import(realModuleEntryPoint);
    if (
      moduleDefinition.default === undefined ||
      moduleDefinition.default.default === undefined
    ) {
      throw errors.BasicError.notFound(
        this.fullName,
        "registerModule/default",
        moduleEntryPoint
      );
    }
    const definition = moduleDefinition.default.default;

    const module: modules.IRuntimeModule = {
      id: modulePackageJsonObj.body.name,
      source,
      definition,
    };

    this.modules.set(module.id, module);
    return module;
  }

  @logging.logMethod()
  async unregisterModule(id: string): Promise<boolean> {
    return false;
  }

  @logging.logMethod()
  async findApplicationDescriptor(
    name: string
  ): Promise<modules.IModuleApplicationDescriptor | undefined> {
    const result = Array.from(this.modules.values())
      .map((item) => item.definition.applications)
      .flat()
      .find((item) => item?.name === name);

    return result;
  }

  @logging.logMethod()
  async findEndpointsDescriptor(
    name: string
  ): Promise<modules.IModuleEndpointDescriptor | undefined> {
    const result = Array.from(this.modules.values())
      .map((item) => item.definition.endpoints)
      .flat()
      .find((item) => item?.name === name);

    return result;
  }
}
