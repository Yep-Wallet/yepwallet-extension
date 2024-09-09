export enum AppRoute {
	settings = "/settings",
	notifications = "/notifications",
	import = "/import",
	connect = "/connect",
	connections = "/connections",
	home = "/",
	buy = "/buy",
	receive = "/receive",
	send = "/send",
	swap = "/swap",
	activities = "/activities",
	assets = "/assets",
	wallet = "/wallet",
	browser = "/browser",
	payfi = "/payfi",
}

export const any = (route: string): string => {
	return `${route}/*`;
};

export const relative = (path: string): string => {
	return `.${path}`;
};
