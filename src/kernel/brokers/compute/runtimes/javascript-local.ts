import { bases, storage } from "@ludivine/runtime";
import { ComputeBroker } from "../ComputeBroker";

export class ComputeRuntimeJavascript extends bases.ComputeRuntimeElement {
  constructor(readonly parent: ComputeBroker) {
    super("javascript-local", "node ", "--eval", parent.kernel, parent);
    this.commandsDependencies = [
      {
        name: "node",
      },
    ];
  }

  protected async installPackage(
    name: string,
    runVolume: storage.IStorageVolume
  ): Promise<number> {
    const result = await this.parent.executeEval(
      "bash-local",
      `npm install --prefer-offline ${name}`,
      runVolume
    );
    return result.rc;
  }
}
