import { useContext, useEffect, useState } from "react";
import styled from "styled-components";
import { TonWebTransaction } from "../../../../../libs/entries/transaction";
import { ActivitiesList } from "../../../../components/ActivitiesList";
import { WalletStateContext } from "../../../../context";
import { useDecryptMutation, useTransactions } from "./api";

const Row = styled.div`
	padding: ${(props) => props.theme.padding};
`;

const ButtonNegative = styled.div`
	display: flex;
	width: 255px;
	height: 50px;
	padding: 10px;
	justify-content: center;
	align-items: center;
	gap: 10px;
	flex-shrink: 0;
	border-radius: 36px;
	background: #f2f2f2;
	color: #606060;
	text-align: center;
	font-family: Poppins;
	font-size: 12px;
	font-style: normal;
	font-weight: 400;
	line-height: normal;
	box-sizing: border-box;
	margin: auto;
`;
export const Activities = () => {
	const wallet = useContext(WalletStateContext);

	const [txs, setTxs] = useState<TonWebTransaction[] | undefined>();
	const { data: transactions, isLoading } = useTransactions();

	useEffect(() => {
		setTxs(transactions);
	}, [transactions]);

	const { mutateAsync, isLoading: isDecrypting } = useDecryptMutation();
	const onDecrypt = async () => {
		if (txs) {
			setTxs(await mutateAsync(txs));
		}
	};

	return (
		<>
			{/* {!wallet.ledger && (
				<Row>
					<ButtonNegative onClick={onDecrypt}>
						{isDecrypting ? (
							<Dots>Decrypting</Dots>
						) : (
							<FingerprintLabel>
								Decrypt e2e encrypted messages
							</FingerprintLabel>
						)}
					</ButtonNegative>
				</Row>
			)} */}

			<ActivitiesList
				isLoading={isLoading}
				data={txs}
				address={wallet.address}
			/>
		</>
	);
};
