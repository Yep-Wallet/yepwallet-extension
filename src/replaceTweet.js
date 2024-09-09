import React from "react";
import ReactDOM from "react-dom";
import { debounce } from "./utils";
import { bindExistenceOrNot, fetchData, getAllATagLinks } from "./utils.ts";
import CreateFrom from "./view/createFrom";
import ReplaceTweetContent from "./view/replaceTweetContent";

// Replace tweet content
const replaceTweetContent = async (list) => {
	try {
		const allLinks = getAllATagLinks(document.body);

		// Send request
		if (allLinks?.length > 0) {
			for (let item of allLinks) {
				const { href, element } = item;
				const parent = element?.parentNode;
				const parentParent = parent?.parentNode;

				var myComponent = document.getElementById(href);
				if (element && !myComponent) {
					const res = await bindExistenceOrNot(list, href);
					if (res?.apiPath) {
						const apiRes = await fetchData(res.apiPath);
						if (apiRes) {
							const div = document.createElement("div");
							parentParent?.replaceWith(div);

							div.id = href;

							ReactDOM.render(
								<ReplaceTweetContent
									key={href}
									data={apiRes}
									pathPattern={res.pathPattern}
									href={res.href}
									tcoHref={href}
								/>,
								div
							);
						}
					}
				}
			}
		}
	} catch (error) {
		console.log("error", error);
	}
};

// @memelinksxyz $pump$
const bindTweetText = () => {
	const tweetTexts = document.querySelectorAll(
		'div[data-testid="tweetText"]'
	); // Get all elements using querySelectorAll

	if (tweetTexts) {
		for (let index = 0; index < tweetTexts.length; index++) {
			const textarea = tweetTexts[index];

			// Get the text content of the tweet
			const content = textarea?.innerText || "";

			//
			let textareaId = textarea?.id;
			// Check if the tweet content meets the standard
			var myComponent = document.getElementById(`memelinks${textareaId}`);

			if (
				content.includes("@memelinksxyz") &&
				content.includes("$pump$") &&
				!myComponent
			) {
				// Create a new div for storing the CreateFrom component
				const div = document.createElement("div");
				div.style.marginTop = "5px"; // Add some margin

				// Render the CreateFrom component into the newly created div
				ReactDOM.render(
					<CreateFrom content={content} id={textareaId} />,
					div
				);

				// Insert the newly created div below the tweet content
				textarea.parentNode.insertBefore(div, textarea.nextSibling);
				console.log("React", React.useId);
			}
		}
	}
};

/**
 * Set up Mutation Observer to watch for changes on the Twitter page
 */
export async function observeTwitterPageChanges() {
	const list = await fetchData("https://api.memelinks.xyz/api/registry/all");

	if (!(list?.length > 0)) return;
	// Configure observer options
	const observerOptions = {
		childList: true, // Listen to changes in child nodes
		subtree: true, // Listen to changes in the entire subtree
	};

	const callback = (mutationsList) => {
		for (const mutation of mutationsList) {
			if (mutation.type === "childList") {
				// Handle changes here
				handlePageChanges(list);
			}
		}
	};

	// Create and start Mutation Observer
	const observer = new MutationObserver(callback);
	observer.observe(document, observerOptions);

	// Optionally, disconnect the observer under certain conditions
	// observer.disconnect();
}

const handlePageChanges = debounce((list) => {
	replaceTweetContent(list);
	bindTweetText();
}, 500);
