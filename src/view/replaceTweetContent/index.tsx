import { Button, Input, message, Modal, Select, Spin, Tag } from "antd";
import bs58 from "bs58";
import { useRef, useState } from "react";
import { Chain, decimalToHex, detectWalletType } from "../../utils";
// const { Buffer } = require("buffer");

// 调用注入的方法
export function callInjectedFunction(
	AcceptanceType: string,
	SendType: string,
	data?: {}
) {
	return new Promise((resolve) => {
		// 监听结果消息
		function handleMessage(event: any) {
			if (event.source !== window) {
				return; // 忽略不属于当前页面的消息
			}

			if (event.data && event.data.type === AcceptanceType) {
				window.removeEventListener("message", handleMessage);

				resolve(event.data.payload);
			}
		}

		window.addEventListener("message", handleMessage);

		// 发送消息到注入的脚本
		window.postMessage({ type: SendType, payload: data }, "*");
	});
}

function splitArrayByParametersField(arr: any[]) {
	let withParams: any[] = [];
	let withoutParams: any[] = [];

	arr?.forEach((item) => {
		if (item?.parameters) {
			withParams.push(item);
		} else {
			withoutParams.push(item);
		}
	});

	return [withParams, withoutParams];
}
export const bind_evm_login = async (chainId: string) => {
	let chainIdHex = decimalToHex(chainId);

	let result = await callInjectedFunction("RES_EVM_LOGIN", "REQ_EVM_LOGIN", {
		chainIdHex,
	});
	return result;
};

export const bind_solana_login = async () => {
	let address = await callInjectedFunction(
		"RES_SOLANA_LOGIN",
		"REQ_SOLANA_LOGIN"
	);
	return address;
};
// solana 链id
export const solanaChainIds = [901, 900, 902];

// 根据链id 获取对应的钱包地址
export const getAddress = async (chainId: string) => {
	try {
		let address: any;
		// SOLANA
		if (solanaChainIds.includes(Number(chainId))) {
			address = await bind_solana_login();
		} else {
			address = await bind_evm_login(chainId);
		}

		if (address?.error) {
			message.error(address?.error);
			return;
		}
		return address;
	} catch (error) {
		console.log("error", error);
	}
};

export const bindSolana = async (rawTx: any) => {
	// 将序列化交易字符串转换为 Buffer

	console.log("rawTx", rawTx);

	// 解码 Base64 为二进制字符串
	const binaryString = atob(rawTx);

	// 将二进制字符串转换为 Uint8Array
	const buffer = new Uint8Array(binaryString.length);

	for (let i = 0; i < binaryString.length; i++) {
		buffer[i] = binaryString.charCodeAt(i);
	}

	console.log("buffer", buffer);

	let result: any = await callInjectedFunction(
		`RES_SIGN_SOLANA_SEND_TRANSACTION`,
		`REQ_SIGN_SOLANA_SEND_TRANSACTION`,
		buffer
	);
	return result;
};

export default function ReplaceTweetContent({
	data,
	pathPattern,
	href,
	tcoHref,
}: any) {
	const [inputValueObj, setInputValueObj] = useState<any>(null);
	const [load, _load] = useState(false);
	const [btcType, _btcType] = useState("");
	const [isModalOpen, setIsModalOpen] = useState("");
	const [verifyBtcWallet, _verifyBtcWallet]: any = useState([]);
	const iconRef: any = useRef(null);
	const descriptionRef: any = useRef(null);

	let id = data?.chainId;

	let [withParamsArray, withoutParamsArray]: any =
		splitArrayByParametersField(data?.neuron?.impulses);

	function isP2PKHAddress(address: string) {
		return address.startsWith("1");
	}

	function isP2SHAddress(address: string) {
		return address.startsWith("3");
	}

	function isP2WPKHAddress(address: string) {
		return address.startsWith("bc1q");
	}

	function isTaprootAddress(address: string) {
		return address.startsWith("bc1p");
	}

	function getAddressType(address: string) {
		if (isP2PKHAddress(address)) {
			return "legacy";
		} else if (isP2SHAddress(address)) {
			return "Nested SegWit";
		} else if (isP2WPKHAddress(address)) {
			return "Native SegWit";
		} else if (isTaprootAddress(address)) {
			return "Taproot";
		} else {
			return "Unknown";
		}
	}

	// btc判断地址类型展示标签
	const bindBtcType = (value: string) => {
		let network = bindNetwork(id);

		if (network == "btc") {
			let type = getAddressType(value);
			_btcType(type);
		}
	};

	function onChange(type: string, e: any) {
		let value = e;
		let obj = {
			...inputValueObj,
			[type]: value,
		};
		setInputValueObj(obj);

		let chain = detectWalletType(value);
		if (chain) {
			let obj1 = {
				...obj,
				["chain"]: chain,
			};
			setInputValueObj(obj1);
		}

		if (value?.length > 4) {
			bindBtcType(value);
		}
	}

	// 获取推主id
	const getXId = () => {
		//获取推特名字  去掉开头的'@'
		const usernameElement: any = document.querySelector(
			'a[data-testid="AppTabBar_Profile_Link"]'
		);

		if (usernameElement) {
			let url = usernameElement.href;

			if (url) {
				const urlObject = new URL(url);

				// 获取路径名并去除开头的 "/"
				const accountName = urlObject.pathname.substring(1);
				return accountName;
			}
		} else {
			return null;
		}
	};

	// 判断是什么网络
	const bindNetwork = (chainId: any) => {
		if ([8333, 18333].includes(Number(chainId))) {
			return "btc";
		}
		if ([900, 901].includes(Number(chainId))) {
			return "Solana";
		}

		return "evm";
	};

	// 解析签名信息
	const getSignature = async (chainId: any, signature: any) => {
		let network = bindNetwork(chainId);

		if (network == "Solana") {
			const uint8Array = new Uint8Array(JSON.parse(signature)); // 反序列化

			const base58Signature = bs58.encode(uint8Array);

			return base58Signature;
		} else {
			return signature;
		}
	};

	//

	// 登记
	const bindBind = async (href: string, btcWalletType?: string) => {
		try {
			// 获取推主id
			let xId = getXId();

			let address = inputValueObj?.address;
			let chain = inputValueObj?.chain;
			let chainId = Chain[chain];
			const text = `I am linking Twitter account @${xId} to address ${address} on ${chain}.`;
			_load(true);

			let chainIdHex = decimalToHex(chainId);

			let data = {
				text,
				chainId,
				btcWalletType,
				address,
				chainIdHex,
			};
			let result: any = await callInjectedFunction(
				`RES_SIGNMESSAGE`,
				`REQ_SIGNMESSAGE`,
				data
			);
			if (result?.error) {
				_load(false);
				message.error(result?.error);
				return;
			}

			if (result?.signature) {
				let signature = await getSignature(chainId, result?.signature);
				let data = {
					transaction: signature,
					twitterUsername: xId,
				};

				let url = href;
				const response = await fetch(url, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						// 在这里可以添加其他请求头信息，比如 Authorization 等
					},
					body: JSON.stringify(data),
				});
				const responseData = await response.json(); // 如果需要将响应内容解析为 JSON

				_load(false);

				if (responseData?.success) {
					message.success("Successful operation");
					return responseData?.data;
				} else {
					message.error(responseData?.message);
				}
			}
			_load(false);
		} catch (error: any) {
			console.log("error", error);
			if (error?.response?.data?.message) {
				message.error(error?.response?.data?.message);
			}
			_load(false);
		}
	};

	// meme查询返回数据更新数据
	const bindReplace = (data: any) => {
		if (data?.icon) {
			iconRef.current.src = data?.icon;
		}
		if (data?.description) {
			descriptionRef.current.innerHTML = data?.description;
		}
	};

	//对应操作
	const bindControls = async (href: string) => {
		// 登记
		if (
			(pathPattern && pathPattern.includes("bind")) ||
			pathPattern.includes("meme")
		) {
			if (inputValueObj?.chain) {
				let chainId = Chain[inputValueObj.chain];
				if (!chainId) {
					message.error("Please select chain");
					return;
				}

				let network = bindNetwork(chainId);

				if (network == "btc") {
					let result: any = await callInjectedFunction(
						`RES_VERIFYBTCWALLET`,
						`REQ_VERIFYBTCWALLET`
					);
					_verifyBtcWallet(result);
					setIsModalOpen(href);
				} else {
					let res = await bindBind(href);
					bindReplace(res);
				}
			}
		} else {
			await bindPerform(href);
		}
	};

	// 执行操作
	const bindPerform = async (href: string) => {
		try {
			_load(true);
			// 先获取对应钱包地址
			let address = await getAddress(id);

			if (!address) {
				_load(false);
				return;
			}

			let data = {
				account: address,
			};

			let url = href;

			const response = await fetch(url, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					// 在这里可以添加其他请求头信息，比如 Authorization 等
				},
				body: JSON.stringify(data),
			});
			const responseData = await response.json(); // 如果需要将响应内容解析为 JSON

			let hexValue = responseData?.transaction;

			if (hexValue) {
				if (solanaChainIds.includes(Number(id))) {
					let result = await bindSolana(hexValue);
					if (result.error) {
						message.error(result.error);
						_load(false);
						return;
					}

					if (result) {
						_load(false);
						message.success("Operation successful");
					}
				} else {
					let result: any = await callInjectedFunction(
						`RES_SIGN_AND_SEND_TRANSACTION`,
						`REQ_SIGN_AND_SEND_TRANSACTION`,
						hexValue
					);
					if (result.error) {
						message.error(result.error);
						_load(false);
						return;
					}
					if (result) {
						_load(false);
						message.success("Operation successful");
					}
				}
			} else {
				_load(false);

				message.error(responseData?.message);
			}
		} catch (error: any) {
			if (error?.response?.data?.message) {
				message.error(error?.response?.data?.message);
			}
			_load(false);
		}
	};

	//检查
	const bindCheck = async (href: string) => {
		try {
			_load(true);
			// 先获取对应钱包地址
			let address = inputValueObj?.address;

			if (!address) {
				message.error("Please enter the address");
				_load(false);
				return false;
			}
			let xId = getXId();

			let data = {
				twitterUsername: xId,
			};
			let url = href;

			const response = await fetch(url, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					// 在这里可以添加其他请求头信息，比如 Authorization 等
				},
				body: JSON.stringify(data),
			});
			const responseData = await response.json(); // 如果需要将响应内容解析为 JSON

			if (responseData?.success) {
				return true;
			} else {
				message.error(responseData?.message);
				_load(false);
				return false;
			}
		} catch (error: any) {
			_load(false);
			return false;
		}
	};

	const replaceAmountInUrl = (baseUrl: string, type: string, amount: any) => {
		// 使用字符串的 replace 方法，将 {type} 替换为传入的参数
		return baseUrl?.replace(`{${type}}`, amount);
	};

	const handleOk = async (btcWalletType: string) => {
		setIsModalOpen("");
		let res = await bindBind(isModalOpen, btcWalletType);
		bindReplace(res);
	};

	const getDescription = (data: any) => {
		return data?.description;
	};

	const getBtnLabel = (item: any) => {
		return item?.label;
	};
	return (
		<Spin spinning={load}>
			<div
				className={`lfgReplace lfgReplaceTheme${data?.theme || 0}`}
				id={tcoHref}
			>
				<header className="lfgReplaceMainHeader">
					<a href={href}>
						<img src={data?.icon} alt="" ref={iconRef} />
					</a>
				</header>
				<main className="lfgReplaceMain">
					{data?.title && (
						<div className="lfgReplaceMainInfo">
							<div className="lfgReplaceMainInfoTitle">
								{data?.title}
							</div>
						</div>
					)}
					{data?.description && (
						<p className="lfgReplaceMainInfoP" ref={descriptionRef}>
							{getDescription(data)}
							<br />
							{data?.description_bold && (
								<strong>{data?.description_bold}</strong>
							)}
						</p>
					)}
					{withParamsArray && withParamsArray?.length > 0 && (
						<>
							<div className="lfgReplaceMainInput">
								{withParamsArray
									? withParamsArray[0]?.parameters?.map(
											(item: any) => {
												if (item?.type == "select") {
													return (
														<Select
															fieldNames={{
																label: "name",
																value: "id",
															}}
															size="large"
															placeholder={
																item?.label
															}
															style={{
																width: 140,
															}}
															onChange={(e) =>
																onChange(
																	item?.name,
																	e
																)
															}
															onClick={(e) => {
																e.stopPropagation();
																e.preventDefault();
															}}
															className="lfgReplaceMainInputSelect"
															options={
																item?.options
															}
														/>
													);
												}

												return (
													<Input
														key={item?.label}
														onChange={(e) =>
															onChange(
																item?.name,
																e.target.value
															)
														}
														size="large"
														className={
															"lfgReplaceMainInputInput"
														}
														placeholder={
															item?.label
														}
													/>
												);
											}
									  )
									: null}

								<Button
									className="lfgReplaceMainInputBtn"
									size="large"
									onClick={async () => {
										if (
											inputValueObj &&
											withParamsArray?.length > 0
										) {
											let href = withParamsArray[0]?.href;
											let check_href =
												withParamsArray[0]?.check_href;
											let array =
												withParamsArray[0]?.parameters;

											for (
												let index = 0;
												index < array.length;
												index++
											) {
												const element = array[index];
												href = replaceAmountInUrl(
													href,
													element?.name,
													inputValueObj[element?.name]
												);
												check_href = check_href
													? replaceAmountInUrl(
															check_href,
															element?.name,
															inputValueObj[
																element?.name
															]
													  )
													: check_href;
											}

											let check = true;

											//有检查字段则先检查
											if (check_href) {
												check = await bindCheck(
													check_href
												);
											}

											if (check) {
												bindControls(href);
											}
										}
									}}
								>
									{withParamsArray
										? getBtnLabel(withParamsArray[0])
										: ""}
								</Button>
							</div>
							{btcType && (
								<Tag className="lfgReplaceMainInputTag">
									{btcType}
								</Tag>
							)}
						</>
					)}
					<div className={"withoutParamsArray"}>
						{withoutParamsArray?.map((item: any) => {
							return (
								<Button
									size="large"
									key={item?.label}
									className="withoutParamsArrayItem"
									onClick={(e) => {
										item?.href && bindControls(item?.href);
										e.stopPropagation();
										e.preventDefault();
									}}
								>
									{getBtnLabel(item)}
								</Button>
							);
						})}
					</div>
				</main>
				<Modal
					className="modalTransparent"
					open={!!isModalOpen}
					footer={false}
					closeIcon={null}
					onCancel={() => {
						setIsModalOpen("");
					}}
					centered
				>
					<div className="lfgReplace navModalContent">
						<div className="navModalContentTitle">
							Which wallet would you like to use?
						</div>
						<div className="navModalContentCon">
							{[
								{
									id: 1,
									name: "unisat",
									icon: "https://lh3.googleusercontent.com/FpdgjbCU_f4VZUrc3uNC7RY70OIrDpn1bQM-eSw9tIgaGtztz7A_REOwDCxFsZMWnw43IWCEn9PtD2A8Y0env7lB2OU=s60",
								},
								{
									id: 2,
									name: "okx",
									icon: "https://lh3.googleusercontent.com/sO4GPPbgvTCXEFWp-uALYYju9vxVOr5YSr2jqRAclNFSq8FrAIVTQOYmpJV4kMuDM1ZazcgUdjNGLIGKpmMRvR3NzQ=s60",
								},
							].map((item) => {
								return (
									<div
										className={`${
											verifyBtcWallet?.includes(item.name)
												? ""
												: "navModalContentItemDisabled"
										} navModalContentItem`}
										key={item.id}
										onClick={() => {
											if (
												verifyBtcWallet?.includes(
													item.name
												)
											) {
												handleOk(item.name);
											}
										}}
									>
										<img
											className=" navModalContentItemImg "
											alt="Unisat"
											loading="lazy"
											width="36"
											height="36"
											decoding="async"
											data-nimg="1"
											src={item.icon}
											style={{ color: "transparent" }}
										/>
										{item.name}
									</div>
								);
							})}
						</div>
					</div>
				</Modal>
			</div>
		</Spin>
	);
}
