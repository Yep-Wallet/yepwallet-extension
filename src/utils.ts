export const debounce = (func: any, wait: any) => {
	let timeout: any;

	return (...args: any) => {
		clearTimeout(timeout);
		timeout = setTimeout(() => func(...args), wait);
	};
};

export function decimalToHex(decimal: any) {
	return "0x" + Number(decimal).toString(16);
}

export const getAllList = async () => {
	try {
		let res = await fetchData("https://api.memelinks.xyz/api/registry/all");
		return res;
	} catch (error) {
		console.log("error", error);
	}
};

// Normalize URL
export const normalizeURL = (url: string) => {
	if (url?.endsWith("/") || url?.includes("/**")) {
		url = url.replace(/\/\*{2,}$/, "");
	}
	return url;
};

// Find Elements in Array by Type
export const findItemByType = (array: any[], type: string, target: string) => {
	const foundItem = array?.find((item) => item[type]?.includes(target));
	return foundItem
		? { found: true, item: foundItem }
		: { found: false, item: null };
};

// Get Content After Matching String
export const getAfterTransfer = (str: string, matchString: string) => {
	const index = str.lastIndexOf(matchString) + matchString.length;

	if (index > 0) {
		return str.substring(index);
	} else {
		return "";
	}
};
// Get Trade Data
export const getTradeData = (url: string, matchString: any) => {
	const result = getAfterTransfer(url, matchString);
	if (result) {
		return result;
	} else {
		console.log(`No data matching ${matchString} found`);
		return "";
	}
};

// Check if it is a full URL
export const isFullRoute = (address: string) => {
	const regex = /^(http|https):\/\/[^ "]+$/;
	return regex.test(address);
};

// Get the part after the first slash
export const getAfterFirstSlash = (str: string) => {
	const parts = str.split("/");
	return parts.length > 1 ? parts[1] : null;
};

// Join strings
export const joinStrings = (str1: string, str2: string) => {
	if (str1.endsWith("/") && str2.startsWith("/")) {
		return str1 + str2.slice(1);
	} else {
		return str1 + str2;
	}
};

// Parse redirects from URL
export const Rbr = async (t: any) => {
	let r = await (await fetch(t)).text();
	let o: any = new DOMParser()
		.parseFromString(r, "text/html")
		.querySelector("title")?.textContent;
	return new URL(o);
};
const requestCache = new Map();

export const fetchData = async (url: string) => {
	// Check if data is in cache
	if (requestCache.has(url)) {
		return requestCache.get(url);
	}

	try {
		// Make the request
		const response = await fetch(url);

		// Check response status
		if (!response.ok) {
			throw new Error(
				`Network response was not ok ${response.statusText}`
			);
		}

		// Parse JSON response
		const data = await response.json();

		if (data) {
			// Store data in cache after successful request
			requestCache.set(url, data);
		}

		return data;
	} catch (error) {
		console.log("error", error);
		throw error;
	}
};

// Check if it exists in the registry
export const bindExistenceOrNot = async (
	list: any[],
	href: string | string[]
) => {
	let url = href;
	if (href.includes("https://t.co")) {
		let rbr = await Rbr(href);
		url = rbr?.href ? rbr.href : "";

		if (isFullRoute(url)) {
			const parsedUrl = new URL(url);
			const hostname = parsedUrl.hostname;
			const pathnameStr = parsedUrl.pathname;
			const pathname: any = getAfterFirstSlash(pathnameStr);

			const isContained = findItemByType(list, "host", hostname);
			if (isContained?.found) {
				let res = await fetchData(`https://${hostname}/memelinks.json`);
				let rules = res?.rules;

				const result = findItemByType(rules, "pathPattern", pathname);
				if (result?.found) {
					let pram = getTradeData(url, pathname);
					let apiPath = normalizeURL(result?.item?.apiPath);
					let pathPattern = normalizeURL(result?.item?.pathPattern);

					return {
						apiPath: joinStrings(apiPath, pram),
						pathPattern,
						href: url,
					};
				}
			}
		}
	}
	return "";
};

export const getAllATagLinks = (element: any) => {
	let linksWithTags: any[] = [];

	// Assuming 'element' is the container holding multiple tweets, such as a feed or timeline.
	const tweets = element.querySelectorAll('[data-testid="tweet"]'); // Use data-testid or class name to find tweets

	tweets.forEach((tweet: any) => {
		const links = tweet.getElementsByTagName("a");
		for (let i = 0; i < links.length; i++) {
			const link = links[i];
			linksWithTags.push({ href: link.href, element: link });
		}
	});

	return linksWithTags;
};

export const Chain: any = {
	EVM: 1,
	SOL: 900,
	BTC: 8333,
};

export function detectWalletType(address: string) {
	// 1. Check for EVM-compatible addresses
	if (/^(0x[a-fA-F0-9]{40})$/.test(address)) {
		return "EVM";
	}

	const btcRegex =
		/^(1[a-km-zA-HJ-NP-Z1-9]{25,34}|3[a-km-zA-HJ-NP-Z1-9]{25,34}|bc1[a-zA-HJ-NP-Z0-9]{39,59})$/;
	// 2. Check for Bitcoin addresses
	if (btcRegex.test(address)) {
		return "BTC";
	}

	// 3. Check for Solana addresses
	if (/^([a-zA-Z0-9]{32,44})$/.test(address)) {
		return "SOL";
	}

	// 4. Unknown address type
	return "";
}
