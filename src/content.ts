import browser from "webextension-polyfill";
import { DAppMessage } from "./libs/entries/message";
import { Logger } from "./libs/logger";
import { observeTwitterPageChanges } from "./replaceTweet";
const PORT_NAME = "YepWalletContentScript";

injectScript();
loadScripts();
setupStream();

/**
 * Injects a script tag into the current document
 */
function injectScript() {
	try {
		const container = document.head || document.documentElement;
		const scriptTag = document.createElement("script");

		scriptTag.setAttribute("async", "false");
		scriptTag.setAttribute("src", browser.runtime.getURL("provider.js"));

		container.insertBefore(scriptTag, container.children[0]);
		container.removeChild(scriptTag);
	} catch (error) {
		Logger.error("YepWallet: Provider injection failed.", error);
	}
}

async function loadScripts() {
	const loadScript = (src: string) => {
		const container = document.head || document.documentElement;

		return new Promise<void>((resolve, reject) => {
			const scriptTag = document.createElement("script");
			scriptTag.src = src;
			scriptTag.async = false; // Ensure scripts run in order
			scriptTag.onload = () => resolve();
			scriptTag.onerror = () =>
				reject(new Error(`Failed to load script: ${src}`));
			container.appendChild(scriptTag);
		});
	};

	try {
		await loadScript(browser.runtime.getURL("solana-web3.min.js"));
		await loadScript(browser.runtime.getURL("ethers-5.7.umd.min.js"));
		await loadScript(browser.runtime.getURL("memeInject.js"));
	} catch (error) {
		console.error("Failed to load one or more scripts:", error);
	}
}

interface PageMessagePayload {
	type: string;
	message: DAppMessage;
}

interface PageMessage {
	data?: PageMessagePayload;
}

/**
 * the transport-specific streams for communication between provider and background
 */
async function setupStream() {
	let port: browser.Runtime.Port;

	const onPortMessage = (data: unknown) => {
		window.postMessage(data, "*");
	};

	const connectBackground = () => {
		port = browser.runtime.connect({ name: PORT_NAME });
		port.onMessage.addListener(onPortMessage);
	};

	connectBackground();

	const onPageMessage = (e: PageMessage) => {
		if (!e.data) return;
		if (e.data.type !== "YepWalletProvider") return;

		sendMessageToActivePort(e.data);
	};

	const sendMessageToActivePort = (
		payload: PageMessagePayload,
		isRepeat = false
	) => {
		try {
			port.postMessage(payload);
		} catch (err) {
			const errorMessage = (err as Error).message;

			const isInvalidated = errorMessage
				.toString()
				.includes("Extension context invalidated");

			if (isInvalidated) {
				window.removeEventListener("message", onPageMessage);
				return;
			}

			const isDisconnected = errorMessage
				.toString()
				.includes("disconnected port");

			if (!isRepeat && isDisconnected) {
				connectBackground();
				sendMessageToActivePort(payload, true);
			} else {
				onPortMessage({
					type: "YepWalletAPI",
					message: {
						id: payload?.message?.id,
						method: payload?.message?.method,
						error: { message: errorMessage },
						jsonrpc: true,
					},
				});
			}
		}
	};

	window.addEventListener("message", onPageMessage);

	// Add Mutation Observer to monitor changes on the Twitter page
	window.addEventListener("load", observeTwitterPageChanges);
}
