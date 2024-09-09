import { RightOutlined } from "@ant-design/icons";
import { Route, Routes, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { HomeButton } from "../../components/HomeButton";
import { any, relative } from "../../routes";
import {
	Source,
	SourceBodyWrapper,
	SubTitle,
} from "../home/wallet/receive/Receive";
import { LedgerWallet } from "../ledger/LedgerHardwareWallet";
import { BodyWrapper, CreateH1 } from "./CreateWallet";

export enum HardwareRoutes {
	Ledger = "/Ledger",
	index = "/",
}

const Item = styled.div`
	color: ${(props) => props.theme.darkBlue};
	cursor: pointer;
	font-width: bold;
	padding: ${(props) => props.theme.padding} 0;
	border-bottom: 1px solid ${(props) => props.theme.darkGray};
	display: flex;
	justify-content: space-between;
	align-items: center;
`;

const HardwareIndex = () => {
	const navigator = useNavigate();

	return (
		<>
			<HomeButton />
			<BodyWrapper>
				<CreateH1>Connect Hardware Wallet</CreateH1>

				<SourceBodyWrapper>
					<Source
						style={{ background: "#FFEEB9" }}
						onClick={() =>
							navigator(relative(HardwareRoutes.Ledger))
						}
					>
						<div
							style={{
								display: "flex",
								flexDirection: "column",
								gap: 11,
							}}
						>
							<SubTitle>Ledger Hardware Wallet</SubTitle>
						</div>
						<RightOutlined />
					</Source>
				</SourceBodyWrapper>
				{/* <Item
					onClick={() => navigator(relative(HardwareRoutes.Ledger))}
				>
					<span>Ledger Hardware Wallet</span>
					<ArrowForwardIcon />
				</Item> */}
			</BodyWrapper>
		</>
	);
};

export const Hardware = () => {
	return (
		<Routes>
			<Route
				path={any(HardwareRoutes.Ledger)}
				element={<LedgerWallet />}
			/>
			<Route index element={<HardwareIndex />} />
		</Routes>
	);
};
