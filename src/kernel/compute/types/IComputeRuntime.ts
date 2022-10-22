export interface IComputeDependency {
  name: string;
  version?: string;
}

export interface IComputeCommandDependency {
  name: string;
}

export interface IComputeSourceCode {
  name: string;
  extension: string;
  dependencies: IComputeDependency[];
  body: string;
  args?: string[];
}

export interface IComputeProjectCode {
  name: string;
  dependencies: IComputeDependency[];
  extensions: string[];
  path: string;
  entryPoint: string;
  args?: string[];
}

export interface IComputeExecuteResult {
  rc: number;
  output: string;
}

export interface IComputeRuntime {
  name: string;
  commandsDependencies: IComputeCommandDependency[];
  provision: () => Promise<boolean>;
  unprovision: () => Promise<boolean>;
  ensureCommandDependencies: () => Promise<void>;
  ensureDependencies: (deps: IComputeDependency[]) => Promise<void>;
  executeSource: (source: IComputeSourceCode) => Promise<IComputeExecuteResult>;
  executeProject: (
    project: IComputeProjectCode
  ) => Promise<IComputeExecuteResult>;
}
