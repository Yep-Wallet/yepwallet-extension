/**
 * Service methods to manage asset state for application
 * The file should contain pure function to mutate state
 *
 * @author: KuznetsovNikita
 * @since: 0.8.0
 */

import { NftData } from "@yepwallet/web-sdk";
import { JettonMinterContent } from "../../libs/ton-wrappers";
import { AccountState } from "../entries/account";
import {
	Asset,
	JettonAsset,
	NftAsset,
	NftCollectionState,
	NftItem,
	NftItemState,
} from "../entries/asset";
import { getWalletAssets, setWalletAssets } from "../entries/wallet";

export interface JettonWalletData {
	balance: string;
	address: string;
}

export interface AddJettonProps {
	minter: string;
	jettonState: JettonMinterContent;
	jettonWallet: JettonWalletData | null;
}

export const seeIfJettonAsset = (asset: Asset): asset is JettonAsset => {
	return "minterAddress" in asset;
};

const useActiveAssets = (
	account: AccountState,
	map: (assets: Asset[]) => Asset[]
): AccountState => {
	return {
		...account,
		wallets: account.wallets.map((wallet) => {
			if (wallet.address === account.activeWallet) {
				return setWalletAssets(wallet, map(getWalletAssets(wallet)));
			}
			return wallet;
		}),
	};
};

export const addJettonToWallet = (
	account: AccountState,
	{ minter, jettonState, jettonWallet }: AddJettonProps
): AccountState => {
	return useActiveAssets(account, (assets) => {
		if (
			!assets.some(
				(item) =>
					seeIfJettonAsset(item) && item.minterAddress === minter
			)
		) {
			// If not exists
			const asset: JettonAsset = {
				state: jettonState,
				minterAddress: minter,
				walletAddress: jettonWallet?.address,
			};
			return assets.concat([asset]);
		}
		return assets;
	});
};

export const deleteJettonAsset = (
	account: AccountState,
	jettonMinterAddress: string
): AccountState => {
	return useActiveAssets(account, (assets) => {
		return assets.filter((asset) => {
			if (!seeIfJettonAsset(asset)) {
				return true;
			} else {
				return asset.minterAddress !== jettonMinterAddress;
			}
		});
	});
};

const setIfNftAssetOver = (collectionAddress: string) => {
	return (value: Asset): value is NftAsset => {
		return (
			!seeIfJettonAsset(value) &&
			value.collectionAddress === collectionAddress
		);
	};
};

export interface AddNftProps {
	nftAddress: string;
	nftData: NftData;
	state: NftItemState | null;
	collection: NftCollectionState | null;
}

export const addNftToWallet = (
	account: AccountState,
	{ nftAddress, nftData, state, collection }: AddNftProps
): AccountState => {
	const nftItemState: NftItem = {
		state: state,
		contentUri: nftData.contentUri,
		address: nftAddress,
	};
	const collectionAddress = nftData.collectionAddress
		? nftData.collectionAddress.toString(true, true, true)
		: nftAddress;

	return useActiveAssets(account, (assets) => {
		const collectionAsset = assets.find<NftAsset>(
			setIfNftAssetOver(collectionAddress)
		);

		if (collectionAsset && !seeIfJettonAsset(collectionAsset)) {
			if (
				!collectionAsset.items.some(
					(item) => item.address === nftAddress
				)
			) {
				// If not exists
				collectionAsset.items.push(nftItemState);
			}
		} else {
			const asset: NftAsset = {
				collectionAddress,
				state: collection,
				items: [nftItemState],
			};

			assets.push(asset);
		}
		return assets;
	});
};

export interface DeleteNftProps {
	collectionAddress: string;
	address: string;
}

export const deleteNftAsset = (
	account: AccountState,
	{ collectionAddress, address }: DeleteNftProps
): AccountState => {
	return useActiveAssets(account, (assets) => {
		const collectionAsset = assets.find<NftAsset>(
			setIfNftAssetOver(collectionAddress)
		);
		if (!collectionAsset) {
			return assets;
		}

		if (collectionAsset.items.length === 1) {
			return assets.filter((item) => item != collectionAsset);
		} else {
			return assets.map((asset) => {
				if (asset !== collectionAsset) {
					return asset;
				} else {
					return {
						...asset,
						items: asset.items.filter(
							(nft) => nft.address !== address
						),
					};
				}
			});
		}
	});
};
