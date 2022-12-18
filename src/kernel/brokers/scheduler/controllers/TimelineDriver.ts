import { bases, logging, scheduler, storage } from "@ludivine/runtime";
import { TimelineController } from "./TimelineController";

export class TimelineDriver extends bases.KernelElement {
  constructor(protected controller: TimelineController) {
    super("timeline-driver", controller.kernel, controller);
    this.storage = this.kernel.container.get("storage");
  }
  storage: storage.IStorageBroker;
  @logging.logMethod()
  async initialize(): Promise<void> {
    await super.initialize();
  }

  @logging.logMethod()
  async getDay(
    yyyy: string,
    mm: string,
    dd: string
  ): Promise<scheduler.ITimeline> {
    const dayStart = scheduler.PointInTime.build(
      yyyy,
      mm,
      dd,
      "00",
      "00",
      "00",
      "00",
      "00"
    );
    const dayEnd = scheduler.PointInTime.build(
      yyyy,
      mm,
      dd,
      "23",
      "59",
      "59",
      "999",
      "00"
    );

    const dataVolume = await this.storage.getVolume("workspace");

    const timeline: scheduler.ITimeline = {
      period: new scheduler.MomentInTime(dayStart, true, dayEnd),
      events: [],
    };

    const dayPath = dataVolume.paths.combinePaths(yyyy, mm, dd);

    const dayFolderExists = await dataVolume.fileSystem.existsDirectory(
      dayPath
    );
    if (!dayFolderExists) {
      return timeline;
    }
    const allItemFiles = await dataVolume.fileSystem.list(dayPath);
    const allEventEntries = await Promise.all(
      allItemFiles.map((item) =>
        dataVolume.fileSystem.readObjectFile<scheduler.ITimelineEvent>(
          item.path
        )
      )
    );

    allEventEntries.forEach((item) => {
      if (!item.body) return;
      timeline.events.push(item.body);
    });

    return timeline;
  }

  @logging.logMethod()
  async create(event: scheduler.ITimelineEvent): Promise<boolean> {
    const begin = event.when.begin;
    const dataVolume = await this.storage.getVolume("workspace");
    const filename = scheduler.PointInTime.toIsoString(begin) + ".event";
    const eventFolder = dataVolume.paths.combinePaths(
      begin.YYYY,
      begin.MM,
      begin.DD
    );
    const dayFolderExists = await dataVolume.fileSystem.existsDirectory(
      eventFolder
    );
    if (!dayFolderExists) {
      await dataVolume.fileSystem.createDirectory(eventFolder);
    }
    const eventPath = dataVolume.paths.combinePaths(
      begin.YYYY,
      begin.MM,
      begin.DD,
      filename
    );
    return await dataVolume.fileSystem.writeObjectFile(eventPath, event);
  }

  @logging.logMethod()
  async update() {}
  @logging.logMethod()
  async delete() {}

  @logging.logMethod()
  async shutdown(): Promise<void> {
    await super.shutdown();
  }
}
