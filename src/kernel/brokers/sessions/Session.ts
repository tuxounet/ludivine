import { bases, errors, logging, messaging, sessions } from "@ludivine/runtime";
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
    await this.parent.messaging.subscribeTopic(
      "/sessions/" + String(this.id),
      this
    );
  }

  @logging.logMethod()
  async shutdown(): Promise<void> {
    await this.parent.messaging.unsubscribeTopic(
      "/sessions/" + String(this.id),
      this.fullName
    );
    await this.persist();
  }

  @logging.logMethod()
  async load(): Promise<void> {
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
    if (sessionFileEntry.body == null) {
      throw errors.BasicError.notFound(this.fullName, "session.json", "body");
    }

    const sessionFileContent = sessionFileEntry.body;
    this.sequence = sessionFileContent.body.sequence;
    this.state = sessionFileContent.body.state;
    this.facts = sessionFileContent.body.facts;
  }

  @logging.logMethod()
  async persist(): Promise<void> {
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
  async onMessage(messageEvent: messaging.IMessageEvent): Promise<void> {
    const sequence = messageEvent.body.sequence;

    if (sequence != null) {
      this.emitter.emit("SEQ-" + String(sequence), messageEvent);
    }
  }

  @logging.logMethod()
  async output(
    body: string,
    kind: sessions.facts.ISessionFactOutputKind = "message"
  ): Promise<void> {
    const fact: sessions.facts.ISessionFactOutput = {
      type: "output",
      kind,
      body,
      date: new Date().toISOString(),
      sender: this.fullName,
      sequence: this.sequence,
      session: this.id,
    };

    await this.pushFact(fact);
  }

  @logging.logMethod()
  async ask(prompt: string): Promise<void> {
    const fact: sessions.facts.ISessionFactAsk = {
      type: "ask",
      prompt,
      date: new Date().toISOString(),
      sender: this.fullName,
      sequence: this.sequence,
      session: this.id,
    };

    await this.pushFact(fact);
  }

  @logging.logMethod()
  async waitForReply(
    sequence: number
  ): Promise<sessions.facts.ISessionFactReply> {
    const message = await new Promise<messaging.IMessageEvent>((resolve) => {
      const solver = (message: messaging.IMessageEvent): void => {
        resolve(message);
      };

      this.emitter.once("SEQ-" + String(sequence), solver);
    });

    if (message === undefined) {
      throw errors.BasicError.notFound(
        this.fullName,
        "reply",
        String(sequence)
      );
    }

    const result: sessions.facts.ISessionFactReply = {
      type: "reply",
      date: new Date().toISOString(),
      sender: this.fullName,
      sequence: this.sequence,
      session: this.id,
    };

    return result;
  }

  @logging.logMethod()
  async terminate(): Promise<boolean> {
    const fact: sessions.facts.ISessionFactEnd = {
      type: "end",

      date: new Date().toISOString(),
      sender: this.fullName,
      sequence: this.sequence,
      session: this.id,
    };
    await this.pushFact(fact);
    return true;
  }

  @logging.logMethod()
  private async pushFact(fact: sessions.facts.ISessionFact): Promise<void> {
    this.facts.push(fact);
    this.sequence++;
  }
}
