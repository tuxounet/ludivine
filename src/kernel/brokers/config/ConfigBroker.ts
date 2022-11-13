import { bases, logging, kernel, config, sys } from "@ludivine/runtime";

export class ConfigBroker
  extends bases.KernelElement
  implements config.IConfigBroker
{
  constructor(readonly kernel: kernel.IKernel) {
    super("config", kernel);
    this.entries = new Map();
  }

  private entries: Map<string, unknown>;

  @logging.logMethod()
  async initialize(): Promise<void> {
    await this.load();
    await super.initialize();
  }

  @logging.logMethod()
  async shutdown(): Promise<void> {
    await this.persist();
    await super.shutdown();
  }

  @logging.logMethod()
  async load(): Promise<void> {
    const configFile = ["run", "ludivine.json"];

    const confExists = await sys.files.existsFile(...configFile);
    if (!confExists) {
      return;
    }

    const currentEntries = await sys.files.readJSONFile<
      Record<string, unknown>
    >(...configFile);

    this.entries = new Map();
    Object.keys(currentEntries).forEach((key) =>
      this.entries.set(key, currentEntries[key])
    );
  }

  @logging.logMethod()
  async persist(): Promise<void> {
    const configFile = ["run", "ludivine.json"];

    const configMap: Record<string, unknown> = {};
    this.entries.forEach((value, key) => {
      configMap[key] = value;
    });

    await sys.files.writeJSONFile(configMap, ...configFile);
  }

  @logging.logMethod()
  async get<T = string>(key: string, defaultValue: T): Promise<T> {
    if (!this.entries.has(key)) {
      this.entries.set(key, defaultValue);
      return defaultValue;
    }
    const value = this.entries.get(key);
    if (value === undefined) {
      this.entries.set(key, defaultValue);
      return defaultValue;
    }
    return value as T;
  }

  @logging.logMethod()
  async has(key: string): Promise<boolean> {
    return this.entries.has(key);
  }

  @logging.logMethod()
  async set<T = string>(key: string, value: T): Promise<void> {
    this.entries.set(key, value);
    await this.persist();
  }
}
