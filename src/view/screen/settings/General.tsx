import { Checkbox } from "antd";
import styled from "styled-components";
import { ProxyHost, PublicTonProxy } from "../../../libs/entries/proxy";
import ExtensionPlatform from "../../../libs/service/extension";
import { ErrorMessage, InlineLink } from "../../components/Components";
import { DropDownList } from "../../components/DropDown";
import { HomeButton } from "../../components/HomeButton";
import { ArrowDownIcon, LinkIcon } from "../../components/Icons";
import { AppRoute } from "../../routes";
import { CheckboxTxt } from "../home/wallet/send/Send";
import {
	InputWrapper,
	InputWrapperLabel,
	InputWrapperSelectPayload,
} from "../home/wallet/setttings/Settings";
import { BodyWrapper, CreateH1 } from "../import/CreateWallet";
import {
	useDataCollection,
	useLockScreen,
	useProxyConfiguration,
	useSetDataCollection,
	useSetLockScreen,
	useUpdateProxyMutation,
} from "./api";

const Quote = styled.div`
	padding: 5px 0;
	color: #8a8a8a;
	font-family: Poppins;
`;

const ProxyItems = (PublicTonProxy as (ProxyHost | undefined)[]).concat([
	undefined,
]);

const TONProxyInfoLink =
	"https://telegra.ph/TON-Sites-TON-WWW-and-TON-Proxy-09-29-2";

const ProxySelect = () => {
	const { data: proxy, isFetching } = useProxyConfiguration();
	const { mutate, reset, isLoading, error } = useUpdateProxyMutation();

	const updateProxy = (host: ProxyHost | undefined) => {
		reset();
		mutate(host);
	};

	const disableProxy = isFetching || isLoading;

	return (
		<>
			<InputWrapper>
				<InputWrapperLabel>TON Proxy</InputWrapperLabel>
				<DropDownList
					isLeft
					options={ProxyItems}
					renderOption={(value) =>
						value ? `TON ${value.host}:${value.port}` : "Disabled"
					}
					onSelect={(value) => updateProxy(value)}
					disabled={disableProxy}
				>
					<InputWrapperSelectPayload disabled={disableProxy}>
						<CheckboxTxt>
							{proxy?.enabled
								? `TON ${proxy.domains["ton"].host}:${proxy.domains["ton"].port}`
								: "Disabled"}
						</CheckboxTxt>
						<ArrowDownIcon />
					</InputWrapperSelectPayload>
				</DropDownList>
			</InputWrapper>

			<Quote>
				TON Proxy configuration to enabled TON WWW and TON Sites in your
				browser{" "}
				<InlineLink
					onClick={() =>
						ExtensionPlatform.openTab({ url: TONProxyInfoLink })
					}
				>
					Read more <LinkIcon />
				</InlineLink>
				<br />
				<br />
				TON search engine:{" "}
				<InlineLink
					onClick={() =>
						ExtensionPlatform.openTab({
							url: "http://searching.ton",
						})
					}
				>
					http://searching.ton <LinkIcon />
				</InlineLink>
			</Quote>
			{error && <ErrorMessage>{error.message}</ErrorMessage>}
		</>
	);
};

const LockScreenSelect = () => {
	const { data: isLockScreen } = useLockScreen();
	const { mutate } = useSetLockScreen();
	return (
		<>
			<InputWrapper
				style={{ justifyContent: "center", paddingLeft: "10px" }}
			>
				<InputWrapperLabel>Lock Screen</InputWrapperLabel>
				<Checkbox
					checked={isLockScreen}
					onChange={(e) => mutate(e.target.checked)}
				>
					<CheckboxTxt>Enable Lock Screen</CheckboxTxt>
				</Checkbox>
			</InputWrapper>
		</>
	);
};

const DataCollectionSelect = () => {
	const { data: isEnabled } = useDataCollection();
	const { mutate } = useSetDataCollection();

	return (
		<>
			<InputWrapper
				style={{ justifyContent: "center", paddingLeft: "10px" }}
			>
				<InputWrapperLabel>Analytics</InputWrapperLabel>
				<Checkbox
					checked={isEnabled}
					onChange={(e) => mutate(e.target.checked)}
				>
					<CheckboxTxt>
						Enable Data Collection to help YepWallet improve user
						experience
					</CheckboxTxt>
				</Checkbox>
			</InputWrapper>
		</>
	);
};

export const GeneralSettings = () => {
	return (
		<>
			<HomeButton path={AppRoute.settings} text="Back to Settings" />
			<BodyWrapper>
				<CreateH1>General</CreateH1>
				<LockScreenSelect />
				<DataCollectionSelect />
				<ProxySelect />
			</BodyWrapper>
		</>
	);
};
