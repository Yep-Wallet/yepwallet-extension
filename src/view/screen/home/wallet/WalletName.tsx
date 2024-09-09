import React, { FC } from "react";
import styled from "styled-components";
import { CheckIcon, CopyIcon } from "../../../components/Icons";
import { useCopyToClipboard } from "../../../hooks/useCopyToClipbpard";
import { toShortAddress } from "../../../utils";

const Block = styled.div`
	cursor: pointer;
	border-radius: 5px;
	text-align: center;
	padding: 5px 15px;
	width: 115px;
	height: 30px;
	box-sizing: border-box;
	white-space: nowrap;
	text-overflow: ellipsis;
	margin: 0 auto;
	border-radius: 45px;
	background: #eee;
	display: flex;
	align-items: center;
	color: #9a9a9a;
	font-family: Poppins;
	font-size: 12px;
	font-style: normal;
	font-weight: 500;
	line-height: normal;
	text-transform: capitalize;
	&:hover {
		background: ${(props) => props.theme.gray};
	}
	&:hover {
		background: ${(props) => props.theme.gray};
	}
`;

export const WalletName: FC<{ address: string; name?: string }> = React.memo(
	({ address, name }) => {
		const [copied, handleCopy] = useCopyToClipboard();

		return (
			<Block onClick={() => handleCopy(address)}>
				{/* <b>{name}</b> */}
				<div>
					{toShortAddress(address)}{" "}
					{copied ? <CheckIcon /> : <CopyIcon />}
				</div>
			</Block>
		);
	}
);
