import { useState } from "react";
import styled, { css } from "styled-components";
import ExtensionPlatform from "../../../libs/service/extension";
import { ButtonColumn, Container } from "../../components/Components";
import { InputField } from "../../components/InputField";
import { LoadingLogo } from "../../components/Logo";
import { AppRoute } from "../../routes";
import { ConnectRoutes } from "../import/ConnectWallet";
import { BodyWrapper, CreateH1 } from "../import/CreateWallet";
import { useCreatePasswordMutation } from "./api";

const Body = styled(Container)`
	width: 100%;
	flex-grow: 1;
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
`;

const BodyH1 = styled(Container)`
	margin-top: 5px;
	color: #000;
	font-family: Poppins;
	font-size: 20px;
	font-style: normal;
	font-weight: 600;
	line-height: normal;
	margin-bottom: 22px;
	span {
		color: #fdbf00;
	}
`;

const ButtonPositive = styled.button<{ disabled?: boolean }>`
	border-radius: 16px;
	background: #1a202c;
	display: flex;
	width: 248px;
	margin: 0 auto;
	height: 56px;
	padding: 17px;
	justify-content: center;
	align-items: center;
	gap: 10px;
	align-self: stretch;
	cursor: pointer;
	color: #fff;
	text-align: center;
	font-family: Poppins;
	font-size: 14px;
	font-style: normal;
	font-weight: 400;
	line-height: normal;
	text-transform: capitalize;
	&:hover {
		background: #374151;
	}
`;

const ButtonNegative = styled.div`
	width: 248px;
	margin: 0 auto;
	border-radius: 16px;
	background: #fff6d9;
	display: flex;
	height: 56px;
	padding: 17px;
	justify-content: center;
	align-items: center;
	gap: 10px;
	align-self: stretch;
	cursor: pointer;
	color: #000;
	text-align: center;
	font-family: Poppins;
	font-size: 14px;
	font-style: normal;
	font-weight: 400;
	line-height: normal;
	text-transform: capitalize;
	box-sizing: border-box;
	&:hover {
		opacity: 0.9;
	}
	${(props: any) =>
		props.disabled &&
		css`
			opacity: 0.5;
		`}
`;

export const Initialize = () => {
	return (
		<Body>
			<LoadingLogo />

			<BodyH1>
				Welcome to <span>YepWallet</span>
			</BodyH1>
			<ButtonColumn style={{ gap: 15 }}>
				<ButtonPositive
					onClick={() =>
						ExtensionPlatform.openExtensionInBrowser(
							AppRoute.import + ConnectRoutes.create
						)
					}
				>
					Create Wallet
				</ButtonPositive>
				<ButtonNegative
					onClick={() =>
						ExtensionPlatform.openExtensionInBrowser(
							AppRoute.import + ConnectRoutes.import
						)
					}
				>
					Import Wallet
				</ButtonNegative>
			</ButtonColumn>
		</Body>
	);
};

export const CreatePassword = () => {
	const [password, setPassword] = useState("");
	const [confirm, setConfirm] = useState("");

	const { mutateAsync, reset, isLoading, error } =
		useCreatePasswordMutation();

	const onCreate = async () => {
		reset();
		await mutateAsync([password, confirm]);
	};

	return (
		<BodyWrapper style={{ alignItems: "center", justifyContent: "center" }}>
			<LoadingLogo />
			<CreateH1>Create Password</CreateH1>
			<ButtonColumn style={{ gap: 15 }}>
				<div>
					<InputField
						label="New password"
						type="password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
					/>
				</div>

				<div>
					<InputField
						label="Confirm password"
						type="password"
						value={confirm}
						onChange={(e) => setConfirm(e.target.value)}
						error={error}
					/>
				</div>

				<ButtonPositive
					style={{ marginTop: 12 }}
					onClick={onCreate}
					disabled={isLoading}
				>
					Create
				</ButtonPositive>
			</ButtonColumn>
		</BodyWrapper>
	);
};
