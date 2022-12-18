import { bases, logging, scheduler } from "@ludivine/runtime";

export class ScheduleController extends bases.KernelElement {
  constructor(protected broker: scheduler.ISchedulerBroker) {
    super("schedule-controller", broker.kernel, broker);
  }

  @logging.logMethod()
  async initialize(): Promise<void> {
    await super.initialize();
  }

  @logging.logMethod()
  async list() {}

  @logging.logMethod()
  async get() {}

  @logging.logMethod()
  async create() {}

  @logging.logMethod()
  async update() {}
  @logging.logMethod()
  async delete() {}

  @logging.logMethod()
  async shutdown(): Promise<void> {
    await super.shutdown();
  }
}
