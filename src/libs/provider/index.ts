import { EventEmitter } from "../entries/eventEmitter";
import { YepWalletAPIMessage } from "../entries/message";

const seeIsEvent = (method: string) => {
  switch (method) {
    case "accountsChanged":
    case "chainChanged":
      return true;
    default:
      return false;
  }
};

export class TonProvider extends EventEmitter {
  isYepWallet = true;

  targetOrigin = "*";
  nextJsonRpcId = 0;
  promises: Record<
    string,
    {
      resolve: (value: unknown) => void;
      reject: (reason?: any) => void;
    }
  > = {};

  constructor(ton = window.ton) {
    super();
    if (ton && ton.isYepWallet) {
      this.nextJsonRpcId = ton.nextJsonRpcId;
      this.promises = ton.promises;
      this.callbacks = ton.callbacks;
    }

    this.isConnected().catch((e) => console.error(e));

    if (ton && ton.isYepWallet) {
      ton.destroyYepWallet();
    }
    if (ton && ton.isTonWallet) {
      ton._destroy && ton._destroy();
      window.ton = this;
    }
    window.addEventListener("message", this.onMessage);
  }

  isConnected = () => {
    return this.send("ping").then(() => true);
  };

  isLocked = () => {
    return this.send<boolean>("ton_getLocked");
  };

  send<Result>(method: string, ...params: any[]) {
    if (!method || typeof method !== "string") {
      return Promise.reject("Method is not a valid string.");
    }

    if (params.length === 1 && params[0] instanceof Array) {
      params = params[0];
    }

    const id = this.nextJsonRpcId++;
    const payload = {
      jsonrpc: "2.0",
      id,
      method,
      params,
      origin: window.origin,
      event: window.event !== undefined,
    };

    const promise = new Promise((resolve, reject) => {
      this.promises[payload.id] = {
        resolve,
        reject,
      };
    });

    // Send jsonrpc request to YepWallet
    window.postMessage(
      {
        type: "YepWalletProvider",
        message: payload,
      },
      this.targetOrigin
    );

    return promise as Promise<Result>;
  }

  onMessage = async (event: any) => {
    // Return if no data to parse
    if (!event || !event.data) {
      return;
    }

    if (event.data.type !== "YepWalletAPI") return;

    const data: YepWalletAPIMessage = event.data;

    // Return if not a jsonrpc response
    if (!data || !data.message || !data.message.jsonrpc) {
      return;
    }

    const message = data.message;
    const { id, method, error, result } = message;

    if (typeof id !== "undefined") {
      const promise = this.promises[id];
      if (promise) {
        if (message.error) {
          promise.reject(error);
        } else {
          promise.resolve(result);
        }
        delete this.promises[id];
      }
    } else {
      if (method && seeIsEvent(method)) {
        this.emit(method, result);
      }
    }
  };

  addListener = this.on;
  removeListener = this.off;

  addEventListener = this.on;
  removeEventListener = this.off;

  _destroy() {}
  destroyYepWallet() {
    window.removeEventListener("message", this.onMessage);
  }
}
