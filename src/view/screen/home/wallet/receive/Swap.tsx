import { RightOutlined } from "@ant-design/icons";
import { message } from "antd";
import { useContext } from "react";
import styled from "styled-components";
import ExtensionPlatform from "../../../../../libs/service/extension";
import { Container } from "../../../../components/Components";
import { HomeButton } from "../../../../components/HomeButton";
import { NetworkContext } from "../../../../context";
import { Dedust } from "./Icons";
import { Source, SourceBodyWrapper, SourceText, SubTitle } from "./Receive";

const Body = styled(Container)`
	width: 100%;
	flex-grow: 1;
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
`;

const Row = styled.div`
	display: flex;
	gap: 1rem;
	align-items: center;
	padding-bottom: 0.5rem;
`;

const ChangeHero = styled.div`
	background: #2f92f6;
	border-radius: 5px;
	padding: 5px;
`;

const SwapIndex = () => {
	const network = useContext(NetworkContext);

	return (
		<SourceBodyWrapper>
			<Source
				style={{
					borderBottom: "1px solid rgba(79, 90, 112, 0.24)",
				}}
				onClick={() =>
					ExtensionPlatform.openTab({
						url: `https://dedust.io/dex/swap?utm_source=yepwallet.xyz`,
					})
				}
			>
				<div
					style={{
						display: "flex",
						flexDirection: "column",
						gap: 11,
					}}
				>
					<Row>
						<Dedust />
						<SubTitle>DeDust.io</SubTitle>
					</Row>
					<SourceText>
						The first and folk DEX in The Open Network. The service
						allows to swap TON to oUSDT, oUSDC and other altcoins.
					</SourceText>
				</div>
				<RightOutlined />
			</Source>
			<Source
				style={{
					borderBottom: "1px solid rgba(79, 90, 112, 0.24)",
				}}
				onClick={() =>
					ExtensionPlatform.openTab({
						url: `https://app.ston.fi/swap?utm_source=yepwallet.xyz`,
					})
				}
			>
				<div
					style={{
						display: "flex",
						flexDirection: "column",
						gap: 11,
					}}
				>
					<Row>
						<img
							src="https://static.ston.fi/favicon/favicon-32x32.png"
							width="30"
						/>
						<SubTitle>ston.fi</SubTitle>
					</Row>
					<SourceText>An AMM DEX for the TON blockchain</SourceText>
				</div>
				<RightOutlined />
			</Source>
			<Source
				onClick={() => {
					if (network != "mainnet") {
						message.error("Please switch to mainnet!");
					} else {
						ExtensionPlatform.openTab({
							url: `https://ton.diamonds/dex/swap`,
						});
					}
				}}
			>
				<div
					style={{
						display: "flex",
						flexDirection: "column",
						gap: 11,
					}}
				>
					<Row>
						<img
							src="https://ton.diamonds/images/icons/diamond-logo-32x32.svg"
							height="30"
						/>

						<SubTitle>TON Diamonds</SubTitle>
					</Row>
					<SourceText>
						Trade on TON with TON Diamonds DEX Aggregator, uniting
						Ston.fi & DeDust. Efficient token trading with top
						prices.
					</SourceText>
				</div>
				<RightOutlined />
			</Source>
		</SourceBodyWrapper>
	);
};

export const SwapRouter = () => {
	return (
		<>
			<HomeButton />
			<Body>
				<SwapIndex />
			</Body>
		</>
	);
};
