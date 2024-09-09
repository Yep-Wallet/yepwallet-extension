import { Address, Cell, NftData } from "@yepwallet/web-sdk";
import BN from "bn.js";
import {
	FC,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
} from "react";
import {
	NftCollectionState,
	NftItemState,
	NftParams,
} from "../../../../libs/entries/asset";
import { NotificationFields } from "../../../../libs/event";
import {
	Body,
	ButtonNegative,
	ButtonPositive,
	ButtonRow,
	Center,
	ErrorMessage,
	Gap,
	H1,
	Text,
} from "../../../components/Components";
import { DAppBadge } from "../../../components/DAppBadge";
import { NftPayload } from "../../../components/NftPayload";
import { WalletStateContext } from "../../../context";
import { sendBackground } from "../../../event";
import {
	useAddNftMutation,
	useDomainNftMutation,
	useNftApiMutation,
	useNftConllectionApiMutation,
} from "../../home/wallet/assets/import/api";
import { Loading, NotificationView } from "../../Loading";

export const ImportNft: FC<
	NotificationFields<"importNft", NftParams> & {
		onClose: () => void;
	}
> = ({ id, logo, origin, data: params, onClose }) => {
	const wallet = useContext(WalletStateContext);

	const [nftData, setNftData] = useState<NftData | null>(null);
	const [nftState, setNftState] = useState<NftItemState | null>(null);
	const [nftCollectionState, setNftCollectionState] =
		useState<NftCollectionState | null>(null);

	const { mutateAsync: nftAsync, isLoading: isNftLoading } =
		useNftApiMutation();

	const {
		mutateAsync: nftCollectionStateAsync,
		isLoading: isCollectionLoading,
	} = useNftConllectionApiMutation();

	const {
		mutateAsync: addNftAsync,
		reset: resetAdd,
		isLoading: isAddLoading,
	} = useAddNftMutation();

	const { mutateAsync: domainNftStateAsync, isLoading: isDomainLoading } =
		useDomainNftMutation();

	useEffect(() => {
		(async () => {
			const data = await nftAsync(params.address);
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
				const res = await nftCollectionStateAsync(
					data.collection.address
				);

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
					address: params.address,
				});
				if (state) setNftState(state);
			}
		})();
	}, []);

	const isLoading = isNftLoading || isCollectionLoading || isDomainLoading;

	const isOwnNft = useMemo(() => {
		if (!nftData) return false;

		const walletAddress = new Address(wallet.address).toString(
			true,
			true,
			true
		);
		const nftOwner = nftData.ownerAddress?.toString(true, true, true);
		return walletAddress == nftOwner;
	}, [wallet, nftData]);

	const onAdd = async () => {
		resetAdd();

		if (!isOwnNft || !nftData) {
			return;
		}

		await addNftAsync({
			nftAddress: params.address,
			nftData,
			state: nftState,
			collection: nftCollectionState,
		});

		sendBackground.message("approveRequest", { id, payload: undefined });
		onClose();
	};

	const onBack = useCallback(() => {
		sendBackground.message("rejectRequest", id);
		onClose();
	}, [id]);

	if (isLoading) {
		return <Loading />;
	}

	if (nftData == null) {
		return (
			<NotificationView button="Close" action={onBack}>
				<ErrorMessage>NFT Data is not define</ErrorMessage>
			</NotificationView>
		);
	}

	return (
		<Body>
			<Center>
				<DAppBadge logo={logo} origin={origin} />
				<H1>Add Suggested NFT</H1>
				<Text>Would you like to import these NFT?</Text>
			</Center>

			<NftPayload state={nftState} />

			<Gap />
			<ButtonRow style={{ gap: 5 }}>
				<ButtonNegative onClick={onBack} disabled={isLoading}>
					Cancel
				</ButtonNegative>
				<ButtonPositive
					onClick={onAdd}
					disabled={isLoading || isAddLoading || !isOwnNft}
				>
					{isOwnNft ? "Add NFT" : "Another's NFT"}
				</ButtonPositive>
			</ButtonRow>
		</Body>
	);
};
