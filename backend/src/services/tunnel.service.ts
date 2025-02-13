// src/services/tunnel.service.ts
import ngrok from "ngrok";
import { config } from "../config/environment";

export class TunnelService {
  private static instance: TunnelService;
  private url: string | null = null;
  private isConnected: boolean = false;

  private constructor() {}

  static getInstance(): TunnelService {
    if (!TunnelService.instance) {
      TunnelService.instance = new TunnelService();
    }
    return TunnelService.instance;
  }

  async start() {
    try {
      if (!this.url) {
        const options: any = {
          addr: config.port || 3000,
          authtoken: config.ngrok?.authToken,
          onStatusChange: (status: string) => {
            if (status === "connected" && !this.isConnected) {
              this.isConnected = true;
              this.displayConnectionInfo();
            }
            console.log("Ngrok Status:", status);
          },
          onLogEvent: (data: string) => {
            if (data.includes("command failed")) {
              console.error("Ngrok Error:", data);
            } else {
              console.log("Ngrok Log:", data);
            }
          },
        };

        this.url = await ngrok.connect(options);

        // Display connection info immediately after getting the URL
        await this.displayConnectionInfo();
      }
      return this.url;
    } catch (error) {
      console.error("Failed to establish ngrok tunnel:", error);
      throw error;
    }
  }

  private async displayConnectionInfo() {
    if (!this.url) return;

    const tunnels = await ngrok.getUrl();

    console.log("\n=== Ngrok Tunnel Established ===");
    console.log("→ Public URL:", this.url);
    console.log("→ API Documentation:", `${this.url}/api-docs`);
    console.log("→ Health Check:", `${this.url}/health`);
    console.log("→ Local Inspection:", "http://localhost:4040");
    console.log("→ Share this URL with your team to access the API");
    console.log("===============================\n");
  }

  async stop() {
    try {
      if (this.url) {
        await ngrok.kill();
        this.url = null;
        this.isConnected = false;
        console.log("Ngrok tunnel closed");
      }
    } catch (error) {
      console.error("Failed to close ngrok tunnel:", error);
      throw error;
    }
  }

  getUrl(): string | null {
    return this.url;
  }

  isConnectedToTunnel(): boolean {
    return this.isConnected;
  }
}
