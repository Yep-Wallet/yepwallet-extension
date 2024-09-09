import { FC, PropsWithChildren } from "react";
import styled from "styled-components";
import { Container, DefaultTxt, Icon } from "./Components";

const Column = styled.div`
	cursor: pointer;
	display: flex;
	width: 70px;
	height: 70px;
	flex-direction: column;
	justify-content: center;
	gap: 5px;
	align-items: center;
	border-radius: 7px;
	background: #fbfaf4;
`;

const ActionIcon = styled(Icon)`
	color: #ff9f00;
	display: flex;
	align-items: center;
	justify-content: center;
`;

export const BallanceBlock = styled(Container)`
	flex-shrink: 0;
	width: 100%;
	display: flex;
	flex-direction: column;
	align-items: center;
`;

export const BallanceButtonRow = styled.div`
	display: flex;
	gap: 10px;
`;

export interface BallanceButtonProps extends PropsWithChildren {
	label: string;
	onClick: () => void;
}
export const BallanceButton: FC<BallanceButtonProps> = ({
	onClick,
	label,
	children,
}) => {
	return (
		<Column onClick={onClick}>
			<ActionIcon>{children}</ActionIcon>
			<DefaultTxt>{label}</DefaultTxt>
		</Column>
	);
};
