import { LeftCircleFilled } from "@ant-design/icons";
import React, { FC } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { sendBackground } from "../../event";
import { AppRoute } from "../../routes";
import { ButtonNegative, Container } from "../Components";

interface Props {
	disabled?: boolean;
	transactionId?: string;
	homeRoute?: string;
}

export const SendCancelButton: FC<Props> = ({
	disabled,
	transactionId,
	homeRoute = AppRoute.home,
}) => {
	const navigate = useNavigate();
	const onCancel = () => {
		sendBackground.message("storeOperation", null);
		if (transactionId) {
			sendBackground.message("rejectRequest", Number(transactionId));
		}
		navigate(homeRoute);
	};
	return (
		<ButtonNegative onClick={onCancel} disabled={disabled}>
			Cancel
		</ButtonNegative>
	);
};

const Block = styled(Container)`
	width: 100%;
`;

const Button = styled.div`
	cursor: pointer;
`;

export const SendEditButton: FC<{ onEdit: () => void }> = React.memo(
	({ onEdit }) => {
		return (
			<Block>
				<Button onClick={onEdit}>
					<LeftCircleFilled
						style={{
							color: "#D9D9D9",
							fontSize: "30px",
						}}
					/>
				</Button>
			</Block>
		);
	}
);
