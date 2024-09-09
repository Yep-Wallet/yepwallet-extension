import React from "react";
import styled from "styled-components";
import { ErrorText, Input } from "./Components";

const Label = styled.div`
	color: #a2a2a2;
	font-family: Poppins;
	font-size: 14px;
	font-style: normal;
	font-weight: 400;
	line-height: normal;
	text-transform: capitalize;
	position: absolute;
	top: -1px;
	left: 9px;
	background: #fff;
	border-radius: 10px;
	height: 3px;
	display: flex;
	align-items: center;
`;

const InputWrapper = styled.div`
	border-radius: 18px;
	background: #f4f4f4;
	border: 1px solid #f4f4f4;
	width: 100%;
	min-height: 56px;
	flex-shrink: 0;
	box-sizing: border-box;
	position: relative;
	&:hover {
		border: 1px solid #ffd93b;
	}
	input {
		border: 0px !important;
		background: transparent !important;
		padding: 0px 10px !important;
		height: 56px;
	}
`;
export interface InputFieldProps
	extends React.InputHTMLAttributes<HTMLInputElement> {
	label: string;
	error?: Error | null;
}

export const InputField = React.forwardRef<HTMLInputElement, InputFieldProps>(
	({ label, error, children, ...props }, ref) => {
		return (
			<InputWrapper>
				<Label>{label}</Label>
				<Input {...props} ref={ref} />
				{error && (
					<ErrorText style={{ paddingLeft: "10px" }}>
						{error.message}
					</ErrorText>
				)}
				{children}
			</InputWrapper>
		);
	}
);
