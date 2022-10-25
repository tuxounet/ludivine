import { bases, kernel, channels } from "@ludivine/shared";
import webpush from "web-push";
import { vapidKeys } from "./keys";

export interface IDeviceKeys {
  p256dh: string;
  auth: string;
}

export interface IDevice extends Record<string, unknown> {
  endpoint: string;
  keys: IDeviceKeys;
}

export class WebPushOutputChannel
  extends bases.KernelElement
  implements channels.IOutputChannel
{
  constructor(readonly kernel: kernel.IKernel, parent: kernel.IKernelElement) {
    super("web-push", kernel, parent);
    this.opened = false;
  }

  async output(message: channels.IOutputMessage): Promise<void> {
    const volume = await this.kernel.storage.getVolume("runspace");
    let devices: IDevice[] = [];
    const existsDeviceFile = await volume.fileSystem.existsFile("devices.json");
    if (existsDeviceFile) {
      const allDevices = await volume.fileSystem.readObjectFile<IDevice[]>(
        "devices.json"
      );
      if (allDevices.body != null) devices = allDevices.body;
    }

    this.log.info("output via push", message.body);

    webpush.setVapidDetails(
      "mailto:admin@krux.fr",
      vapidKeys.publicKey,
      vapidKeys.privateKey
    );

    const failures: IDevice[] = [];
    for (const device of devices) {
      try {
        const sub = {
          endpoint: device.endpoint,
          expirationTime: null,
          keys: {
            p256dh: device.keys.p256dh,
            auth: device.keys.auth,
          },
        };
        await webpush.sendNotification(sub, JSON.stringify(message));
      } catch (e) {
        this.log.error("failed to push", device.endpoint, e);
        failures.push(device);
      }
    }
    if (failures.length > 0) {
      await Promise.all(
        failures.map(async (item) => await this.unregisterDevice(item))
      );
    }
  }

  opened: boolean;

  async initialize(): Promise<void> {
    await this.kernel.endpoints.registerRoute(
      "POST",
      "/subscribe",
      (req, res) => {
        const value = req.body;
        if (value === undefined) {
          this.log.error("bad input", req.body);
          res.sendStatus(400);
          res.end();
          return;
        }

        this.registerDevice(value)
          .then((result) => {
            if (result) res.sendStatus(201);
            else res.sendStatus(200);
            res.end();
          })
          .catch((e) => {
            this.log.error("output push subscribe failed", value, e);
            res.sendStatus(500);
            res.end();
          });
      }
    );
  }

  async open(): Promise<void> {
    this.opened = true;
  }

  async close(): Promise<void> {
    this.opened = false;
  }

  async registerDevice(device: IDevice): Promise<boolean> {
    const volume = await this.kernel.storage.getVolume("runspace");
    let devices: IDevice[] = [];
    const existsDeviceFile = await volume.fileSystem.existsFile("devices.json");
    if (existsDeviceFile) {
      const allDevices = await volume.fileSystem.readObjectFile<IDevice[]>(
        "devices.json"
      );
      if (allDevices.body != null) devices = allDevices.body;
    }
    const found = devices.findIndex(
      (item) => item.endpoint === device.endpoint
    );
    if (found > -1) return false;

    devices.push(device);
    await volume.fileSystem.writeObjectFile<IDevice[]>("devices.json", devices);
    return true;
  }

  async unregisterDevice(device: IDevice): Promise<boolean> {
    const volume = await this.kernel.storage.getVolume("runspace");
    let devices: IDevice[] = [];
    const existsDeviceFile = await volume.fileSystem.existsFile("devices.json");
    if (existsDeviceFile) {
      const allDevices = await volume.fileSystem.readObjectFile<IDevice[]>(
        "devices.json"
      );
      if (allDevices.body != null) devices = allDevices.body;
    }
    const alls = devices.filter((item) => item.endpoint !== device.endpoint);

    await volume.fileSystem.writeObjectFile<IDevice[]>("devices.json", alls);
    return true;
  }
}
