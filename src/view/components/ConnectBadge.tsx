import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import styled, { css } from "styled-components";
import { AppRoute } from "../routes";
import { useConnections } from "../screen/connections/api";
import { useActiveTabs } from "../screen/notifications/connect/api";

const Connect = styled.div`
	position: absolute;
	left: ${(props) => props.theme.padding};
	width: 106px;
	height: 28px;
	flex-shrink: 0;
	border-radius: 50px;
	background: #f2f2f2;
	color: #606060;
	text-align: center;
	font-family: Poppins;
	font-size: 12px;
	font-style: normal;
	font-weight: 400;
	line-height: normal;
	text-transform: capitalize;
	display: flex;
	align-items: center;
	justify-content: center;
`;

const Dot = styled.div<{ isConnected: boolean }>`
	width: 5px;
	height: 5px;
	border-radius: 50%;

	${(props) =>
		props.isConnected
			? css`
					background: green;
			  `
			: css`
					background: red;
			  `}
`;

export const ConnectBadge = () => {
	const navigate = useNavigate();

	const { data: connections } = useConnections();
	const { data: tab } = useActiveTabs();

	const isConnected = useMemo(() => {
		if (!connections || !tab || !tab.url) return false;
		const url = new URL(tab.url);
		return connections[url.origin] != null;
	}, [connections, tab]);

	return (
		<Connect onClick={() => navigate(AppRoute.connections)}>
			{isConnected ? (
				<>
					<Dot isConnected />
					<span>Connected</span>
				</>
			) : (
				<>Not Connected</>
			)}
		</Connect>
	);
};
