import {
  bases,
  errors,
  logging,
  sessions,
  messaging,
  kernel,
  storage,
} from "@ludivine/runtime";

import { Session } from "./Session";

export class SessionsBroker
  extends bases.KernelElement
  implements sessions.ISessionsBroker
{
  constructor(readonly kernel: kernel.IKernel) {
    super("sessions", kernel);
    this.sessions = new Map();
    this.messaging = this.kernel.container.get("messaging");
    this.storage = this.kernel.container.get("storage");
    this.sequence = 0;
  }

  messaging: messaging.IMessagingBroker;
  storage: storage.IStorageBroker;
  sequence: number;
  sessions: Map<number, sessions.ISession>;

  @logging.logMethod()
  async initialize(): Promise<void> {
    await this.load();
    await super.initialize();
  }

  @logging.logMethod()
  async shutdown(): Promise<void> {
    await Promise.all(
      Array.from(this.sessions.values()).map(
        async (item) => await item.shutdown()
      )
    );

    await this.persist();
    await super.shutdown();
  }

  @logging.logMethod()
  async load(): Promise<void> {
    const sessionVolume = await this.storage.getVolume("sessions");
    const sessionsFilePath = sessionVolume.paths.combinePaths("sessions.json");
    const sessionsFileExists = await sessionVolume.fileSystem.existsFile(
      sessionsFilePath
    );
    if (!sessionsFileExists) {
      await this.persist();
    }
    const sessionsState =
      await sessionVolume.fileSystem.readObjectFile<sessions.files.ISessionsStateFile>(
        sessionsFilePath
      );
    const body = sessionsState.body;
    if (body == null)
      throw errors.BasicError.notFound(this.fullName, "sessions.json", "body");

    this.sequence = body.body.sequence;
  }

  @logging.logMethod()
  async persist(): Promise<void> {
    const sessionVolume = await this.storage.getVolume("sessions");
    const sessionsFilePath = sessionVolume.paths.combinePaths("sessions.json");

    const sessionsStateContent: sessions.files.ISessionsStateFile = {
      metadata: {
        id: this.fullName,
        kind: "sessions",
      },
      body: {
        sequence: this.sequence,
        sessions: Array.from(this.sessions.values()).map((session) => {
          return {
            id: session.id,
            folder: String(session.id) + "/session.json",
            state: session.state,
            sequence: session.sequence,
          };
        }),
      },
    };

    await sessionVolume.fileSystem.writeObjectFile(
      sessionsFilePath,
      sessionsStateContent
    );
  }

  @logging.logMethod()
  async begin(): Promise<number> {
    this.sequence++;

    const id = this.sequence;
    const session = new Session(id, this);
    this.sessions.set(id, session);
    await session.initialize();
    return id;
  }

  @logging.logMethod()
  async get(id: number): Promise<sessions.ISession> {
    const instance = this.sessions.get(id);
    if (instance == null) {
      throw errors.BasicError.notFound(this.fullName, "get", String(id));
    }
    return instance;
  }

  @logging.logMethod()
  async terminate(id: number): Promise<boolean> {
    if (!this.sessions.has(id)) return false;
    const session = this.sessions.get(id);
    if (session == null) return false;

    await session.terminate();
    await session.shutdown();
    this.sessions.delete(id);
    return true;
  }
}
