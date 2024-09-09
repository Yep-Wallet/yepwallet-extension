import { ALL } from "@yepwallet/web-sdk";
import { useContext, useState } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import styled, { css } from "styled-components";
import { WalletState, WalletVersion } from "../../../../../libs/entries/wallet";
import { decryptMnemonic } from "../../../../../libs/state/accountService";
import { getWebAuthnPassword } from "../../../../api";
import {
	ButtonColumn,
	ButtonNegative,
	ButtonPositive,
	ButtonRow,
	ErrorMessage,
	Gap,
} from "../../../../components/Components";
import { DropDownList } from "../../../../components/DropDown";
import { HomeButton } from "../../../../components/HomeButton";
import {
	ArrowDownIcon,
	DeleteIcon,
	FingerprintIcon,
} from "../../../../components/Icons";
import { InputField } from "../../../../components/InputField";
import { WalletStateContext } from "../../../../context";
import { AppRoute, relative } from "../../../../routes";
import {
	BodyWrapper,
	CreateH1,
	CreateText,
} from "../../../import/CreateWallet";
import { useAuthConfiguration } from "../../../settings/api";
import { LedgerSettings } from "./LedgerSettings";
import { useDeleteWalletMutation, useUpdateWalletMutation } from "./api";
import { WalletRoutes } from "./route";

const MnemonicBlock = styled.div`
	background-color: light-dark(
		rgba(239, 239, 239, 0.3),
		rgba(59, 59, 59, 0.3)
	);
	color: light-dark(rgb(84, 84, 84), rgb(170, 170, 170));
	border-color: rgba(118, 118, 118, 0.3);
	padding: 10px;
	margin-bottom: 15px;
	height: 100px;
	border: 1px solid;
`;

export const InputWrapper = styled.div`
	border-radius: 18px;
	background: #f4f4f4;
	border: 1px solid #f4f4f4;
	width: 100%;
	min-height: 56px;
	flex-shrink: 0;
	/* padding: 8px 18px; */
	box-sizing: border-box;
	display: flex;
	flex-direction: column;
	position: relative;
	&:hover {
		border: 1px solid #ffd93b;
	}
`;
export const InputWrapperLabel = styled.div`
	color: #a2a2a2;
	font-family: Poppins;
	font-size: 14px;
	font-style: normal;
	font-weight: 400;
	line-height: normal;
	text-transform: capitalize;
	position: absolute;
	top: -1px;
	left: 9px;
	background: #fff;
	border-radius: 10px;
	height: 3px;
	display: flex;
	align-items: center;
`;

export const InputWrapperSelectPayload = styled.div<{ disabled?: boolean }>`
	padding: 5px 0px;
	border-bottom: 0px;
	width: 100%;
	display: flex;
	justify-content: space-between;
	box-sizing: border-box;

	${(props) =>
		props.disabled &&
		css`
			opacity: 0.5;
		`}
`;

const SettingsIndex = () => {
	const navigate = useNavigate();
	const wallet = useContext(WalletStateContext);

	const [name, setName] = useState(wallet.name);

	const { mutateAsync, reset } = useUpdateWalletMutation();
	const onChange = async (fields: Partial<WalletState>) => {
		reset();
		await mutateAsync(fields);
	};

	return (
		<>
			<HomeButton />
			<BodyWrapper style={{ marginBottom: 30 }}>
				<CreateH1>Wallet Settings</CreateH1>

				<ButtonColumn style={{ gap: 15 }}>
					<InputField
						label={`Wallet Name`}
						value={name}
						onChange={(e) => setName(e.target.value)}
						onBlur={() => {
							onChange({ name });
						}}
					/>

					<InputWrapper>
						<InputWrapperLabel>Version</InputWrapperLabel>
						<DropDownList
							isLeft
							options={Object.keys(ALL)}
							renderOption={(value) => value}
							onSelect={(version) =>
								onChange({ version: version as WalletVersion })
							}
						>
							<InputWrapperSelectPayload>
								{wallet.version} <ArrowDownIcon />
							</InputWrapperSelectPayload>
						</DropDownList>
					</InputWrapper>
				</ButtonColumn>

				<ButtonNegative
					onClick={() => navigate(relative(WalletRoutes.mnemonic))}
				>
					Reveal Secret Recovery Phrase
				</ButtonNegative>

				<ButtonNegative
					onClick={() => navigate(relative(WalletRoutes.delete))}
				>
					Delete Wallet <DeleteIcon />
				</ButtonNegative>
			</BodyWrapper>
		</>
	);
};

const SettingsMnemonic = () => {
	const navigate = useNavigate();

	const wallet = useContext(WalletStateContext);

	const [value, setValue] = useState("");
	const [mnemonic, setMnemonic] = useState("");
	const [error, setError] = useState(false);

	const { data } = useAuthConfiguration();
	const isWebAuth = data?.kind == "webauthn";

	const isShow = mnemonic !== "";

	const onNext = async () => {
		if (isShow) return;

		try {
			if (isWebAuth) {
				getWebAuthnPassword(async (password) => {
					setMnemonic(
						await decryptMnemonic(wallet.mnemonic, password)
					);
				});
			} else {
				setMnemonic(await decryptMnemonic(wallet.mnemonic, value));
			}
		} catch (e) {
			setError(true);
		}
	};

	return (
		<BodyWrapper>
			<CreateH1>Secret Recovery Phrase</CreateH1>
			<CreateText>
				If you ever change browsers or move computers, you will need
				this Secret Recovery Phrase to access your wallet. Save them
				somewhere safe and secret.
			</CreateText>
			<ErrorMessage>
				DO NOT share this phrase with anyone! These words can be used to
				steal your wallet.
			</ErrorMessage>
			{isShow ? (
				<MnemonicBlock>{mnemonic}</MnemonicBlock>
			) : !isWebAuth ? (
				<InputField
					error={error ? new Error("Invalid Password") : null}
					type="password"
					value={value}
					onChange={(e: any) => setValue(e.target.value)}
					label="Enter password to continue"
				></InputField>
			) : undefined}

			<Gap />
			<ButtonRow style={{ gap: 5 }}>
				<ButtonNegative onClick={() => navigate(AppRoute.wallet)}>
					Cancel
				</ButtonNegative>
				<ButtonPositive onClick={onNext} disabled={isShow}>
					Show {isWebAuth && <FingerprintIcon />}
				</ButtonPositive>
			</ButtonRow>
		</BodyWrapper>
	);
};

const SettingsDelete = () => {
	const navigate = useNavigate();
	const { mutateAsync, isLoading } = useDeleteWalletMutation();

	const onDelete = async () => {
		await mutateAsync();
		navigate(AppRoute.home);
	};

	return (
		<BodyWrapper>
			<CreateH1>Delete Wallet</CreateH1>
			<CreateText>
				Deleting your wallet will clear all local stored data.
			</CreateText>
			<CreateText>
				The wallet could be re-enter by Secret Recovery Phrase.
			</CreateText>
			<CreateText>
				YepWallet team cannot recover your wallet Secret Recovery
				Phrase.
			</CreateText>
			<Gap />
			<ButtonRow style={{ gap: 5 }}>
				<ButtonNegative
					onClick={() => navigate(AppRoute.wallet)}
					disabled={isLoading}
				>
					Cancel
				</ButtonNegative>
				<ButtonPositive onClick={onDelete} disabled={isLoading}>
					Delete
				</ButtonPositive>
			</ButtonRow>
		</BodyWrapper>
	);
};

export const WalletSettings = () => {
	const wallet = useContext(WalletStateContext);

	return (
		<Routes>
			<Route
				path={WalletRoutes.mnemonic}
				element={<SettingsMnemonic />}
			/>
			<Route path={WalletRoutes.delete} element={<SettingsDelete />} />
			<Route
				path={WalletRoutes.index}
				element={wallet.ledger ? <LedgerSettings /> : <SettingsIndex />}
			/>
		</Routes>
	);
};
