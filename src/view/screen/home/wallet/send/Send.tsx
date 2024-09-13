import { message } from "antd";
import { FC, useCallback, useContext, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import styled from "styled-components";
import { TransactionState } from "../../../../../libs/service/transfer/tonService";
import {
	Body,
	ButtonBottomRow,
	ButtonPositive,
	Gap,
} from "../../../../components/Components";
import { InputField } from "../../../../components/InputField";
import { SendCancelButton } from "../../../../components/send/SendButtons";
import { SendLoadingView } from "../../../../components/send/SendLoadingView";
import { SendSuccessView } from "../../../../components/send/SendSuccessView";
import { WalletAddressContext, WalletStateContext } from "../../../../context";
import { sendBackground } from "../../../../event";
import { formatTonValue } from "../../../../utils";
import { CreateH1 } from "../../../import/CreateWallet";
import { stateToSearch, toState } from "./api";
import { ConfirmView } from "./ConfirmView";

const MaxRow = styled.div`
	display: flex;
	align-items: center;
	justify-content: end;
	color: #a2a2a2;
	font-family: Poppins;
	font-size: 10px;
	font-style: normal;
	font-weight: 400;
	line-height: normal;
	text-transform: capitalize;
`;

const MaxButton = styled.div`
	color: #56c2fc;
	text-align: center;
	font-family: Poppins;
	font-size: 10px;
	font-style: normal;
	font-weight: 400;
	line-height: normal;
	text-transform: capitalize;
	cursor: pointer;
	margin-right: 4px;
`;

const BodyWrapper = styled(Body)`
	gap: 18px;
`;

export const CheckboxTxt = styled.div`
	color: #000;
	font-family: Poppins;
	font-size: 12px;
	font-style: normal;
	font-weight: 400;
	line-height: normal;
	text-transform: capitalize;
`;

interface Props {
	price?: number;
	balance?: string;
}

interface InputProps {
	balance?: string;
	state: TransactionState;
	onChange: (field: Partial<TransactionState>) => void;
	onSend: () => void;
}

const InputView: FC<InputProps> = ({ state, balance, onChange, onSend }) => {
	const wallet = useContext(WalletStateContext);

	const formatted = useMemo(() => {
		return balance ? formatTonValue(balance) : "-";
	}, [balance]);

	return (
		<BodyWrapper>
			<CreateH1>Send TON</CreateH1>

			<InputField
				label="Enter wallet address"
				value={state.address}
				onChange={(e) => onChange({ address: e.target.value })}
			/>

			<InputField
				label="Amount"
				type="number"
				min={0}
				value={state.amount}
				onChange={(e) => onChange({ amount: e.target.value, max: "0" })}
			>
				<MaxRow style={{ position: "absolute", right: "10px" }}>
					<MaxButton
						onClick={() =>
							onChange({
								amount: balance ? formatTonValue(balance) : "0",
								max: "1",
							})
						}
					>
						Max
					</MaxButton>
					{formatted} TON
				</MaxRow>
			</InputField>
			<InputField
				label="Comment (optional)"
				value={state.data as string}
				onChange={(e) => onChange({ data: e.target.value })}
			/>

			{/* {!wallet.ledger && (
				<ConfigProvider
					theme={{
						token: {
							colorPrimary: "#1A202C", // 选中时的背景色，替换为你需要的颜色
							colorPrimaryHover: "#1A202C", // 悬浮时的颜色
							controlOutline: "none", // 去掉选中外边框
						},
					}}
				>
					<Checkbox
						checked={state.isEncrypt}
						onChange={(e) => {
							onChange({
								isEncrypt: e.target.checked,
							});
						}}
					>
						<CheckboxTxt>Encrypt</CheckboxTxt>
					</Checkbox>
				</ConfigProvider>
			)} */}

			<Gap />

			<ButtonBottomRow style={{ gap: 5 }}>
				<SendCancelButton />
				<ButtonPositive onClick={onSend}>Next</ButtonPositive>
			</ButtonBottomRow>
		</BodyWrapper>
	);
};

export const Send: FC<Props> = ({ price, balance }) => {
	const [searchParams, setSearchParams] = useSearchParams();

	const wallet = useContext(WalletStateContext);

	const seqNo = searchParams.get("seqNo");
	const confirm = searchParams.get("confirm");

	const submit = searchParams.get("submit") === "1";

	const state = useMemo(() => {
		return toState(searchParams);
	}, [searchParams]);

	const onSubmit = useCallback(() => {
		const params: any = { ...stateToSearch(state), submit: "1" };

		console.log("params", params);
		if (!params?.address) {
			message.error("Invalid address");
			return;
		}

		sendBackground.message("storeOperation", {
			kind: "send",
			value: { wallet: wallet.address, params },
		});

		setSearchParams(params);
	}, [setSearchParams, state]);

	const onChange = useCallback(
		(field: Partial<TransactionState>) => {
			const params = stateToSearch({ ...state, ...field });

			sendBackground.message("storeOperation", {
				kind: "send",
				value: { wallet: wallet.address, params },
			});

			setSearchParams(params);
		},
		[setSearchParams, state]
	);

	const onSend = useCallback(
		(seqNo: number) => {
			console.log("seqNo", seqNo);

			const params = { seqNo: String(seqNo) };
			console.log("params", params);

			sendBackground.message("storeOperation", null);
			setSearchParams(params);
		},
		[setSearchParams]
	);

	const onConfirm = useCallback(() => {
		sendBackground.message("storeOperation", null);

		setSearchParams({ confirm: String(seqNo) });
	}, [setSearchParams, seqNo]);

	const address = useContext(WalletAddressContext);

	if (confirm !== null) {
		return <SendSuccessView address={address} />;
	}

	if (seqNo !== null) {
		return (
			<SendLoadingView
				address={address}
				seqNo={seqNo}
				onConfirm={onConfirm}
			/>
		);
	}

	if (!submit) {
		return (
			<InputView
				state={state}
				onChange={onChange}
				onSend={onSubmit}
				balance={balance}
			/>
		);
	}

	return (
		<ConfirmView
			state={state}
			balance={balance}
			price={price}
			onSend={onSend}
		/>
	);
};
