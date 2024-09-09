import { useMutation, useQuery } from "@tanstack/react-query";
import { Address } from "@ton/core";
import { TonClient } from "@ton/ton";
import { toNano } from "@yepwallet/web-sdk";
import { useContext } from "react";
import { NftItem } from "../../../../../../../libs/entries/asset";
import { EstimateFeeValues } from "../../../../../../../libs/entries/tonCenter";
import { WalletState } from "../../../../../../../libs/entries/wallet";
import { getWalletContract } from "../../../../../../../libs/service/transfer/core";
import {
	SendNftState,
	createLedgerNftTransfer,
	createNftTransfer,
} from "../../../../../../../libs/service/transfer/nftService";
import { QueryType } from "../../../../../../../libs/store/browserStore";
import {
	TonClientContext,
	WalletStateContext,
} from "../../../../../../context";
import { checkBalanceOrDie, getWalletKeyPair } from "../../../../../api";
import { signLedgerTransaction } from "../../../../../ledger/api";

export const toSendNftState = (searchParams: URLSearchParams): SendNftState => {
	return {
		address: decodeURIComponent(searchParams.get("address") ?? ""),
		amount: decodeURIComponent(searchParams.get("amount") ?? "0.05"),
		forwardAmount: decodeURIComponent(
			searchParams.get("forwardAmount") ?? "0.0001"
		),
		comment: decodeURIComponent(searchParams.get("comment") ?? ""),
	};
};

export const stateToSearch = (state: SendNftState) => {
	return Object.entries(state).reduce((acc, [key, value]) => {
		acc[key] = encodeURIComponent(value);
		return acc;
	}, {} as Record<string, string>);
};

export const useEstimateNftFee = (state: SendNftState, nft: NftItem) => {
	const tonClient = useContext(TonClientContext);
	const wallet = useContext(WalletStateContext);

	return useQuery([QueryType.estimation, nft], async () => {
		const transaction = createNftTransfer(
			0,
			wallet,
			wallet.address,
			state,
			nft
		);
		const data = await tonClient.estimateExternalMessageFee(
			Address.parse(wallet.address),
			{
				body: transaction,
				initCode: null,
				initData: null,
				ignoreSignature: true,
			}
		);
		return data.source_fees as EstimateFeeValues;
	});
};

const sendLedgerTransaction = async (
	tonClient: TonClient,
	wallet: WalletState,
	state: SendNftState,
	nft: NftItem,
	address: string
) => {
	const contract = getWalletContract(wallet);
	const tonContract = tonClient.open(contract);

	const walletBalance = await tonContract.getBalance();

	await checkBalanceOrDie(walletBalance.toString(), toNano(state.amount));

	const seqno = await tonContract.getSeqno();

	const transaction = createLedgerNftTransfer(
		wallet,
		seqno,
		address,
		state,
		nft
	);

	const signed = await signLedgerTransaction(transaction);
	await tonContract.send(signed);

	return seqno;
};
const sendMnemonicTransaction = async (
	tonClient: TonClient,
	wallet: WalletState,
	state: SendNftState,
	nft: NftItem,
	address: string
) => {
	const keyPair = await getWalletKeyPair(wallet);
	const secretKey = Buffer.from(keyPair.secretKey);

	const contract = getWalletContract(wallet);
	const tonContract = tonClient.open(contract);

	const walletBalance = await tonContract.getBalance();

	await checkBalanceOrDie(walletBalance.toString(), toNano(state.amount));

	const seqno = await tonContract.getSeqno();

	const transaction = createNftTransfer(
		seqno,
		wallet,
		address,
		state,
		nft,
		secretKey
	);

	await tonContract.send(transaction);

	return seqno;
};
export const useSendNft = (state: SendNftState, nft: NftItem) => {
	const tonClient = useContext(TonClientContext);
	const wallet = useContext(WalletStateContext);

	return useMutation<number, Error, string>(async (address) => {
		if (wallet.ledger) {
			return sendLedgerTransaction(
				tonClient,
				wallet,
				state,
				nft,
				address
			);
		} else {
			return sendMnemonicTransaction(
				tonClient,
				wallet,
				state,
				nft,
				address
			);
		}
	});
};
