import { bases, logging, scheduler, storage } from "@ludivine/runtime";
import { TimelineDriver } from "./TimelineDriver";

export class TimelineController extends bases.KernelElement {
  constructor(protected broker: scheduler.ISchedulerBroker) {
    super("timeline", broker.kernel, broker);
    this.driver = new TimelineDriver(this);
  }

  driver: TimelineDriver;
  @logging.logMethod()
  async initialize(): Promise<void> {
    await this.driver.initialize();
    await super.initialize();
  }

  @logging.logMethod()
  async shutdown(): Promise<void> {
    await this.driver.shutdown();
    await super.shutdown();
  }

  @logging.logMethod()
  async today(): Promise<scheduler.ITimeline> {
    const now = scheduler.PointInTime.now();
    const timeline = await this.driver.getDay(now.YYYY, now.MM, now.DD);
    return timeline;
  }
}
