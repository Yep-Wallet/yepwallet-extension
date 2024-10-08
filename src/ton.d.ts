export {};

interface ITonProvider {
  isYepWallet?: boolean;
  isTonWallet?: boolean;

  nextJsonRpcId;
  callbacks: Record<string, any>;
  promises: Record<
    string,
    {
      resolve: (value: unknown) => void;
      reject: (reason?: any) => void;
    }
  >;
  nextJsonRpcId: number;
  _destroy: () => void;
  destroyYepWallet: () => void;
}

declare global {
  interface Window {
    ton: ITonProvider;
    yepwallet: {
      provider: ITonProvider;
      tonconnect: TonConnectBridge;
    };
    tonProtocolVersion: number;
  }
}
