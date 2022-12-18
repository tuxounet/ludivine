import { bases, kernel, logging, knowledge } from "@ludivine/runtime";

export class KnowledgeBroker
  extends bases.KernelElement
  implements knowledge.IKnowledgeBroker
{
  constructor(readonly kernel: kernel.IKernel) {
    super("knowledge", kernel);
  }

  @logging.logMethod()
  async initialize(): Promise<void> {
    await super.initialize();
  }

  @logging.logMethod()
  async shutdown(): Promise<void> {
    await super.shutdown();
  }
}
