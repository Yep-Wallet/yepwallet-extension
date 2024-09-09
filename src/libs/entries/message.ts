export interface DAppMessage {
  id: number;
  method: string;
  params: any;
  origin: string;
  event: boolean;
}

export type YepWalletAPIMessage = YepWalletAPIResponse | YepWalletAPIEvent;

export interface YepWalletError {
  message: string;
  code: number;
  description?: string;
}
export interface YepWalletAPIResponse {
  type: "YepWalletAPI";
  message: {
    jsonrpc: "2.0";
    id: number;
    method: string;
    result: undefined | unknown;
    error?: YepWalletError;
  };
}

export interface YepWalletAPIEvent {
  type: "YepWalletAPI";
  message: {
    jsonrpc: "2.0";
    id?: undefined;
    method: "accountsChanged" | "chainChanged";
    result: undefined | unknown;
    error?: YepWalletError;
  };
}
