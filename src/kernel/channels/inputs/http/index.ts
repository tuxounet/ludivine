import { bases, kernel, channels } from "@ludivine/runtime";
export class HttpInputChannel
  extends bases.KernelElement
  implements channels.IInputChannel
{
  constructor(readonly kernel: kernel.IKernel, parent: kernel.IKernelElement) {
    super("http-input", kernel, parent);
    this.opened = false;
  }

  opened: boolean;

  async initialize(): Promise<void> {
    await this.kernel.endpoints.registerRoute("GET", "/connect", (req, res) => {
      const config = {
        clientId:
          req.query.id !== undefined ? req.query.id : new Date().getTime(),
      };
      res.setHeader("content-type", "application/json");
      res.send(JSON.stringify(config));
    });

    await this.kernel.endpoints.registerRoute("POST", "/input", (req, res) => {
      const value = req.body?.command;
      if (value === undefined) {
        this.log.error("bad input", req.body);
        res.sendStatus(400);
        res.end();
        return;
      }
      this.kernel.messaging
        .publish("/channels/input", { command: value, channel: this.name })
        .then(() => {
          res.sendStatus(200);
          res.end();
        })
        .catch((e) => {
          this.log.error("input publish failed", value, e);
          res.sendStatus(500);
          res.end();
        });
    });
  }

  async open(): Promise<void> {
    this.opened = true;
  }

  async close(): Promise<void> {
    this.opened = false;
  }
}
