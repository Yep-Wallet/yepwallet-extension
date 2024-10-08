import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import { FC, PropsWithChildren, useRef, useState, WheelEvent } from "react";
// @ts-ignore
import Slider, { Settings } from "react-slick";
import "slick-carousel/slick/slick-theme.css";
import "slick-carousel/slick/slick.css";
import styled from "styled-components";

const SwipeButton = styled.button<{ position: "left" | "right" }>`
	width: 40px;
	height: 40px;
	border-radius: 20px;
	color: "#EBEBEB";
	background-color: "#2E3847";
	opacity: 0.64;
	display: flex;
	justify-content: center;
	align-items: center;
	position: absolute;
	z-index: 2;
	border: none;
	cursor: pointer;
	top: calc(50% - 20px);
	${(props) => (props.position === "left" ? "left: 12px;" : "right: 12px;")};
	transition: opacity 0.15s ease-in-out;

	&:hover {
		opacity: 0.8;
	}
`;

const CarouselWrapper = styled.div<{ gap: string; isFirst?: boolean }>`
	position: relative;

	.slick-list {
		margin: 0 -${(props) => parseFloat(props.gap) / 2}px;
		${(props) => props.isFirst && "padding-left: 16px !important;"}
	}
	.slick-slide > div {
		margin: 0 ${(props) => parseFloat(props.gap) / 2}px;
	}
`;

export interface CarouselProps {
	gap: string;
	className?: string;
}

const defaultSettings = {
	speed: 500,
	slidesToShow: 1,
	slidesToScroll: 1,
	centerMode: true,
	arrows: false,
};

export const Carousel: FC<PropsWithChildren & CarouselProps & Settings> = ({
	children,
	gap,
	className,
	...settings
}) => {
	const isInfinite = settings.infinite !== false;
	const sliderRef = useRef<Slider | null>(null);
	const isSwiping = useRef(false);

	const [hideRightButton, setHideRightButton] = useState(false);
	const [hideLeftButton, setHideLeftButton] = useState(!isInfinite);

	const onWheel = (e: WheelEvent) => {
		if (!isSwiping.current) {
			isSwiping.current = true;

			if (e.deltaX > 0) {
				return sliderRef.current?.slickNext();
			}

			if (e.deltaX < 0) {
				return sliderRef.current?.slickPrev();
			}
		}
	};

	const blockSwipe = () => {
		isSwiping.current = true;
	};

	const unblockSwipe = () => {
		isSwiping.current = false;
	};

	const beforeChange = (_: number, nextIndex: number) => {
		blockSwipe();

		const childrenLength =
			children && Array.isArray(children) ? children.length : 0;
		setHideRightButton(nextIndex === childrenLength - 1 && !isInfinite);
		setHideLeftButton(nextIndex === 0 && !isInfinite);
	};

	return (
		<CarouselWrapper onWheel={onWheel} gap={gap} className={className}>
			{!hideLeftButton && (
				<SwipeButton
					position="left"
					onClick={() => sliderRef.current?.slickPrev()}
				>
					<LeftOutlined />
				</SwipeButton>
			)}
			<Slider
				ref={sliderRef}
				beforeChange={beforeChange}
				afterChange={unblockSwipe}
				{...defaultSettings}
				{...settings}
			>
				{children}
			</Slider>
			{!hideRightButton && (
				<SwipeButton
					position="right"
					onClick={() => sliderRef.current?.slickNext()}
				>
					<RightOutlined />
				</SwipeButton>
			)}
		</CarouselWrapper>
	);
};
