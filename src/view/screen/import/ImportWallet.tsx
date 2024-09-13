import { useState } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import {
	ButtonBottomRow,
	ButtonNegative,
	ButtonPositive,
	ErrorMessage,
} from "../../components/Components";
import { CheckIcon, CloseIcon } from "../../components/Icons";
import { AppRoute, relative } from "../../routes";
import { useImportWalletMutation } from "./api";
import {
	BodyWrapper,
	CreateH1,
	CreateText,
	ErrorMessageTxt,
	MnemonicBlock,
} from "./CreateWallet";

enum ImportRoutes {
	index = "/",
	mnemonic = "/mnemonic",
}

const ImportMnemonic = () => {
	const navigate = useNavigate();

	const { mutateAsync, isLoading, reset, error } = useImportWalletMutation();
	const [value, setValue] = useState("");

	const onConnect = async () => {
		reset();
		await mutateAsync(value);
		navigate(AppRoute.home);
	};

	return (
		<BodyWrapper>
			<CreateH1>Import existing wallet</CreateH1>
			<CreateText>
				To connect wallet, please enter your mnemonic here
			</CreateText>
			<CreateText>
				24 words separated by a space: thought borrow spend aisle....
			</CreateText>
			<MnemonicBlock
				id="MnemonicBlock"
				contentEditable="plaintext-only"
				onBlur={(t) => {
					let dom = document.getElementById("MnemonicBlock");

					if (dom) {
						// 获取纯文本内容
						const textContent =
							dom.innerText || dom.textContent || "";

						console.log("textContent", dom, textContent);

						// 设置值
						!isLoading && setValue(textContent);
					}
				}}
			>
				{value}
			</MnemonicBlock>
			{error && (
				<ErrorMessage>
					<ErrorMessageTxt>{error.message}</ErrorMessageTxt>
				</ErrorMessage>
			)}
			<ButtonBottomRow style={{ marginTop: "20px", gap: 5 }}>
				<ButtonNegative
					disabled={isLoading}
					onClick={() => navigate(AppRoute.home)}
				>
					Cancel
				</ButtonNegative>
				<ButtonPositive disabled={isLoading} onClick={onConnect}>
					Connect
				</ButtonPositive>
			</ButtonBottomRow>
		</BodyWrapper>
	);
};

const ImportIndex = () => {
	const navigate = useNavigate();
	return (
		<BodyWrapper>
			<CreateH1>Get Started with YepWallet</CreateH1>

			<div
				style={{ display: "flex", flexDirection: "column", gap: "5px" }}
			>
				<CreateText style={{ textAlign: "left" }}>
					YepWallet is open source software, you may alway check code
					on a GitHub. Wallet is not profitable, don't charge any
					commission for transactions and store all user data on a
					user device.
				</CreateText>
				<CreateText style={{ textAlign: "left" }}>
					<CheckIcon /> YepWallet <b>Always</b> connecting you to The
					Open Network and the decentralized web
				</CreateText>
				<CreateText style={{ textAlign: "left" }}>
					<CloseIcon /> YepWallet <b>Never</b> collect keys,
					addresses, transactions, balances, hashes, or any personal
					information
				</CreateText>
			</div>

			<ButtonBottomRow style={{ marginTop: "20px", gap: 5 }}>
				<ButtonNegative onClick={() => navigate(AppRoute.home)}>
					No Thanks
				</ButtonNegative>
				<ButtonPositive
					onClick={() => navigate(relative(ImportRoutes.mnemonic))}
				>
					Input Mnemonic
				</ButtonPositive>
			</ButtonBottomRow>
		</BodyWrapper>
	);
};

export const Import = () => {
	return (
		<Routes>
			<Route path={ImportRoutes.mnemonic} element={<ImportMnemonic />} />
			<Route path={ImportRoutes.index} element={<ImportIndex />} />
		</Routes>
	);
};
