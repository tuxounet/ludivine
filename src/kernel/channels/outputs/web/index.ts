import path from "path";
import { KernelElement } from "../../../../shared/bases/KernelElement";
import { IOutputChannel } from "../../../../shared/channels/IOutputChannel";
import express from "express";
import { IOutputMessage } from "../../../../shared/channels/IOutputMessage";
import { IKernel } from "../../../../shared/kernel/IKernel";
export class WebOutputChannel extends KernelElement implements IOutputChannel {
  constructor(readonly kernel: IKernel, parent: KernelElement) {
    super("web-output", kernel, parent);
    this.opened = false;

    this.assetsFolder = path.join(__dirname, "assets");
  }

  opened: boolean;

  async open(): Promise<void> {
    this.opened = true;
  }

  async close(): Promise<void> {
    this.opened = false;
  }

  assetsFolder: string;
  clients: any[] = [];
  facts: any[] = [
    {
      date: new Date().toISOString(),
      message: "connexion",
    },
  ];

  async initialize(): Promise<void> {
    await this.kernel.endpoints.registerRoute("GET", "/", (req, res) => {
      res.sendFile(path.join(this.assetsFolder, "index.html"));
    });
    await this.kernel.endpoints.registerRoute(
      "GET",
      "/index.css",
      (req, res) => {
        res.sendFile(path.join(this.assetsFolder, "index.css"));
      }
    );
    await this.kernel.endpoints.registerRoute(
      "GET",
      "/index.js",
      (req, res) => {
        res.sendFile(path.join(this.assetsFolder, "index.js"));
      }
    );

    await this.kernel.endpoints.registerRoute("GET", "/events", (req, res) => {
      const headers = {
        "Content-Type": "text/event-stream",
        Connection: "keep-alive",
        "Cache-Control": "no-cache",
      };
      res.writeHead(200, headers);

      const data = `data: ${JSON.stringify(this.facts)}\n\n`;

      res.write(data);

      const clientId = Date.now();

      const newClient = {
        id: clientId,
        res,
      };

      this.clients.push(newClient);

      req.on("close", () => {
        this.log.debug(`${clientId} Connection closed`);
        this.clients = this.clients.filter((client) => client.id !== clientId);
      });
    });

    const staticFolder = path.join(this.assetsFolder, "static");
    await this.kernel.endpoints.registerRoute(
      "ALL",
      "/static",
      express.static(staticFolder)
    );
  }

  async output(message: IOutputMessage): Promise<void> {
    this.log.info("output", message);
    const ev = {
      date: new Date().toISOString(),
      message,
    };

    this.clients.forEach((client) =>
      client?.res?.write(`data: ${JSON.stringify([ev])}\n\n`)
    );
  }
}
