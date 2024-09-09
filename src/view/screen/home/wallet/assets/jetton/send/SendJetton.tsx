import { FC, useCallback, useContext, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { JettonAsset } from "../../../../../../../libs/entries/asset";
import { SendJettonState } from "../../../../../../../libs/service/transfer/jettonService";
import {
	ButtonBottomRow,
	ButtonPositive,
	Gap,
	H1,
} from "../../../../../../components/Components";
import { InputField } from "../../../../../../components/InputField";
import { SendCancelButton } from "../../../../../../components/send/SendButtons";
import { SendLoadingView } from "../../../../../../components/send/SendLoadingView";
import { SendSuccessView } from "../../../../../../components/send/SendSuccessView";
import { WalletStateContext } from "../../../../../../context";
import { sendBackground } from "../../../../../../event";
import { BodyWrapper } from "../../../../../import/CreateWallet";
import { useJettonWalletBalance } from "../../api";
import { JettonMinterAddressContext, JettonStateContext } from "../context";
import { stateToSearch, toSendJettonState } from "./api";
import { SendJettonConfirm } from "./SendJettonConfirm";

interface InputProps {
	jetton: JettonAsset;
	state: SendJettonState;

	onChange: (field: Partial<SendJettonState>) => void;
	onSend: () => void;
}

const SendJettonInputView: FC<InputProps> = ({
	jetton,
	state,
	onChange,
	onSend,
}) => {
	return (
		<BodyWrapper>
			<H1>Send {jetton.state.symbol}</H1>

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
				onChange={(e) => onChange({ amount: e.target.value })}
			/>

			<InputField
				label="Transaction Amount"
				type="number"
				min={0}
				value={state.transactionAmount}
				onChange={(e) =>
					onChange({ transactionAmount: e.target.value })
				}
			/>

			<Gap />
			<ButtonBottomRow style={{ gap: 5 }}>
				<SendCancelButton homeRoute="../" />
				<ButtonPositive onClick={onSend}>Next</ButtonPositive>
			</ButtonBottomRow>
		</BodyWrapper>
	);
};

export const JettonSend = () => {
	const wallet = useContext(WalletStateContext);
	const minterAddress = useContext(JettonMinterAddressContext);
	const jetton = useContext(JettonStateContext);
	const [searchParams, setSearchParams] = useSearchParams();
	const { data: balance } = useJettonWalletBalance(jetton);

	const seqNo = searchParams.get("seqNo");
	const confirm = searchParams.get("confirm");

	const submit = searchParams.get("submit") === "1";

	const state = useMemo(() => {
		return toSendJettonState(searchParams);
	}, [searchParams]);

	const onSubmit = useCallback(() => {
		const params = { ...stateToSearch(state), submit: "1" };

		sendBackground.message("storeOperation", {
			kind: "sendJetton",
			value: { wallet: wallet.address, minterAddress, params },
		});

		setSearchParams(params);
	}, [setSearchParams, state]);

	const onChange = useCallback(
		(field: Partial<SendJettonState>) => {
			const params = stateToSearch({ ...state, ...field });

			sendBackground.message("storeOperation", {
				kind: "sendJetton",
				value: { wallet: wallet.address, minterAddress, params },
			});

			setSearchParams(params);
		},
		[setSearchParams, state]
	);

	const onSend = useCallback(
		(seqNo: number) => {
			const params = { seqNo: String(seqNo) };

			sendBackground.message("storeOperation", null);
			setSearchParams(params);
		},
		[setSearchParams]
	);

	const onConfirm = useCallback(() => {
		sendBackground.message("storeOperation", null);

		setSearchParams({ confirm: String(seqNo) });
	}, [setSearchParams, seqNo]);

	if (confirm !== null) {
		return <SendSuccessView address={wallet.address} />;
	}

	if (seqNo !== null) {
		return (
			<SendLoadingView
				address={wallet.address}
				seqNo={seqNo}
				onConfirm={onConfirm}
			/>
		);
	}

	if (!submit) {
		return (
			<SendJettonInputView
				state={state}
				jetton={jetton}
				onChange={onChange}
				onSend={onSubmit}
			/>
		);
	}

	return (
		<SendJettonConfirm
			state={state}
			jetton={jetton}
			balance={balance}
			onSend={onSend}
		/>
	);
};
