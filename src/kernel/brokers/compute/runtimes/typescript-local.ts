import { bases, storage } from "@ludivine/runtime";
import { ComputeBroker } from "../ComputeBroker";

export class ComputeRuntimeTypescript extends bases.ComputeRuntimeElement {
  constructor(readonly parent: ComputeBroker) {
    super("typescript-local", "ts-node", "-p -e", parent.kernel, parent);
    this.commandsDependencies = [
      {
        name: "ts-node",
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
