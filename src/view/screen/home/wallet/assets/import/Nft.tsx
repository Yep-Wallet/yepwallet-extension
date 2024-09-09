import { Address, Cell, NftData } from "@yepwallet/web-sdk";
import BN from "bn.js";
import { useContext, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import {
	NftCollectionState,
	NftItemState,
} from "../../../../../../libs/entries/asset";
import {
	Body,
	ButtonColumn,
	ButtonPositive,
	ErrorMessage,
	Gap,
} from "../../../../../components/Components";
import { Dots } from "../../../../../components/Dots";
import { HomeButton } from "../../../../../components/HomeButton";
import { InputField } from "../../../../../components/InputField";
import { NftPayload } from "../../../../../components/NftPayload";
import { NetworkContext, WalletStateContext } from "../../../../../context";
import { AppRoute } from "../../../../../routes";
import {
	useAddNftMutation,
	useDomainNftMutation,
	useNftApiMutation,
	useNftConllectionApiMutation,
} from "./api";
import { AssetsTabs } from "./Tabs";

const Block = styled.div`
	padding-top: ${(props) => props.theme.padding};
`;

export const ImportNft = () => {
	const navigate = useNavigate();

	const network = useContext(NetworkContext);
	const wallet = useContext(WalletStateContext);

	const [nftData, setNftData] = useState<NftData | null>(null);
	const [nftState, setNftState] = useState<NftItemState | null>(null);
	const [nftCollectionState, setNftCollectionState] =
		useState<NftCollectionState | null>(null);

	const [address, setAddress] = useState("");
	const {
		mutateAsync: nftAsync,
		reset,
		error: nftDataError,
		isLoading: isNftLoading,
	} = useNftApiMutation();
	const {
		mutateAsync: nftCollectionStateAsync,
		error: nftCollectionError,
		isLoading: isCollectionLoading,
	} = useNftConllectionApiMutation();

	const {
		mutateAsync: domainNftStateAsync,
		error: domainNftError,
		isLoading: isDomainLoading,
	} = useDomainNftMutation();

	const {
		mutateAsync: addNftAsync,
		error: addNftError,
		reset: resetAdd,
		isLoading: isAddLoading,
	} = useAddNftMutation();

	const isLoading = isNftLoading || isCollectionLoading || isDomainLoading;

	const isOwnNft = useMemo(() => {
		if (!nftData) return false;

		const walletAddress = new Address(wallet.address).toString(
			true,
			true,
			true,
			network === "testnet"
		);
		const nftOwner = nftData.ownerAddress?.toString(
			true,
			true,
			true,
			network === "testnet"
		);
		return walletAddress == nftOwner;
	}, [wallet, nftData]);

	const onSearch = async () => {
		reset();

		const data = await nftAsync(address);
		if (data) {
			const nftData: NftData = {
				isInitialized: true,
				index: data.index,
				itemIndex: new BN(data.index),
				collectionAddress:
					data.collection && data.collection.address
						? new Address(data.collection.address)
						: null,
				ownerAddress:
					data.owner && data.owner.address
						? new Address(data.owner.address)
						: null,
				contentCell: new Cell(),
				contentUri: null,
			};

			setNftData(nftData);

			const metadata = data.metadata;

			if (data.previews && data.previews.length > 0) {
				const url = data.previews[data.previews.length - 1].url;
				if (url)
					metadata.image =
						data.previews[data.previews.length - 1].url;
			}

			setNftState(metadata);
		}

		if (data.collection && data.collection.address) {
			const res = await nftCollectionStateAsync(data.collection.address);

			const collection: NftCollectionState = {
				name: res.metadata.name,
				description: res.metadata.description,
				image: res.metadata.image,
			};

			if (res.previews && res.previews.length > 0) {
				const url = res.previews[res.previews.length - 1].url;
				if (url)
					collection.image =
						res.previews[res.previews.length - 1].url;
			}

			setNftCollectionState(collection);

			const state = await domainNftStateAsync({
				collection,
				address: address,
			});
			if (state) setNftState(state);
		}
	};

	const onAdd = async () => {
		resetAdd();

		if (!isOwnNft || !nftData) {
			return;
		}

		await addNftAsync({
			nftAddress: address,
			nftData,
			state: nftState,
			collection: nftCollectionState,
		});

		navigate(AppRoute.home);
	};

	const Button = () => {
		if (isLoading || isAddLoading) {
			return (
				<ButtonPositive disabled={true}>
					<Dots>Loading</Dots>
				</ButtonPositive>
			);
		}
		if (nftData == null) {
			return <ButtonPositive onClick={onSearch}>Search</ButtonPositive>;
		}

		if (!isOwnNft) {
			return (
				<ButtonPositive disabled={true}>Another's NFT</ButtonPositive>
			);
		}

		return <ButtonPositive onClick={onAdd}>Add NFT</ButtonPositive>;
	};

	return (
		<>
			<HomeButton />
			<AssetsTabs />
			<Body>
				<InputField
					label="NFT Contract address"
					value={address}
					onChange={(e) => setAddress(e.target.value)}
					onBlur={onSearch}
					disabled={nftData != null}
				/>

				{nftData && !isLoading && (
					<Block>
						<NftPayload state={nftState} />
					</Block>
				)}

				{nftDataError && (
					<ErrorMessage>{nftDataError.message}</ErrorMessage>
				)}
				{nftCollectionError && (
					<ErrorMessage>{nftCollectionError.message}</ErrorMessage>
				)}
				{addNftError && (
					<ErrorMessage>{addNftError.message}</ErrorMessage>
				)}
				{domainNftError && (
					<ErrorMessage>{domainNftError.message}</ErrorMessage>
				)}

				<Gap />
				<ButtonColumn style={{ gap: 15 }}>
					<Button />
				</ButtonColumn>
			</Body>
		</>
	);
};
