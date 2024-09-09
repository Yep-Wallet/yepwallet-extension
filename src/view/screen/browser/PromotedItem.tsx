import styled, { css } from "styled-components";

export const PromotedItem = styled.div`
	padding-top: 0 !important;
	padding-bottom: 0 !important;
	height: 76px;
	display: flex;
	align-items: center;
	width: 100%;
`;

export const PromotedItemImage = styled.img`
	height: 44px;
	width: 44px;
	border-radius: 22px;
`;

export const PromotedItemText = styled.div<{ color?: string }>`
	display: flex;
	min-width: 0;
	flex-direction: column;
	padding: 11px 12px 13px;
	color: ${(props) => props.color};

	& > span:nth-child(2) {
		opacity: 0.78;
		overflow: hidden;
		text-overflow: ellipsis;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		max-height: 32px;
	}
`;

export const Label2Class = css`
	font-style: normal;
	font-weight: 600;
	font-size: 14px;
	line-height: 20px;
`;

export const Label2 = styled.span`
	${Label2Class}
`;

export const Label3 = styled.span`
	font-style: normal;
	font-weight: 600;
	font-size: 12px;
	line-height: 16px;
`;

export const Body3Class = css`
	font-style: normal;
	font-weight: 500;
	font-size: 12px;
	line-height: 16px;
`;

export const Body3 = styled.span`
	${Body3Class}
`;
