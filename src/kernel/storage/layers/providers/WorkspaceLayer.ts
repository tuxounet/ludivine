import { KernelElement } from "../../../bases/KernelElement";

import { AbstractLocalFileSystem } from "./AbstractLocalFileSystem";

export class WorkspaceLayer extends AbstractLocalFileSystem {
  constructor(parent: KernelElement) {
    super("workspace-layer", "workspace", false, process.cwd(), parent);
  }
}
