import { RightOutlined } from "@ant-design/icons";
import { Key, useEffect, useState } from "react";
import styled from "styled-components";
import ExtensionPlatform from "../../../libs/service/extension";
import { Source, SourceBodyWrapper } from "../home/wallet/receive/Receive";
import { CreateH1 } from "../import/CreateWallet";
import {
	Body3,
	Label2,
	PromotedItem,
	PromotedItemImage,
	PromotedItemText,
} from "./PromotedItem";
import { Carousel } from "./carousel";

const CarouselCard = styled.div<{ img: string }>`
	width: 100%;
	aspect-ratio: 2 / 1;

	background-image: ${(props) => `url(${props.img})`};
	background-size: cover;
	border-radius: 20px;

	display: inline-flex !important;
	align-items: flex-end;
	justify-content: flex-start;
	cursor: pointer;
`;

const CarouselCardFooter = styled(PromotedItem)`
	margin-left: 1rem;
`;

const BrowserList = styled.div`
	margin-top: 30px;
	padding: 0 15px;
	display: flex;
	flex-direction: column;
	width: 100%;
	box-sizing: border-box;
	.BrowserListItem {
		display: flex;
		flex-direction: column;
		.BrowserListItemHeder {
			display: flex;
			flex-direction: row;
			justify-content: space-between;
			padding-bottom: 15px;
			.hederLeft {
			}
			.hederRight {
				color: #1255ff;
				text-align: center;
				font-family: Poppins;
				font-weight: 600;
				font-size: 16px;
				line-height: normal;
				text-transform: capitalize;
				cursor: pointer;
			}
		}
	}
`;

const BrowserWrapper = styled.div`
	width: 100%;
	box-sizing: border-box;
	display: flex;
	flex-direction: column;
	box-sizing: border-box;
`;

const BrowserRouter = ({ ...rest }: any) => {
	const [apps, _apps]: any = useState(null);

	const getData = async () => {
		const result = await fetch(`https://api.yep.money/game/yep/data`);

		const data = await result.json();
		console.log("data", data);

		_apps(data || null);
	};

	useEffect(() => {
		getData();
	}, []);
	const speed = 1000 * 10;

	return (
		<BrowserWrapper>
			<Carousel
				gap="8px"
				autoplay={true}
				centerPadding="16px"
				autoplaySpeed={speed}
				{...rest}
			>
				{apps?.data?.carousel?.map(
					(item: { url: Key | null | undefined }) => (
						<CarouselItem item={item} key={item.url} />
					)
				)}
			</Carousel>

			<BrowserList>
				{apps?.data?.apps.map((item: any) => {
					return (
						<div key={item.id} className="BrowserListItem">
							<div className="BrowserListItemHeder">
								<CreateH1>{item.title}</CreateH1>
								<div
									className="hederRight"
									onClick={() => {
										ExtensionPlatform.openTab({
											url: item.url,
										});
									}}
								>
									ALL
								</div>
							</div>

							<SourceBodyWrapper>
								{item?.list?.map((iten: any, index: number) => (
									<Source
										style={
											index + 1 <
											apps?.data?.carousel?.length
												? {
														borderBottom:
															"1px solid rgba(79, 90, 112, 0.24)",
														padding: "0 10px",
												  }
												: { padding: "0 10px" }
										}
										key={iten.url}
										onClick={() => {
											ExtensionPlatform.openTab({
												url: iten.url,
											});
										}}
									>
										<CarouselCardFooter>
											<PromotedItemImage
												src={iten.icon}
											/>

											<PromotedItemText>
												<Label2>{iten.name}</Label2>
												<Body3>
													{iten.description}
												</Body3>
											</PromotedItemText>
										</CarouselCardFooter>
										<RightOutlined />{" "}
									</Source>
								))}
							</SourceBodyWrapper>
						</div>
					);
				})}
			</BrowserList>
		</BrowserWrapper>
	);
};

const CarouselItem = ({ item }: any) => {
	return (
		<CarouselCard
			img={item.poster}
			onClick={() => {
				ExtensionPlatform.openTab({
					url: item.url,
				});
			}}
		>
			{/* <CarouselCardFooter>
				<PromotedItemImage src={item.icon} />

				<PromotedItemText color={item.textColor}>
					<Label2>{item.name}</Label2>
					<Body3>{item.description}</Body3>
				</PromotedItemText>
			</CarouselCardFooter> */}
		</CarouselCard>
	);
};

export default BrowserRouter;
