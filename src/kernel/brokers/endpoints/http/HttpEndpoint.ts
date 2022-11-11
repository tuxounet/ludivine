import express from "express";
import bodyParser from "body-parser";
import { Server } from "http";
import { bases, kernel, endpoints, errors } from "@ludivine/runtime";
export class HttpEndpoint extends bases.KernelElement {
  // implements endpoints.IEndpoint
  name = "http";
  port = 7727;
  constructor(readonly kernel: kernel.IKernel, parent: kernel.IKernelElement) {
    super("http-endpoint", kernel, parent);
    if (process.env.PORT != null) this.port = parseInt(process.env.PORT);
  }

  protected app?: express.Application;
  protected server?: Server;
  async open(routes: endpoints.IEndpointRoute[]): Promise<void> {
    if (this.app !== undefined) {
      await this.close();
    }
    this.port = process.env.PORT != null ? parseInt(process.env.PORT) : 7727;
    this.app = express();
    const app = this.app;

    await new Promise<void>((resolve, reject) => {
      try {
        app.use(bodyParser.json());

        routes.forEach((item) => {
          try {
            switch (item.method) {
              case "GET":
                app.get(item.path, item.handler);
                return;
              case "POST":
                app.post(item.path, item.handler);
                return;
              case "ALL":
                app.use(item.path, item.handler);
                return;
              default:
                throw errors.BasicError.badQuery(
                  this.fullName,
                  "route method",
                  item.method
                );
            }
          } catch (e) {
            this.log.error("route registration failed", e);
          }
        });

        this.server = app.listen(this.port, () => {
          this.log.info("listening on port", this.port);
          resolve();
        });
      } catch (e) {
        reject(e);
      }
    });
  }

  async close(): Promise<void> {
    await new Promise<void>((resolve, reject) => {
      if (this.server != null) {
        this.server.close((err) => {
          if (err != null) {
            this.log.error(err);
          }
          resolve();
          this.server = undefined;
        });
        const srv = this.server;
        setImmediate(function () {
          srv.emit("close");
        });
      } else {
        resolve();
      }
    });

    this.app = undefined;
  }
}