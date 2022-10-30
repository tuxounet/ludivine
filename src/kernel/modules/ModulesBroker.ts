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
        upstream: "../../ludivine-apps-shell-natural",
      },
    ];
  }
  modules: Map<string, modules.IRuntimeModule>;

  requiredModules: modules.IRuntimeModuleSource[];

  async initialize(): Promise<void> {
    const modulesVolume = await this.kernel.storage.getVolume("modules");
    const modulesPath = await modulesVolume.fileSystem.getRealPath(".");
    //prepare npm context
    this.log.error(
      "pwd",
      process.cwd(),
      "source",
      __dirname,
      "modules",
      modulesPath
    );

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
      if (modulePresent) continue;
      const module = await this.registerModule(requiredModule);
      this.modules.set(module.id, module);
    }

    await super.initialize();
  }

  async shutdown(): Promise<void> {
    //cleanup npm context
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
    if (!pkgBody.body) {
      throw errors.BasicError.notFound(
        this.fullName,
        "findModule/package.json/body",
        name
      );
    }
    const deps = pkgBody.body.dependencies as Record<string, string>;
    if (!deps || !Object.keys(deps).includes(name)) {
      return undefined;
    }
    const instance = this.modules.get(name);
    return instance;
  };

  registerModule = async (
    source: modules.IRuntimeModuleSource
  ): Promise<modules.IRuntimeModule> => {
    const modulesVolume = await this.kernel.storage.getVolume("modules");

    const result = await this.kernel.compute.executeEval(
      "bash-local",
      `npm install --save ${source.upstream}`,
      modulesVolume
    );

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
    if (!modulePackageJsonObj.body) {
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

    const moduleDefinition = require(realModuleEntryPoint);
    if (moduleDefinition["default"] === undefined) {
      throw errors.BasicError.notFound(
        this.fullName,
        "registerModule/default",
        moduleEntryPoint
      );
    }
    const module: modules.IRuntimeModule = {
      id: modulePackageJsonObj.body.name,
      source: source,
      definition: moduleDefinition["default"],
    };
    console.dir(module);
    this.modules.set(module.id, module);
    return module;
  };

  unregisterModule = async (id: string): Promise<boolean> => {
    return false;
  };
}
