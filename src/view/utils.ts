import { useMemo } from "react";

import { Address, TonClient } from "@ton/ton";
import { ALL, fromNano } from "@yepwallet/web-sdk";

import { WalletVersion } from "../libs/entries/wallet";
import { getWalletContract } from "../libs/service/transfer/core";

export const balanceFormat = new Intl.NumberFormat("en-US", {
	minimumFractionDigits: 0,
	maximumFractionDigits: 4,
});

export const numberTonValue = (value: string): number => {
	return parseFloat(fromNano(value));
};

export const formatTonValue = (value: string): string => {
	return balanceFormat.format(numberTonValue(value));
};

export const formatCoinValue = (value: string): string => {
	return balanceFormat.format(parseFloat(value));
};

export const toShortAddress = (address: string, length = 4): string => {
	return address.slice(0, length) + "...." + address.slice(-length);
};

export const toShortName = (name: string): string => {
	if (name.length > 15) {
		return name.slice(0, 15) + "...";
	}
	return name;
};

export const fiatFormat = new Intl.NumberFormat("en-US", {
	minimumFractionDigits: 0,
	maximumFractionDigits: 2,
	style: "currency",
	currency: "USD",
});

export const useCoinFiat = (balance?: string, price?: number) => {
	return useMemo(() => {
		if (price && balance) {
			return `${fiatFormat.format(parseFloat(balance) * price)}`;
		} else {
			return undefined;
		}
	}, [price, balance]);
};

export const useTonFiat = (balance?: string, price?: number) => {
	return useMemo(() => {
		if (price && balance) {
			return `${fiatFormat.format(numberTonValue(balance) * price)}`;
		} else {
			return undefined;
		}
	}, [price, balance]);
};

export const fiatFees = new Intl.NumberFormat("en-US", {
	minimumFractionDigits: 0,
	maximumFractionDigits: 4,
});

export const lastWalletVersion = "w5";

export const findContract = async (
	tonClient: TonClient | any,
	publicKey: Uint8Array
): Promise<[WalletVersion, Address]> => {
	let address;
	for (let [version, WalletClass] of Object.entries(ALL)) {
		const walletState = {
			name: "",
			mnemonic: "",
			address: "",
			publicKey: Buffer.from(publicKey).toString("hex"),
			version: version as WalletVersion,
			isBounceable: true,
		};
		const contract = getWalletContract(walletState);
		const tonContract = tonClient.open(contract);

		const balance = await tonContract.getBalance();
		address = contract.address;
		if (balance.toString() !== "0") {
			return [version, contract.address] as [WalletVersion, Address];
		}
	}
	return [lastWalletVersion, address];
};
