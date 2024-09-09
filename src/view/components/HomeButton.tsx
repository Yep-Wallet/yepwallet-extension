import { LeftCircleFilled } from "@ant-design/icons";
import { FC } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { Container } from "./Components";

const Block = styled(Container)`
	width: 100%;
`;
const Button = styled.div`
	cursor: pointer;
`;

export const HomeButton: FC<{ path?: string; text?: string }> = ({
	path = "/",
	text = "Back to Home",
}) => {
	const navigate = useNavigate();
	return (
		<Block>
			<Button onClick={() => navigate(path)}>
				<LeftCircleFilled
					style={{
						color: "#D9D9D9",
						fontSize: "30px",
					}}
				/>
			</Button>
		</Block>
	);
};
