import { useContext } from "react";

import * as tonMnemonic from "tonweb-mnemonic";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { TonClient } from "@ton/ton";
import { ALL, bytesToHex, TonHttpProvider } from "@yepwallet/web-sdk";

import { WalletState } from "../../../libs/entries/wallet";
import { NotificationData } from "../../../libs/event";
import { encrypt } from "../../../libs/service/cryptoService";
import { validateMnemonic } from "../../../libs/state/accountService";
import { getAppPassword } from "../../api";
import {
  AccountStateContext,
  NetworkContext,
  TonClientContext,
  TonProviderContext,
} from "../../context";
import { askBackground } from "../../event";
import { findContract, lastWalletVersion } from "../../utils";
import { saveAccountState } from "../api";
import { getWalletContract } from "../../../libs/service/transfer/core";

export const askBackgroundPassword = async () => {
  const password = await askBackground<string | null>().message("getPassword");
  if (password == null || password === "") {
    throw new Error("Unexpected password");
  }
  return password;
};

export const askBackgroundNotification = async () => {
  return await askBackground<NotificationData | undefined>().message(
    "getNotification"
  );
};

const createWallet = async (
  ton: TonHttpProvider,
  mnemonic: string,
  password: string,
  index: number,
  network: string
): Promise<WalletState> => {
  const encryptedMnemonic = await encrypt(mnemonic, password);
  const keyPair = await tonMnemonic.mnemonicToKeyPair(mnemonic.split(" "));

  // const WalletClass = ALL[lastWalletVersion];
  // const walletContract = new WalletClass(ton, {
  // 	publicKey: keyPair.publicKey,
  // 	wc: 0,
  // });

  const wallet: WalletState = {
    name: `Account ${index}`,
    mnemonic: encryptedMnemonic,
    address: "",
    publicKey: bytesToHex(keyPair.publicKey),
    version: lastWalletVersion,
    isBounceable: true,
  };

  const contract = getWalletContract(wallet);
  wallet.address = contract.address.toString({
    urlSafe: true,
    bounceable: true,
    testOnly: network === "testnet",
  });

  return wallet;
};

export const useCreateWalletMutation = () => {
  const network = useContext(NetworkContext);
  const ton = useContext(TonProviderContext);
  const account = useContext(AccountStateContext);
  const client = useQueryClient();

  return useMutation<void, Error, string>(async (mnemonic) => {
    return getAppPassword(async (password) => {
      const wallet = await createWallet(
        ton,
        mnemonic,
        password,
        account.wallets.length + 1,
        network
      );

      const value = {
        ...account,
        wallets: [...account.wallets, wallet],
        activeWallet: wallet.address,
      };
      await saveAccountState(network, client, value);
    });
  });
};

export const importWallet = async (
  ton: TonClient,
  mnemonic: string[],
  password: string,
  index: number,
  network: string
): Promise<WalletState> => {
  const encryptedMnemonic = await encrypt(mnemonic.join(" "), password);
  const keyPair = await tonMnemonic.mnemonicToKeyPair(mnemonic);
  const [version, address] = await findContract(ton, keyPair.publicKey);

  return {
    name: `Account ${index}`,
    mnemonic: encryptedMnemonic,
    address: address.toString({
      urlSafe: true,
      bounceable: false,
      testOnly: network === "testnet",
    }),
    publicKey: bytesToHex(keyPair.publicKey),
    version,
    isBounceable: false,
  };
};

export const useImportWalletMutation = () => {
  const client = useQueryClient();
  const ton = useContext(TonClientContext);
  const network = useContext(NetworkContext);
  const data = useContext(AccountStateContext);

  return useMutation<void, Error, string>(async (value) => {
    return getAppPassword(async (password) => {
      const mnemonic = value.trim().split(" ");
      validateMnemonic(mnemonic);

      const wallet = await importWallet(
        ton,
        mnemonic,
        password,
        data.wallets.length + 1,
        network
      );
      if (data.wallets.some((w) => w.address === wallet.address)) {
        throw new Error("Wallet already connect");
      }
      const wallets = data.wallets.concat([wallet]);
      const state = {
        ...data,
        wallets,
        activeWallet: wallet.address,
      };
      await saveAccountState(network, client, state);
    });
  });
};
