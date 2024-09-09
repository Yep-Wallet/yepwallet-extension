import { Route, Routes, useNavigate } from "react-router-dom";
import packageJson from "../../../../package.json";
import ExtensionPlatform from "../../../libs/service/extension";
import { TextLink } from "../../components/Components";
import { HomeButton } from "../../components/HomeButton";
import { ArrowForwardIcon, LinkIcon } from "../../components/Icons";
import { AppRoute, relative } from "../../routes";
import {
	Source,
	SourceBodyWrapper,
	SubTitle,
} from "../home/wallet/receive/Receive";
import { BodyWrapper, CreateH1, CreateText } from "../import/CreateWallet";
import { ExperimentalSettings } from "./Experimental";
import { GeneralSettings } from "./General";
import { NetworkSettings } from "./Network";
import { WebAuthnDisableMigration } from "./password/WebAuthnMigrationDisable";
import { WebAuthnEnableMigration } from "./password/WebAuthnMigrationEnable";
import { SettingsRoutes } from "./route";

interface SettingsLink {
	route: SettingsRoutes;
	name: string;
}
const SETTINGS: SettingsLink[] = [
	{ route: SettingsRoutes.general, name: "General" },
	{ route: SettingsRoutes.network, name: "Networks" },
	{ route: SettingsRoutes.experimental, name: "Experimental" },
	{ route: SettingsRoutes.about, name: "About" },
];

const SettingsIndex = () => {
	const navigate = useNavigate();
	return (
		<>
			<HomeButton />
			<BodyWrapper>
				<CreateH1>Account Settings</CreateH1>
				<SourceBodyWrapper>
					{SETTINGS.map((item, index) => (
						<Source
							style={
								index + 1 < SETTINGS?.length
									? {
											borderBottom:
												"1px solid rgba(79, 90, 112, 0.24)",
									  }
									: {}
							}
							key={item.route}
							onClick={() => navigate(relative(item.route))}
						>
							<SubTitle>{item.name}</SubTitle>
							<ArrowForwardIcon />
						</Source>
					))}
				</SourceBodyWrapper>
			</BodyWrapper>
		</>
	);
};

const AboutSettings = () => {
	return (
		<>
			<HomeButton path={AppRoute.settings} text="Back to Settings" />
			<BodyWrapper style={{ alignItems: "center", paddingBottom: 30 }}>
				<CreateH1>About</CreateH1>
				<img
					src="tonmask-logo.svg"
					width="68"
					height="68"
					alt="YepWallet Logo"
				/>
				<CreateText>
					YepWallet Beta version {packageJson.version}
				</CreateText>
				<CreateText>
					Non-custodial web extension wallet for The Open Network
				</CreateText>
				<div
					style={{
						display: "flex",
						flexDirection: "column",
						textAlign: "center",
						gap: 5,
					}}
				>
					<SubTitle>Links:</SubTitle>
					<TextLink
						onClick={() => {
							ExtensionPlatform.openTab({
								url: `https://yepwallet.xyz`,
							});
						}}
					>
						Visit our website <LinkIcon />
					</TextLink>
					<TextLink
						onClick={() => {
							ExtensionPlatform.openTab({
								url: `https://t.me/YepWalletANN`,
							});
						}}
					>
						Telegram Channel
						<LinkIcon />
					</TextLink>
					<TextLink
						onClick={() => {
							ExtensionPlatform.openTab({
								url: `https://t.me/YepWallet_bot`,
							});
						}}
					>
						Telegram Bot
						<LinkIcon />
					</TextLink>
					<TextLink
						onClick={() => {
							ExtensionPlatform.openTab({
								url: `https://github.com/users/yepwallet/projects/1`,
							});
						}}
					>
						GitHub <LinkIcon />
					</TextLink>
					{/* <TextLink
						onClick={() => {
							ExtensionPlatform.openTab({
								url: `${packageJson.repository}/issues`,
							});
						}}
					>
						Issue Tracker <LinkIcon />
					</TextLink> */}
				</div>
			</BodyWrapper>
		</>
	);
};

export const Settings = () => {
	return (
		<Routes>
			<Route path={SettingsRoutes.about} element={<AboutSettings />} />
			<Route
				path={SettingsRoutes.general}
				element={<GeneralSettings />}
			/>
			<Route
				path={SettingsRoutes.network}
				element={<NetworkSettings />}
			/>
			<Route
				path={SettingsRoutes.enableWebAuthn}
				element={<WebAuthnEnableMigration />}
			/>
			<Route
				path={SettingsRoutes.disableWebAuthn}
				element={<WebAuthnDisableMigration />}
			/>
			<Route
				path={SettingsRoutes.experimental}
				element={<ExperimentalSettings />}
			/>
			<Route path={SettingsRoutes.index} element={<SettingsIndex />} />
		</Routes>
	);
};

export default Settings;
