import { bases, kernel, logging, scheduler } from "@ludivine/runtime";
import { ScheduleController } from "./controllers/ScheduleController";
import { TimelineController } from "./controllers/TimelineController";
export class SchedulerBroker
  extends bases.KernelElement
  implements scheduler.ISchedulerBroker
{
  constructor(readonly kernel: kernel.IKernel) {
    super("scheduler", kernel);
    this.schedule = new ScheduleController(this);
    this.timeline = new TimelineController(this);
  }

  schedule: ScheduleController;
  timeline: TimelineController;

  @logging.logMethod()
  async initialize(): Promise<void> {
    await this.timeline.initialize();
    await this.schedule.initialize();
    await super.initialize();
  }

  @logging.logMethod()
  async today(): Promise<scheduler.ITimeline> {
    const timeline = await this.timeline.today();
    return timeline;
  }
  @logging.logMethod()
  async push(event: scheduler.ITimelineEvent): Promise<boolean> {
    return await this.timeline.driver.create(event);
  }

  @logging.logMethod()
  async shutdown(): Promise<void> {
    await this.schedule.shutdown();
    await this.timeline.shutdown();

    await super.shutdown();
  }
}
