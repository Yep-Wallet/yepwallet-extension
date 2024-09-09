import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TonClient } from "@ton/ton";
import { TonHttpProvider } from "@yepwallet/web-sdk";
import React, { FC, Suspense, useMemo } from "react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import styled, { ThemeProvider, createGlobalStyle } from "styled-components";
import { AccountState } from "../libs/entries/account";
import { selectNetworkConfig } from "../libs/entries/network";
import {
	useAccountState,
	useInitialRedirect,
	useLock,
	useNetwork,
	useNetworkConfig,
	useScript,
} from "./api";
import {
	AccountStateContext,
	NetworkContext,
	NetworksContext,
	TonClientContext,
	TonProviderContext,
	WalletStateContext,
} from "./context";
import FooterMenu from "./footerMenu";
import { useInitialRendering } from "./hooks/useInitialRendering";
import { AppRoute, any } from "./routes";
import { AnalyticsContext, useAnalytics } from "./screen/Analytics";
import { Loading } from "./screen/Loading";
import { Header } from "./screen/home/Header";
import { CreatePassword, Initialize } from "./screen/initialize/Initialize";
import { LedgerNotification } from "./screen/ledger/LedgerNotification";
import { PasswordNotification } from "./screen/unlock/PasswordNotification";
import { Unlock } from "./screen/unlock/Unlock";
import { WebAuthnNotification } from "./screen/unlock/WebAuthnNotification";
import defaultTheme from "./styles/defaultTheme";

const ConnectWallet = React.lazy(() => import("./screen/import/ConnectWallet"));
const Connections = React.lazy(
	() => import("./screen/connections/Connections")
);
const Home = React.lazy(() => import("./screen/home/Home"));
const Settings = React.lazy(() => import("./screen/settings/Settings"));
const Notifications = React.lazy(
	() => import("./screen/notifications/Notifications")
);

const ContentRouter: FC<{
	account: AccountState;
	lock: boolean;
	script: string | null;
	notification: boolean;
	justOpen: boolean;
}> = ({ account, lock, script, notification, justOpen }) => {
	const location = useLocation();

	const wallet = account.wallets.find(
		(w) => w.address === account.activeWallet
	);

	useInitialRedirect(notification, wallet?.address);
	const enable = useAnalytics(account, wallet);

	if (script != null && lock) {
		return <Unlock justOpen={justOpen} />;
	}
	if (
		account.wallets.length === 0 &&
		!location.pathname.startsWith(AppRoute.import)
	) {
		return <Initialize />;
	}
	if (lock || script == null) {
		return <CreatePassword />;
	}

	return (
		<AnalyticsContext.Provider value={enable}>
			<WalletStateContext.Provider value={wallet!}>
				<Suspense fallback={<Loading />}>
					<Routes>
						<Route
							path={AppRoute.notifications}
							element={<Notifications />}
						/>
						<Route
							path={any(AppRoute.settings)}
							element={<Settings />}
						/>
						<Route
							path={AppRoute.connections}
							element={<Connections />}
						/>
						<Route
							path={any(AppRoute.import)}
							element={<ConnectWallet />}
						/>
						<Route path="*" element={<Home />} />
					</Routes>
				</Suspense>
				<FooterMenu />

				<LedgerNotification />
			</WalletStateContext.Provider>
		</AnalyticsContext.Provider>
	);
};

const App = () => {
	const lock = useLock();
	const { data: script } = useScript();
	const { data: network } = useNetwork();
	const { data: networks } = useNetworkConfig();
	const { isLoading, data } = useAccountState();

	const config = selectNetworkConfig(network, networks);
	const justOpen = useInitialRendering();

	const notification = useMemo(() => {
		return window.location.hash.includes(AppRoute.notifications);
	}, []);

	const [tonProvider, tonClient] = useMemo(() => {
		return [
			new TonHttpProvider(config.rpcUrl, { apiKey: config.apiKey }),
			new TonClient({ endpoint: config.rpcUrl, apiKey: config.apiKey }),
		] as const;
	}, [config]);

	if (
		isLoading ||
		!data ||
		!network ||
		!networks ||
		script === undefined ||
		lock === undefined
	) {
		return <Loading />;
	}

	return (
		<AccountStateContext.Provider value={data}>
			<NetworkContext.Provider value={network}>
				<NetworksContext.Provider value={networks}>
					<TonProviderContext.Provider value={tonProvider}>
						<TonClientContext.Provider value={tonClient}>
							<Header lock={lock || notification} />
							<ContentRouter
								account={data}
								lock={lock}
								script={script}
								notification={notification}
								justOpen={justOpen}
							/>
							<PasswordNotification />
							<WebAuthnNotification />
						</TonClientContext.Provider>
					</TonProviderContext.Provider>
				</NetworksContext.Provider>
			</NetworkContext.Provider>
		</AccountStateContext.Provider>
	);
};

const queryClient = new QueryClient({
	defaultOptions: { queries: { staleTime: 30000 } },
});

const GlobalStyle = createGlobalStyle`
body {
  margin: 0;
  font-family: Poppins;
  background: #dddddd;
}

code {
	font-family: Poppins;

}

#root {
  overflow: hidden;
}
`;

const Container = styled.div`
	background-color: ${(props) => props.theme.background};
	color: ${(props) => props.theme.color};
	min-width: 375px;
	max-width: 600px;
	margin: 0 auto;
	height: 600px;
	display: flex;
	flex-direction: column;
	min-height: 100vh;
	font-size: 110%;
`;

const BaseProvider: FC = () => {
	return (
		<ThemeProvider theme={defaultTheme}>
			<QueryClientProvider client={queryClient}>
				<GlobalStyle />
				<MemoryRouter>
					<Container>
						<App />
					</Container>
				</MemoryRouter>
			</QueryClientProvider>
		</ThemeProvider>
	);
};

export default BaseProvider;
