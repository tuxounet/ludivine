import { bases, errors, kernel, modules } from "@ludivine/runtime";

export class ModulesBroker
  extends bases.KernelElement
  implements modules.IModulesBroker
{
  constructor(kernel: kernel.IKernel) {
    super("modules-broker", kernel);
    this.modules = new Map();
    this.requiredModules = [
      {
        name: "@ludivine-apps/shell-natural",
        upstream: "@ludivine-apps/shell-natural",
      },
    ];
  }

  modules: Map<string, modules.IRuntimeModule>;

  requiredModules: modules.IRuntimeModuleSource[];

  async initialize(): Promise<void> {
    const modulesVolume = await this.kernel.storage.getVolume("modules");

    const setuped = await modulesVolume.fileSystem.existsFile("package.json");
    if (!setuped) {
      await this.kernel.compute.executeEval(
        "bash-local",
        "npm init -y",
        modulesVolume
      );
    }

    for (const requiredModule of this.requiredModules) {
      const modulePresent = await this.findModule(requiredModule.name);
      if (modulePresent != null) continue;
      const module = await this.registerModule(requiredModule);
      this.modules.set(module.id, module);
    }

    await super.initialize();
  }

  async shutdown(): Promise<void> {
    // cleanup npm context
    await super.shutdown();
  }

  findModule = async (
    name: string
  ): Promise<modules.IRuntimeModule | undefined> => {
    const modulesVolume = await this.kernel.storage.getVolume("modules");

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
  };

  registerModule = async (
    source: modules.IRuntimeModuleSource
  ): Promise<modules.IRuntimeModule> => {
    const modulesVolume = await this.kernel.storage.getVolume("modules");
    const cmd = `npm install --save ${source.upstream}`;
    const result = await this.kernel.compute.executeEval(
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

    const realModuleEntryPoint = await modulesVolume.fileSystem.getRealPath(
      moduleEntryPoint
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
  };

  unregisterModule = async (id: string): Promise<boolean> => {
    return false;
  };
}
