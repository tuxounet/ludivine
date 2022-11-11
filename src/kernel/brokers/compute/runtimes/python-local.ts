import { bases, storage } from "@ludivine/runtime";
import { ComputeBroker } from "../ComputeBroker";

export class ComputeRuntimePython extends bases.ComputeRuntimeElement {
  constructor(readonly parent: ComputeBroker) {
    super("python-local", "python3", "-c", parent.kernel, parent);
    this.commandsDependencies = [
      {
        name: "python3",
      },
      {
        name: "pip",
      },
    ];
  }

  protected async installPackage(
    name: string,
    runVolume: storage.IStorageVolume
  ): Promise<number> {
    const result = await this.parent.executeEval(
      "bash-local",
      `pip install ${name}`,
      runVolume
    );
    return result.rc;
  }
}
