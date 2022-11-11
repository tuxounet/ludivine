import { bases } from "@ludivine/runtime";
import { ComputeBroker } from "../ComputeBroker";

export class ComputeRuntimeBash extends bases.ComputeRuntimeElement {
  constructor(readonly parent: ComputeBroker) {
    super("bash-local", "bash ", "-c", parent.kernel, parent);
    this.commandsDependencies = [
      {
        name: "bash",
      },
    ];
  }
}
