import { Address } from "@ton/core";
import BigNumber from "bignumber.js";
import React, { FC, useContext, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { JettonAsset, NftAsset } from "../../../../../libs/entries/asset";
import { AppStock, DexStocks } from "../../../../../libs/entries/stock";
import { getWalletAssets } from "../../../../../libs/entries/wallet";
import { seeIfJettonAsset } from "../../../../../libs/state/assetService";
import { AssetItemView, AssetJettonView } from "../../../../components/Asset";
import {
	AText,
	Center,
	DefaultTxt,
	InlineButtonLink,
} from "../../../../components/Components";
import { TonIcon } from "../../../../components/Icons";
import { WalletStateContext } from "../../../../context";
import { AppRoute } from "../../../../routes";
import { useJettonWalletBalance } from "./api";
import { AssetRoutes } from "./route";

const FooterA = styled.div`
	width: 100%;
	display: flex;
	flex-direction: row;
	align-items: center;
	justify-content: center;
	padding-bottom: 11px;
`;

const JettonRowView: FC<{
	asset: JettonAsset;
	stocks?: DexStocks;
	tonPrice?: number;
}> = React.memo(({ asset, stocks, tonPrice }) => {
	const navigate = useNavigate();
	const { data } = useJettonWalletBalance(asset);

	const jettonStocks = useMemo(() => {
		const result = [] as AppStock[];
		try {
			if (stocks) {
				const stockD: AppStock | undefined =
					stocks.dedust[
						Address.parse(asset.minterAddress).toString()
					];
				if (stockD) {
					result.push(stockD);
				}

				const stockS: AppStock | undefined =
					stocks.ston[Address.parse(asset.minterAddress).toString()];
				if (stockS) {
					result.push(stockS);
				}
			}
		} catch (e) {
			console.error(e);
		}

		return result;
	}, [stocks, asset]);

	const price = useMemo(() => {
		const [stock] = jettonStocks;
		if (!stock || !tonPrice) return undefined;
		return new BigNumber(stock.price).multipliedBy(tonPrice).toNumber();
	}, [tonPrice, jettonStocks]);

	return (
		<AssetJettonView
			name={asset.state.symbol}
			logoUrl={asset.state.image}
			decimals={
				asset.state.decimals
					? parseInt(asset.state.decimals)
					: undefined
			}
			balance={data}
			price={price}
			stocks={jettonStocks}
			onShow={() =>
				navigate(
					AppRoute.assets +
						AssetRoutes.jettons +
						"/" +
						encodeURIComponent(asset.minterAddress)
				)
			}
		/>
	);
});

const NftRowView: FC<{ asset: NftAsset }> = React.memo(({ asset }) => {
	const navigate = useNavigate();
	const name = useMemo(() => {
		if (asset.state?.name) {
			return asset.state?.name!;
		}

		const item = asset.items.find((item) => item.state?.name);
		if (item) {
			return item.state?.name!;
		}

		return "Unknown";
	}, [asset]);

	const logoUrl = useMemo(() => {
		if (asset.state?.image) {
			return asset.state?.image;
		}
		const item = asset.items.find(
			(item) => item.state && "image" in item.state
		);
		if (item) {
			return (
				(item.state && "image" in item.state && item.state.image) ||
				undefined
			);
		}
		return undefined;
	}, [asset]);

	const url = useMemo(() => {
		const collection =
			AppRoute.assets +
			AssetRoutes.nfts +
			"/" +
			encodeURIComponent(asset.collectionAddress);

		if (asset.items.length !== 1) {
			return collection;
		}

		return collection + "/" + encodeURIComponent(asset.items[0].address);
	}, [asset]);

	return (
		<AssetItemView
			name={name}
			logoUrl={logoUrl}
			onShow={() => navigate(url)}
		/>
	);
});

export const AssetsList: FC<{
	balance?: string;
	price?: number;
	stocks?: DexStocks;
}> = ({ balance, price, stocks }) => {
	const navigate = useNavigate();
	const wallet = useContext(WalletStateContext);

	const assets = useMemo(() => getWalletAssets(wallet), [wallet]);

	return (
		<>
			<AssetJettonView
				name="TON"
				logo={<TonIcon />}
				balance={balance}
				price={price}
			/>
			{assets.map((asset) =>
				seeIfJettonAsset(asset) ? (
					<JettonRowView
						asset={asset}
						stocks={stocks}
						tonPrice={price}
					/>
				) : (
					<NftRowView asset={asset} />
				)
			)}
			{/* <Gap /> */}
			<Center>
				<FooterA style={{ marginTop: 20 }}>
					<DefaultTxt fontSize={"12px"}>
						Don't see your tokens?
					</DefaultTxt>

					<InlineButtonLink
						onClick={() =>
							navigate(AppRoute.assets + AssetRoutes.jettons)
						}
					>
						<AText>Import Token</AText>
					</InlineButtonLink>
				</FooterA>
				{/* <Text>
          Need help?{" "}
          <InlineButtonLink
            onClick={() => {
              ExtensionPlatform.openTab({
                url: `${packageJson.repository}/issues`,
              });
            }}
          >
            Contact us! <LinkIcon />
          </InlineButtonLink>
        </Text> */}
			</Center>
		</>
	);
};
