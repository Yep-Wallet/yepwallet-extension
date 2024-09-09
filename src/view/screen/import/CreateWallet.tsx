import { LeftCircleFilled } from "@ant-design/icons";
import React, { FC, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import * as tonMnemonic from "tonweb-mnemonic";
import {
	Body,
	ButtonColumn,
	ButtonNegative,
	ButtonPositive,
	ButtonRow,
	Container,
	ErrorMessage,
} from "../../components/Components";
import { InputField } from "../../components/InputField";
import { AppRoute } from "../../routes";
import { useCreateWalletMutation } from "./api";
export const MnemonicBlock = styled.div`
	border-radius: 18px;
	background: #f4f4f4;
	color: #000;
	font-family: Poppins;
	font-size: 12px;
	font-style: normal;
	font-weight: 500;
	line-height: normal;
	padding: 10px;
	height: 100px;
`;

export const MnemonicBlockTxt = styled.div`
	color: #a2a2a2;
	font-family: Poppins;
	font-size: 12px;
	font-style: normal;
	font-weight: 400;
	line-height: normal;
	text-transform: capitalize;
`;

export const ErrorMessageTxt = styled.div`
	color: #000;
	font-family: Poppins;
	font-size: 14px;
	font-style: normal;
	font-weight: 400;
	line-height: normal;
	text-transform: capitalize;
`;

export const CreateH1 = styled.div`
	color: #000;
	font-family: Poppins;
	font-size: 22px;
	font-style: normal;
	font-weight: 600;
	line-height: normal;
	text-transform: capitalize;
	text-align: center;
`;

export const CreateText = styled.div`
	color: #8a8a8a;
	text-align: center;
	font-family: Poppins;
	font-size: 16px;
	font-style: normal;
	font-weight: 500;
	line-height: normal;
	text-transform: capitalize;
`;

export const BodyWrapper = styled(Body)`
	gap: 18px;
`;
export const Create = () => {
	const navigate = useNavigate();
	const [mnemonic, setMnemonic] = useState("");
	const [test, setTest] = useState(false);
	const [show, setShow] = useState(false);

	const { mutateAsync, reset, isLoading } = useCreateWalletMutation();

	useEffect(() => {
		tonMnemonic
			.generateMnemonic()
			.then((words) => setMnemonic(words.join(" ")));
	}, []);

	const disabled = mnemonic === "" || isLoading;

	const onShow = () => {
		if (!show) {
			setShow(true);
			return;
		}
		setTest(true);
	};

	const onCreate = async () => {
		setTest(false);
		reset();
		await mutateAsync(mnemonic);
		navigate(AppRoute.home);
	};

	if (test) {
		return (
			<RememberMnemonic
				mnemonic={mnemonic}
				onConfirm={onCreate}
				onBack={() => setTest(false)}
			/>
		);
	}

	return (
		<BodyWrapper>
			<div>
				<CreateH1>Secret Recovery Phrase</CreateH1>
				<CreateText>
					Your Secret Recovery Phrase makes it easy to back up and
					restore your account.
				</CreateText>
			</div>

			<ErrorMessage>
				<ErrorMessageTxt>
					WARNING: Never disclose your Secret Recovery Phrase. Anyone
					with this phrase can take your crypto forever.
				</ErrorMessageTxt>
			</ErrorMessage>
			<div>
				<MnemonicBlock>{show ? mnemonic : ""}</MnemonicBlock>
				<div style={{ marginTop: "10px" }}>
					<MnemonicBlockTxt>
						YepWallet cannot recover your Secret Recovery Phrase.
					</MnemonicBlockTxt>
				</div>
			</div>

			<ButtonRow style={{ marginTop: "20px", gap: "5px" }}>
				<ButtonNegative
					disabled={isLoading}
					onClick={() => navigate(AppRoute.home)}
				>
					Cancel
				</ButtonNegative>
				<ButtonPositive disabled={disabled} onClick={onShow}>
					{show ? "Create" : "Show"}
				</ButtonPositive>
			</ButtonRow>
		</BodyWrapper>
	);
};

const Block = styled(Container)`
	width: 100%;
`;

type RememberProps = {
	mnemonic: string;
	onConfirm: () => void;
	onBack: () => void;
};

function getRandomInt(min: number, max: number) {
	return Math.floor(Math.random() * (max - min)) + min;
}

export const RememberMnemonic: FC<RememberProps> = React.memo(
	({ mnemonic, onConfirm, onBack }) => {
		const items = mnemonic.split(" ");

		const [one, setOne] = useState("");
		const [two, setTwo] = useState("");
		const [three, setThree] = useState("");

		const [test1, test2, test3] = useMemo(() => {
			return [
				getRandomInt(1, 8),
				getRandomInt(8, 16),
				getRandomInt(16, 24),
			];
		}, []);

		const isValid =
			one.toLowerCase().trim() === items[test1 - 1] &&
			two.toLowerCase().trim() === items[test2 - 1] &&
			three.toLowerCase().trim() === items[test3 - 1];

		return (
			<>
				<Block>
					<LeftCircleFilled
						onClick={onBack}
						style={{
							color: "#D9D9D9",
							fontSize: "30px",
						}}
					/>
				</Block>
				<BodyWrapper>
					<div>
						<CreateH1>Secret Recovery Phrase</CreateH1>
						<CreateText>
							Now let's check that you wrote your secret words
							correctly Please enter the words:
						</CreateText>
					</div>
					<ButtonColumn style={{ gap: 15 }}>
						<InputField
							label={`Word ${test1}`}
							value={one}
							onChange={(e) => setOne(e.target.value)}
						/>
						<InputField
							label={`Word ${test2}`}
							value={two}
							onChange={(e) => setTwo(e.target.value)}
						/>
						<InputField
							label={`Word ${test3}`}
							value={three}
							onChange={(e) => setThree(e.target.value)}
						/>

						<div style={{ width: "170px", margin: "20px auto 0" }}>
							<ButtonNegative
								disabled={!isValid}
								onClick={onConfirm}
							>
								Confirm
							</ButtonNegative>
						</div>
					</ButtonColumn>
				</BodyWrapper>
			</>
		);
	}
);
