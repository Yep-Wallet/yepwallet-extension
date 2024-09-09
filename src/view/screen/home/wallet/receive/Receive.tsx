import { RightOutlined } from "@ant-design/icons";
import { Address, formatTransferUrl } from "@yepwallet/web-sdk";
import { message } from "antd";
import { FC, useContext } from "react";
import QRCode from "react-qr-code";
import { Route, Routes, useNavigate } from "react-router-dom";
import styled from "styled-components";
import ExtensionPlatform from "../../../../../libs/service/extension";
import {
	ButtonColumn,
	ButtonPositive,
	Container,
} from "../../../../components/Components";
import { HomeButton } from "../../../../components/HomeButton";
import { CheckIcon, CopyIcon, TonIcon } from "../../../../components/Icons";
import {
	NetworkContext,
	WalletAddressContext,
	WalletStateContext,
} from "../../../../context";
import { useCopyToClipboard } from "../../../../hooks/useCopyToClipbpard";

const Body = styled(Container)`
	width: 100%;
	flex-grow: 1;
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
`;

enum ReceiveRoutes {
	index = "/",
	ton = "/ton",
}

export const Source = styled.div`
	padding: 22px 15px 29px 22px;
	display: flex;
	flex-direction: row;
	justify-content: space-between;
	gap: 60px;
	align-items: center;
	&:hover {
		background: #ffeeb9 !important;
	}
`;

const Row = styled.div`
	display: flex;
	gap: 1rem;
	align-items: center;
	padding-bottom: 0.5rem;
`;

export const SubTitle = styled.div`
	color: #000;
	text-align: center;
	font-family: Poppins;
	font-size: 16px;
	font-style: normal;
	font-weight: 600;
	line-height: normal;
`;

const ChangeHero = styled.div`
	background: #2f92f6;
	border-radius: 5px;
	padding: 5px;
`;

export const SourceBodyWrapper = styled.div`
	width: 100%;
	border-radius: 15px;
	background: #fbfaf4;
	overflow: hidden;
	display: flex;
	flex-direction: column;
	margin-bottom: 30px;
`;

export const SourceText = styled.div`
	color: #000;
	font-family: Poppins;
	font-size: 12px;
	font-style: normal;
	font-weight: 400;
	line-height: normal;
`;

const ImageIcon = styled.div`
	font-size: 28px;
	line-height: 22px;
`;

const ReceiveIndex = () => {
	const navigate = useNavigate();
	const wallet = useContext(WalletStateContext);
	const network = useContext(NetworkContext);
	const address = new Address(wallet.address).toString(true, true, true);
	return (
		<SourceBodyWrapper>
			<Source
				style={{
					borderBottom: "1px solid rgba(79, 90, 112, 0.24)",
				}}
				onClick={() => {
					if (network != "mainnet") {
						message.error("Please switch to mainnet!");
					} else {
						ExtensionPlatform.openTab({
							url: `https://neocrypto.net`,
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
							src="https://neocrypto.net/images/logo.svg"
							width="32"
							height="32"
							alt="NeoCrypto Logo"
						/>
						<SubTitle>NeoCrypto</SubTitle>
					</Row>
					<SourceText>
						Why bother going through complicated exchanges? By
						making a simple purchase with your bank card, you can
						buy Toncoin or any other cryptocurrency directly to your
						personal wallet without making any initial deposits.
					</SourceText>
				</div>
				<RightOutlined />
			</Source>
			<Source
				style={{
					borderBottom: "1px solid rgba(79, 90, 112, 0.24)",
				}}
				onClick={() => {
					if (network != "mainnet") {
						message.error("Please switch to mainnet!");
					} else {
						ExtensionPlatform.openTab({
							url: `https://www.moonpay.com/buy`,
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
							src="https://www.moonpay.com/assets/logo-full-black-n.svg"
							height="30"
						/>
					</Row>
					<SourceText>
						MoonPay users can easily buy cryptocurrencies with
						credit card, bank transfers, Apple Pay, or Google Pay..
					</SourceText>
				</div>
				<RightOutlined />
			</Source>
			<Source
				style={{
					borderBottom: "1px solid rgba(79, 90, 112, 0.24)",
				}}
				onClick={() => {
					if (network != "mainnet") {
						message.error("Please switch to mainnet!");
					} else {
						ExtensionPlatform.openTab({
							url: `https://guardarian.com/buy-ton`,
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
							src="https://guardarian.com/_next/static/media/main-logo-dark.5f4d2bf1.svg"
							height="20"
						/>
					</Row>
					<SourceText>
						Guardarian offers the most user-friendly environment for
						purchasing Toncoin. Discover the best EUR to TON and USD
						to TON exchange rate at Guardarian.com
					</SourceText>
				</div>
				<RightOutlined />
			</Source>
			<Source onClick={() => navigate(`.${ReceiveRoutes.ton}`)}>
				<div
					style={{
						display: "flex",
						flexDirection: "column",
						gap: 11,
					}}
				>
					<Row style={{ alignItems: "center" }}>
						<ImageIcon>
							<TonIcon />
						</ImageIcon>
						<SubTitle>Directly deposit TON</SubTitle>
					</Row>
					<SourceText>
						If you already have some TON, the quickest way to get
						TON in your new wallet by direct deposit.
					</SourceText>
				</div>
				<RightOutlined />
			</Source>
		</SourceBodyWrapper>
	);
};

const TextRow = styled.div`
	color: #8a8a8a;
	text-align: center;
	font-family: Poppins;
	font-size: 12px;
	font-style: normal;
	font-weight: 500;
	line-height: normal;
	text-transform: capitalize;
`;

const AddressRow = styled.div`
	cursor: pointer;
	width: 100%;
	word-break: break-all;
	color: #6d6d6d;
	text-align: center;
	font-family: Poppins;
	font-size: 12px;
	font-style: normal;
	font-weight: 500;
	line-height: normal;
	text-transform: capitalize;
`;

const Block = styled.div`
	padding: 5px;
	margin: 0 auto;
`;

interface ReceiveProps {
	symbol?: string;
}

const Title = styled.div`
	color: #000;
	text-align: center;
	font-family: Poppins;
	font-size: 22px;
	font-style: normal;
	font-weight: 600;
	line-height: normal;
	text-transform: capitalize;
`;

const Card = styled.div`
	width: 177px;
	height: auto;
	box-sizing: border-box;
	padding: 10px;
	flex-shrink: 0;
	border-radius: 20px;
	background: #fff;
	box-shadow: 0px 1px 40px 0px rgba(119, 119, 119, 0.11);
`;
export const ReceiveCoin: FC<ReceiveProps> = ({ symbol = "TON" }) => {
	const address = useContext(WalletAddressContext);
	const [copied, handleCopy] = useCopyToClipboard();

	return (
		<ButtonColumn
			style={{ alignItems: "center", justifyContent: "center" }}
		>
			<Title>Receive {symbol}</Title>

			<TextRow style={{ width: 280, margin: "0 auto" }}>
				Share this address to receive {symbol} in The Open Network
			</TextRow>
			<Card style={{ marginTop: 10 }}>
				{symbol === "TON" && (
					<Block>
						<QRCode size={150} value={formatTransferUrl(address)} />
					</Block>
				)}
				<AddressRow onClick={() => handleCopy(address)}>
					{address}
				</AddressRow>
			</Card>

			<ButtonPositive
				style={{ width: 172, marginTop: 10 }}
				onClick={() => handleCopy(address)}
			>
				{copied ? <CheckIcon /> : <CopyIcon />} copy address
			</ButtonPositive>
		</ButtonColumn>
	);
};

export const ReceiveTonPage = () => {
	return (
		<>
			<HomeButton />
			<Body>
				<ReceiveCoin />
			</Body>
		</>
	);
};

export const ReceiveRouter = () => {
	return (
		<>
			<HomeButton />
			<Body>
				<Routes>
					<Route path={ReceiveRoutes.ton} element={<ReceiveCoin />} />
					<Route
						path={ReceiveRoutes.index}
						element={<ReceiveIndex />}
					/>
				</Routes>
			</Body>
		</>
	);
};
