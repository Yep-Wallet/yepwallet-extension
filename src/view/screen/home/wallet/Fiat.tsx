import { FC } from "react";
import styled from "styled-components";
import { useTonFiat } from "../../../utils";

const Price = styled.span`
	margin: 0 0 19px;
	color: #000;
	text-align: center;
	font-family: Poppins;
	font-size: 16px;
	font-style: normal;
	font-weight: 400;
	line-height: normal;
`;

export const Fiat: FC<{ balance?: string; price?: number }> = ({
	balance,
	price,
}) => {
	const value = useTonFiat(balance, price);
	return <Price>{value ?? "-"}</Price>;
};
