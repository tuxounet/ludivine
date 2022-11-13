import {
  bases,
  channels,
  errors,
  logging,
  messaging,
  sessions,
} from "@ludivine/runtime";
import events from "events";
import { SessionsBroker } from "./SessionsBroker";

export class Session extends bases.KernelElement implements sessions.ISession {
  constructor(
    readonly id: number,

    readonly parent: SessionsBroker
  ) {
    super(`session<${id}>`, parent.kernel, parent);

    this.emitter = new events.EventEmitter();
    this.state = "NONE";
    this.facts = [];
    this.sequence = 0;
  }
  sequence: number;

  state: string;
  facts: sessions.facts.ISessionFact[];

  emitter: events.EventEmitter;

  @logging.logMethod()
  async initialize(): Promise<void> {
    await this.load();
    await this.parent.messaging.subscribeTopic("/sessions/" + this.id, this);
  }

  @logging.logMethod()
  async shutdown(): Promise<void> {
    await this.parent.messaging.unsubscribeTopic(
      "/sessions/" + this.id,
      this.fullName
    );
    await this.persist();
  }

  @logging.logMethod()
  async load() {
    const sessionsVolume = await this.parent.storage.getVolume("sessions");

    const sessionFolder = sessionsVolume.paths.combinePaths(String(this.id));
    const sessionFolderExists = await sessionsVolume.fileSystem.existsDirectory(
      sessionFolder
    );
    if (!sessionFolderExists) {
      await this.persist();
    }

    const sessionFile = sessionsVolume.paths.combinePaths(
      sessionFolder,
      "session.json"
    );
    const sessionFileExits = await sessionsVolume.fileSystem.existsFile(
      sessionFile
    );
    if (!sessionFileExits) {
      await this.persist();
    }
    const sessionFileEntry =
      await sessionsVolume.fileSystem.readObjectFile<sessions.files.ISessionFile>(
        sessionFile
      );
    if (!sessionFileEntry.body) {
      throw errors.BasicError.notFound(this.fullName, "session.json", "body");
    }

    const sessionFileContent = sessionFileEntry.body;
    this.sequence = sessionFileContent.body.sequence;
    this.state = sessionFileContent.body.state;
    this.facts = sessionFileContent.body.facts;
  }
  @logging.logMethod()
  async persist() {
    const sessionsVolume = await this.parent.storage.getVolume("sessions");
    const sessionFolder = sessionsVolume.paths.combinePaths(String(this.id));
    const sessionFolderExists = await sessionsVolume.fileSystem.existsDirectory(
      sessionFolder
    );
    if (!sessionFolderExists) {
      await sessionsVolume.fileSystem.createDirectory(sessionFolder);
    }

    const sessionFile = sessionsVolume.paths.combinePaths(
      sessionFolder,
      "session.json"
    );

    const sessionContent: sessions.files.ISessionFile = {
      metadata: {
        id: this.fullName,
        kind: "session",
      },
      body: {
        id: this.id,
        state: this.state,
        sequence: this.sequence,
        facts: this.facts,
      },
    };
    await sessionsVolume.fileSystem.writeObjectFile(
      sessionFile,
      sessionContent
    );
  }

  @logging.logMethod()
  protected async waitForReply(
    sequence: string,
    timeout: number = 30000
  ): Promise<messaging.IMessageEvent> {
    return await new Promise<messaging.IMessageEvent>((resolve, reject) => {
      const solver = (message: messaging.IMessageEvent): void => {
        clearTimeout(timoutTmr);
        resolve(message);
      };
      const timoutTmr = setTimeout(() => {
        clearTimeout(timoutTmr);
        this.emitter.off(sequence, solver);

        reject(new Error("reply timeout for sequence " + sequence));
      }, timeout);
      this.emitter.once(sequence, solver);
    });
  }

  @logging.logMethod()
  async onMessage(messageEvent: messaging.IMessageEvent): Promise<void> {
    const sequence = messageEvent.body.sequence;

    if (sequence != null && typeof sequence === "string") {
      this.emitter.emit(sequence, messageEvent);
    }
  }

  @logging.logMethod()
  async output(out: channels.IOutputMessage): Promise<void> {
    this.sequence++;
    const sequence = "O" + String(this.sequence);

    await this.pushFact(sequence, "output", { ...out });
  }

  @logging.logMethod()
  async input(
    query: channels.IInputQuery
  ): Promise<channels.IInputMessage<string>> {
    this.sequence++;

    const sequence = "I" + String(this.sequence);

    await this.pushFact(sequence, "input", {
      session: this.id,
      sequence,
      query,
    });

    const message = await this.waitForReply(sequence);

    if (message === undefined) {
      throw new Error("no messsage in reply for sequence " + sequence);
    }

    const line = String(message.body.value);

    const result: channels.IInputMessage<string> = {
      sender: message.sender,
      type: "line",
      value: line,
    };

    return result;
  }

  @logging.logMethod()
  async terminate(): Promise<boolean> {
    this.log.warn("terminate query ");
    return true;
  }

  @logging.logMethod()
  private async pushFact(
    sequence: string,
    type: string,
    datas: Record<string, unknown>
  ) {}
}
