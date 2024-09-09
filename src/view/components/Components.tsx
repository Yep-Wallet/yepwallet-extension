import styled, { css } from "styled-components";

export const Container = styled.div`
	max-width: 600px;
	margin: 0 auto;
	padding: ${(props) => props.theme.padding};
	box-sizing: border-box;
`;

export const H1 = styled.h1`
	font-size: 1.5rem;
	line-height: 130%;
	margin: 4px;
`;

export const H3 = styled.h3`
	font-size: 1.2rem;
	line-height: 110%;
`;

const Button = styled.button<{ disabled?: boolean }>`
	padding: 17px;
	width: 100%;
	border-radius: ${(props) => props.theme.padding};
	cursor: pointer;
	font-size: medium;
	display: flex;
	justify-content: center;
	align-items: center;

	${(props) =>
		props.disabled &&
		css`
			opacity: 0.5;
		`}
`;

const ButtonGroup = styled.div`
	width: 100%;
	display: flex;
	gap: 18;
`;

export const ButtonColumn = styled(ButtonGroup)`
	flex-direction: column;
`;

export const ButtonRow = styled(ButtonGroup)`
	flex-direction: row;
`;

export const ButtonBottomRow = styled(ButtonRow)`
	position: sticky;
	bottom: 0;
`;

export const ButtonPositive = styled(Button)`
	/* border: 1px solid ${(props) => props.theme.color}; */
	/* background: ${(props) => props.theme.color}; */
	color: ${(props) => props.theme.background};
	border-radius: 16px;
	background: #1a202c;
	&:hover {
		background: #374151;
	}
`;

export const ButtonNegative = styled(Button)`
	border: 1px solid #fff6d9;
	/* background: ${(props) => props.theme.background}; */
	color: ${(props) => props.theme.color};
	border-radius: 16px;
	background: #fff6d9;
	&:hover {
		opacity: 0.9;
	}
`;

export const ButtonLink = styled.button`
	width: 100%;
	border: 0;
	outline: 0;
	background: ${(props) => props.theme.background};
	color: ${(props) => props.theme.blue};
	color: ${(props) => props.theme.darkBlue};
	text-decoration: underline;
	cursor: pointer;
	margin: ${(props) => props.theme.padding} 0;
`;

export const InlineButtonLink = styled(ButtonLink)`
	display: inline;
	margin: 0;
	width: auto;
	font-size: inherit;
`;

export const PoppinsTxt = styled.div`
	font-family: Poppins;
	font-style: normal;
	line-height: normal;
`;

export const ButtonDanger = styled(Button)`
	width: 100%;

	border: 1px solid ${(props) => props.theme.red};
	background: ${(props) => props.theme.background};
	color: ${(props) => props.theme.color};

	&:hover {
		background: ${(props) => props.theme.lightRed};
	}
`;

export const Badge = styled.div`
	border: 1px solid ${(props) => props.theme.darkGray};
	padding: 5px 20px;
	border-radius: 20px;
	cursor: pointer;
`;

export const IconSize = styled.span`
	color: ${(props) => props.theme.darkGray};
	font-size: 200%;
	border-radius: 50%;
	width: 1em;
	height: 1em;
	display: inline-block;
	cursor: pointer;
	padding: 5px;
`;

export const Icon = styled(IconSize)`
	display: flex;
	align-items: center;
	justify-content: center;
	&:hover {
		background: ${(props) => props.theme.gray};
		color: ${(props) => props.theme.color};
	}
`;

export const Body = styled(Container)`
	width: 100%;
	flex-grow: 1;
	display: flex;
	flex-direction: column;
	overflow: auto;
`;

export const BodyCenter = styled(Body)`
	align-items: center;
`;

export const Center = styled.div`
	text-align: center;
`;

export const Gap = styled.div`
	flex-grow: 1;
`;

const MessageBase = styled.div`
	width: 100%;
	box-sizing: border-box;
	font-size: medium;
	padding: ${(props) => props.theme.padding};
	border-radius: ${(props) => props.theme.padding};
`;

export const ErrorMessage = styled(MessageBase)`
	word-break: break-all;
	border: 1px solid ${(props) => props.theme.red};
	background: ${(props) => props.theme.lightRed};
	color: #000;
	font-family: Poppins;
	font-size: 14px;
	font-style: normal;
	font-weight: 400;
	line-height: normal;
	text-transform: capitalize;
`;

export const WarningMessage = styled(MessageBase)`
	border: 1px solid ${(props) => props.theme.color};
	background: ${(props) => props.theme.lightOrange};
`;

export const ErrorText = styled.div`
	color: ${(props) => props.theme.red};
	font-size: medium;
	padding-top: 3px;
`;

export const Input = styled.input`
	padding: 10px;
	border: none;
	border-bottom: 1px solid ${(props) => props.theme.darkGray};
	width: 100%;
	outline: none;
	box-sizing: border-box;
`;

export const Title = styled.div`
	font-size: x-large;
	padding-bottom: 25px;
`;

export const Textarea = styled.textarea`
	resize: vertical;
	padding: 10px;
	margin-bottom: ${(props) => props.theme.padding};
`;

export const Text = styled.div`
	padding-bottom: ${(props) => props.theme.padding};
	color: #000;
	font-family: Poppins;
	font-size: ${(props: any) => props.fontSize || "14px"}; /* 默认值为 16px */
`;

export const TextLine = styled(Text)`
	word-break: break-all;
`;

export const Scroll = styled.div`
	overflow: auto;
`;

export const TextLink = styled(Text)`
	font-size: 16px;
	cursor: pointer;
	color: #1255ff;
	padding-bottom: 0px;
`;

export const InlineLink = styled.span`
	color: #1255ff;
	cursor: pointer;
`;

export const Logo = styled.img`
	width: 35px;
	height: 35px;
	background: #ebebeb;
	border: 1px solid ${(props) => props.theme.darkGray};
	border-radius: 50%;
	padding: 5px;
`;

export const SelectLabel = styled.div`
	margin: 10px 0 0;
	color: #000;
	font-family: Poppins;
	font-size: 14px;
	font-style: normal;
	font-weight: 600;
	line-height: normal;
`;

export const SelectPayload = styled.div<{ disabled?: boolean }>`
	font-size: medium;
	padding: 5px 10px;
	border-bottom: 1px solid ${(props) => props.theme.darkGray};
	width: 100%;
	display: flex;
	justify-content: space-between;
	box-sizing: border-box;

	${(props) =>
		props.disabled &&
		css`
			opacity: 0.5;
		`}
`;

export const DefaultTxt: any = styled.div`
	color: #000;
	text-align: center;
	font-family: Poppins;
	font-size: ${(props: any) => props.fontSize || "14px"}; /* 默认值为 16px */
	font-style: normal;
	font-weight: 400;
	line-height: normal;
`;

export const AText = styled.div`
	color: #1255ff;
	text-align: center;
	font-family: Poppins;
	font-size: ${(props: any) => props.fontSize || "12px"}; /* 默认值为 16px */
	font-style: normal;
	font-weight: 400;
	line-height: normal;
	text-decoration-line: underline;
	text-transform: capitalize;
	cursor: pointer;
`;

export const Row = styled.div`
	display: flex;
	flex-direction: row;
`;

export const Pb = styled.div`
	padding-bottom: ${(props: any) => props.pb || "11px"};
`;
