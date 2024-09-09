(function () {
	let provider;
	let signer;
	async function initializeProvider() {
		console.log("window.ethereum", window.ethereum);
		if (typeof window.ethereum !== "undefined") {
			try {
				await window.ethereum.request({
					method: "eth_requestAccounts",
				});
				provider = new ethers.providers.Web3Provider(window.ethereum);
				signer = provider.getSigner();
			} catch (error) {
				console.log("error", error);
				throw error;
			}
		} else {
			console.log("MetaMask undefined");
			throw new Error("MetaMask undefined");
		}
	}

	async function switchChain(chainIdHex) {
		try {
			await window.ethereum.request({
				method: "wallet_switchEthereumChain",
				params: [{ chainId: chainIdHex }],
			});
		} catch (switchError) {
			if (switchError.code === 4001) {
				throw new Error(
					"The user rejected the request to switch the chain."
				);
			}
			throw switchError;
		}
	}

	async function evmLogin(data) {
		const { chainIdHex } = data;

		try {
			await initializeProvider();
			await switchChain(chainIdHex);

			signer = provider.getSigner();
			const address = await signer.getAddress();

			return address;
		} catch (error) {
			console.log("evmLogin error", error);
			return { error: error.message || error };
		}
	}

	async function solanaLogin() {
		if (window.solana && window.solana.isPhantom) {
			try {
				const response = await window.solana.connect();

				let publicKey = response.publicKey.toString();

				return publicKey;
			} catch (err) {
				return { error: err };
			}
		} else {
			return { error: "Phantom Wallet is not installed." };
		}
	}

	const bindError = (error) => {
		if (error?.reason) {
			console.error(`Error reason: ${error.reason}`);
			return error.reason;
		} else if (error?.data?.message) {
			const message = error?.data?.message;
			console.error(`Decoded error: ${message}`);
			return message;
		} else {
			return error.message;
		}
	};

	async function signAndSendTransaction(hexValue) {
		try {
			const tx = ethers.utils.parseTransaction(hexValue);

			const provider = new ethers.providers.Web3Provider(window.ethereum);

			const signer = provider.getSigner();

			const transaction = {
				to: tx.to,
				value: tx.value,
				gasLimit: tx.gasLimit,
				gasPrice: tx.gasPrice,
				nonce: tx.nonce,
				chainId: tx.chainId,
			};

			const signedTx = await signer.sendTransaction(transaction);

			await signedTx.wait();

			console.log("Transaction Hash:", signedTx);
			return signedTx.hash;
		} catch (error) {
			console.log("error", error);
			let err = bindError(error);
			return { error: err };
		}
	}

	async function signSolanaSendTransaction(buffer) {
		try {
			console.log("buffer", buffer);
			let tx = solanaWeb3?.VersionedTransaction.deserialize(
				new Uint8Array(buffer)
			);

			console.log("tx", tx);
			if (window.solana && window.solana.isPhantom) {
				const transactionSignature =
					await window.solana.signAndSendTransaction(tx);

				return transactionSignature;
			} else {
				return {
					error: "Phantom Wallet is not installed or not detected.",
				};
			}
		} catch (error) {
			let err = bindError(error);
			console.error("Failed to send Solana transaction:", error);
			return { error: err };
		}
	}

	const verifyWallet = () => {
		if (window?.unisat && typeof window?.unisat !== "undefined") {
			return true;
		} else {
			return false;
		}
	};

	const verifyOkxWallet = () => {
		if (window?.okxwallet && typeof window?.okxwallet !== "undefined") {
			return true;
		} else {
			return false;
		}
	};

	const verifyBtcWallet = async () => {
		let verifyBtcWalletObj = [];
		if (verifyOkxWallet()) {
			verifyBtcWalletObj.push("okx");
		}
		if (verifyWallet()) {
			verifyBtcWalletObj.push("unisat");
		}

		return verifyBtcWalletObj;
	};

	const loginBtcWallet = async (chainId) => {
		if (verifyOkxWallet() && btcWalletType == "okx") {
			try {
				let result;
				if (chainId == "8333") {
					result = await window?.okxwallet.bitcoin.connect();
				} else {
					result = await window?.okxwallet.bitcoinTestnet.connect();
				}

				if (result?.address) {
					getBtcSignature();
				}
			} catch (e) {
				console.log("connect failed");
			}
		}
		if (verifyWallet() && btcWalletType == "unisat") {
			try {
				let accounts = await win.unisat.requestAccounts();
				if (accounts[0]) {
					getBtcSignature();
				}
			} catch (e) {
				console.log("connect failed");
			}
		}

		return null;
	};

	const getEvmSignature = async (str) => {
		try {
			await initializeProvider();
			let signature = await signer.signMessage(str);
			return { signature };
		} catch (error) {
			let err = bindError(error);
			return { error: err };
		}
	};

	const getSolanaSignature = async (text) => {
		try {
			if (window.solana && window.solana.isPhantom) {
				const encodedMessage = new TextEncoder().encode(text);
				const res = await window.solana.signMessage(
					encodedMessage,
					"utf8"
				);
				const signature = JSON.stringify(Array.from(res?.signature)); // 序列化
				return { signature };
			} else {
				return {
					error: "Phantom Wallet is not installed or not detected.",
				};
			}
		} catch (error) {
			let err = bindError(error);
			return { error: err };
		}
	};

	const getBtcSignature = async (chainId, text, btcWalletType) => {
		try {
			if (btcWalletType == "unisat" && window?.unisat) {
				let signature = await window.unisat.signMessage(text);
				return { signature };
			}
			if (btcWalletType == "okx" && window?.okxwallet) {
				let signature = await window.okxwallet.bitcoin.signMessage(
					text,
					"ecdsa"
				);
				return { signature };
			}
			loginBtcWallet(chainId, btcWalletType);
		} catch (error) {
			let err = bindError(error);
			return { error: err };
		}
	};

	const bindNetwork1 = (chainId) => {
		if ([8333, 18333].includes(Number(chainId))) {
			return "btc";
		}
		if ([900, 901].includes(Number(chainId))) {
			return "Solana";
		}

		return "evm";
	};

	async function bindSignMessage(data) {
		try {
			let chainId = data?.chainId;
			let text = data?.text;
			let network = bindNetwork1(chainId);
			let btcWalletType = data?.btcWalletType;
			let targetAddress = data?.address;
			let chainIdHex = data?.chainIdHex;

			if (network == "btc") {
				let res = await getBtcSignature(chainId, text, btcWalletType);
				return res;
			}
			if (network == "Solana") {
				let res = await getSolanaSignature(text);
				return res;
			}

			if (network == "evm") {
				await initializeProvider();

				signer = provider.getSigner();
				const currentAddress = await signer.getAddress();

				if (
					targetAddress &&
					targetAddress.toLowerCase() !== currentAddress.toLowerCase()
				) {
					await window.ethereum.request({
						method: "wallet_requestPermissions",
						params: [{ eth_accounts: {} }],
					});

					provider = new ethers.providers.Web3Provider(
						window.ethereum
					);
					signer = provider.getSigner();

					let res = await getEvmSignature(text);
					return res;
				} else {
					let res = await getEvmSignature(text);
					return res;
				}
			}
		} catch (error) {
			console.log("error", error);
			let err = bindError(error);
			return { error: err };
		}
	}

	window.addEventListener("message", async function (event) {
		if (event.source !== window) {
			return;
		}

		if (event.data && event.data.type === "REQ_SIGN_AND_SEND_TRANSACTION") {
			const result = await signAndSendTransaction(event.data.payload);
			window.postMessage(
				{ type: "RES_SIGN_AND_SEND_TRANSACTION", payload: result },
				"*"
			);
		}

		if (
			event.data &&
			event.data.type === "REQ_SIGN_SOLANA_SEND_TRANSACTION"
		) {
			console.log("event.data.payload", event.data.payload);
			const result = await signSolanaSendTransaction(event.data.payload);
			window.postMessage(
				{ type: "RES_SIGN_SOLANA_SEND_TRANSACTION", payload: result },
				"*"
			);
		}
		if (event.data && event.data.type === "REQ_SOLANA_LOGIN") {
			console.log("REQ_SOLANA_LOGIN");
			const result = await solanaLogin(event.data.payload);
			window.postMessage(
				{ type: "RES_SOLANA_LOGIN", payload: result },
				"*"
			);
		}

		if (event.data && event.data.type === "REQ_EVM_LOGIN") {
			const result = await evmLogin(event.data.payload);
			window.postMessage({ type: "RES_EVM_LOGIN", payload: result }, "*");
		}

		if (event.data && event.data.type === "REQ_SIGNMESSAGE") {
			const result = await bindSignMessage(event.data.payload);
			window.postMessage(
				{ type: "RES_SIGNMESSAGE", payload: result },
				"*"
			);
		}

		if (event.data && event.data.type === "REQ_VERIFYBTCWALLET") {
			const result = await verifyBtcWallet(event.data.payload);
			window.postMessage(
				{ type: "RES_VERIFYBTCWALLET", payload: result },
				"*"
			);
		}
	});
})();
