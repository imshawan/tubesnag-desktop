import { type ClientContext, createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/message-port";
import type { RouterClient } from "@orpc/server";
import type { router } from "./router";
import {getElectron} from "@/lib/utils/common";
import { IpcChannels } from "@/lib/utils/enums";

type RPCClient = RouterClient<typeof router>;

class IPCManager {
  private readonly clientPort: MessagePort;
  private readonly serverPort: MessagePort;

  private readonly rpcLink: RPCLink<ClientContext>;

  private initialized = false;

  readonly client: RPCClient;

  constructor() {
    const { port1: clientChannelPort, port2: serverChannelPort } =
      new MessageChannel();
    this.clientPort = clientChannelPort;
    this.serverPort = serverChannelPort;

    this.rpcLink = new RPCLink({
      port: this.clientPort,
    });
    this.client = createORPCClient(this.rpcLink);
  }

  initialize() {
    if (this.initialized) {
      return;
    }

    getElectron().onReadySignal(() => {
      console.log("oRPC Bridge: Handshake confirmed by Main Process.");
    });

    this.clientPort.start();

    window.postMessage(IpcChannels.START_ORPC_SERVER, "*", [this.serverPort]);
    this.initialized = true;
  }
}

export const ipc = new IPCManager();