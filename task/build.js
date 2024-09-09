const { notify, exec } = require("./utils");
require("dotenv").config();

notify(`Build YepWallet UI`);

exec("npx react-app-rewired build", {
	stdio: "inherit",
	env: {
		...process.env,
		INLINE_RUNTIME_CHUNK: false,
	},
});

notify(`Build YepWallet background.js, provider.js, content.js`);

exec("npx webpack -c task/webpack.config.js", {
	stdio: "inherit",
	env: process.env,
});

notify(`Happy End! 🚀🚀🚀`);
