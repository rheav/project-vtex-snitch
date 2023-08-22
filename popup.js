function openTab(evt, tabName) {
	var i, tabcontent, tablinks;

	tabcontent = document.getElementsByClassName("tabcontent");
	for (i = 0; i < tabcontent.length; i++) {
		tabcontent[i].style.display = "none";
	}

	tablinks = document.getElementsByClassName("tablink");
	for (i = 0; i < tablinks.length; i++) {
		tablinks[i].style.backgroundColor = "";
	}

	document.getElementById(tabName).style.display = "block";
	if (evt) {
		// Add this check
		evt.currentTarget.style.backgroundColor = "#ffe0ef";
	}
}

document.addEventListener("DOMContentLoaded", function () {
	// Attach click events to each tablink button
	let tablinks = document.querySelectorAll(".tablink");
	for (let tablink of tablinks) {
		tablink.addEventListener("click", function (event) {
			openTab(event, this.getAttribute("data-tab"));
		});
	}

	// Set default tab as Content
	openTab(null, "Content");

	// Set the default background color for the "Content" tab
	let contentTab = document.querySelector('.tablink[data-tab="Content"]');
	if (contentTab) {
		contentTab.style.backgroundColor = "#ffe0ef";
	}
});

// store version messages
var versionText = document.getElementById("store-version");
var versionSub = document.getElementById("store-version-subtext");

// sales channel variables
var currentSalesChannel = document.getElementById("store-salesChannel");
var wrapperSalesChannel = document.getElementById("store-salesChannel-holder");
var salesChannelSub = document.getElementById("store-salesChannel-subtext");

// accountName variables
var wrapperAccount = document.getElementById("store-account-holder");
var accountText = document.getElementById("store-account-holder__accoutName");
var accountSub = document.getElementById("store-account-subtext");
var accountName = "";

// pixel loaders
var fbLoaded = document.getElementById("fb-pixel-loaded");
var gtmLoaded = document.getElementById("gtm-loaded");
var gaUALoaded = document.getElementById("ua-loaded");
var ga4Loaded = document.getElementById("ga4-loaded");
var taboolaLoaded = document.getElementById("taboola-loaded");
var tiktokLoaded = document.getElementById("tiktok-loaded");
var pinterestLoaded = document.getElementById("pinterest-loaded");

// pixel counters
var fbAppear = document.getElementById(`fb-ocurr`);
var gtmAppear = document.getElementById(`gtm-ocurr`);
var gaUAAppear = document.getElementById(`gaUa-ocurr`);
var ga4Appear = document.getElementById(`ga4-ocurr`);
var tiktokAppear = document.getElementById(`ttk-ocurr`);
var taboolaAppear = document.getElementById(`tab-ocurr`);
var pinterestAppear = document.getElementById(`pinterest-ocurr`);

// meta tags loaders
var facebookMetaTagLoaded = document.getElementById("facebookMeta-loaded");
var googleTagLoaded = document.getElementById("googleMeta-loaded");
var pinterestTagLoaded = document.getElementById("pinterestMeta-loaded");

// meta tag counters
var fbMetaTagCount = document.getElementById(`facebookMeta-ocurr`);
var googleMetaTagCount = document.getElementById("googleMeta-ocurr");
var pinterestMetaTagCount = document.getElementById("pinterestMeta-ocurr");

function getAccountName() {
	chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
		var activeTab = tabs[0];
		var tabId = activeTab.id;

		chrome.scripting.executeScript(
			{
				target: { tabId: tabId },
				function: function () {
					var sourceCode = document.documentElement.outerHTML;
					var match = sourceCode.match(/https:\/\/([\w-]+)\.(vteximg\.com\.br|vtexassets\.com)\//);
					return match ? match[1] : null;
				},
			},
			function (results) {
				accountName = results[0].result;

				if (accountName && accountName.length < 30) {
					accountText.innerText = accountName;
					document.querySelector(".warn-msg").style.display = "none";
				} else {
					wrapperAccount.innerText = "❌ Account name not found";
					accountSub.innerHTML =
						"⚠️ If this is a FastStore or headless store, check for the accountName directly into source code (CTRL+U).";
					accountSub.style.display = "inline-flex";
					document.querySelector(".product-info-container").innerHTML = "";
				}
			}
		);
	});
}

function getStoreType() {
	var sourceCode = document.documentElement.outerHTML;
	var storeType = "";

	if (sourceCode.includes("__RUNTIME__") && sourceCode.includes("vtexassets")) {
		storeType = "VTEX IO";
	} else if (sourceCode.includes("CommerceContext.Current.VirtualFolder.Name")) {
		storeType = "VTEX CMS";
	} else if (sourceCode.includes("vtexassets") && sourceCode.includes("vtex.file-manager-graphql")) {
		storeType = "FastStore";
	} else {
		storeType = "Unknown";
	}

	return { storeType: storeType };
}

function storeVersion() {
	chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
		var activeTab = tabs[0];
		var tabId = activeTab.id;

		chrome.scripting.executeScript(
			{
				target: { tabId: tabId },
				function: getStoreType,
			},

			function (results) {
				var response = results[0].result;

				if (response && response.storeType) {
					var storeType = response.storeType;

					if (storeType === "VTEX IO") {
						versionText.innerText = "✅ This store is using VTEX IO.";
					} else if (storeType === "VTEX CMS") {
						versionText.innerText = "✅ This store is using VTEX Legacy CMS.";
					} else if (storeType === "FastStore") {
						versionText.innerText = "✅ This store is using FastStore.";
						versionSub.innerText = "⚠️ Script detection not 100% verified!";
						versionSub.style.display = "inline-flex";
					} else {
						versionText.innerText = "❌ Unknown store type";
						versionSub.innerHTML =
							"⚠️ If this is indeed a VTEX account, then probably it's a &nbsp" +
							'<a target="_blank" href="https://developers.vtex.com/docs/guides/2023-06-06-new-integration-guide-headless-commerce">headless</a>&nbsp;' +
							" VTEX store";

						versionSub.style.display = "inline-flex";
					}
				}
			}
		);
	});
}

let g_salesChannel;

function getSalesChannel() {
	chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
		var url = new URL(tabs[0].url);
		var baseUrl = url.protocol + "//" + url.host;
		console.log("Base URL:", baseUrl);

		fetch(baseUrl + "/api/segments")
			.then((response) => response.json())
			.then((data) => {
				g_salesChannel = data.channel;
				currentSalesChannel.innerText = g_salesChannel;
			})
			.catch((error) => {
				wrapperSalesChannel.innerHTML =
					'❌ Error reading <span style="color:#f71963; font-style:italic;">channel</span> in Segments API';
				salesChannelSub.innerHTML =
					"⚠️ If this is a FastStore or headless store, it's expected. Check the SalesChannel through orderForm or network requests.";
				salesChannelSub.style.display = "inline-flex";
			});
	});
}

function getScriptsLoaded() {
	sourceCode = document.documentElement.outerHTML;

	var fbPixelRegex = /src="[^"]*connect\.facebook\.net\/en_US\/fbevents\.js"/g;
	var gtmRegex = /src="[^"]*googletagmanager\.com\/gtm\.js\?id=GTM-[^"]*"/g;
	var gaUARegex = /src="[^"]*(googletagmanager\.com\/gtag\/js\?id=UA|www\.google-analytics\.com\/analytics\.js)/g;
	var ga4Regex = /src="[^"]*googletagmanager\.com\/gtag\/js\?id=G-[^"]*"/g;
	var tiktokRegex = /analytics\.tiktok\.com\/i18n\/pixel\/events\.js\?sdkid=|<!--pixel:start:vtexbr\.tiktok-tbp-->/g;
	var taboolaRegex = /src="[^"]*cdn\.taboola\.com\/libtrc\/unip\/.*?"/g;
	var pinterestRegex = /window\.pintrk\s*\(\s*([^)]*)\s*\)/g;

	var scriptsLoaded = {
		fbPixel: sourceCode.match(fbPixelRegex),
		gtm: sourceCode.match(gtmRegex),
		gaUA: sourceCode.match(gaUARegex),
		ga4: sourceCode.match(ga4Regex),
		tiktok: sourceCode.match(tiktokRegex),
		taboola: sourceCode.match(taboolaRegex),
		pinterest: sourceCode.match(pinterestRegex),
	};

	return { scriptsLoaded: scriptsLoaded };
}

function loadedScripts() {
	chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
		activeTab = tabs[0];
		tabId = activeTab.id;

		chrome.scripting.executeScript(
			{
				target: { tabId: tabId },
				function: getScriptsLoaded,
			},
			function (results) {
				var response = results[0].result;

				if (response && response.scriptsLoaded) {
					var scriptsLoaded = response.scriptsLoaded;

					fbLoaded.innerHTML = scriptsLoaded.fbPixel ? "✅ Meta Pixel loaded" : "❌ Not loaded";
					gtmLoaded.innerHTML = scriptsLoaded.gtm ? "✅ GTM loaded" : "❌ Not loaded";
					gaUALoaded.innerHTML = scriptsLoaded.gaUA ? "✅ GA-UA tag loaded" : "❌ Not loaded";
					ga4Loaded.innerHTML = scriptsLoaded.ga4 ? "✅ GA4 tag loaded" : "❌ Not loaded";
					tiktokLoaded.innerHTML = scriptsLoaded.tiktok ? "✅ TikTok tag loaded" : "❌ Not loaded";
					taboolaLoaded.innerHTML = scriptsLoaded.taboola ? "✅ Taboola tag loaded" : "❌ Not loaded";
					pinterestLoaded.innerHTML = scriptsLoaded.pinterest ? "✅ Pinterest tag loaded" : "❌ Not loaded";
				}
			}
		);
	});
}

function countScripts() {
	chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
		var activeTab = tabs[0];
		var tabId = activeTab.id;

		chrome.scripting.executeScript(
			{
				target: { tabId: tabId },
				function: function () {
					var scriptCounts = {
						fbPixel: 0,
						gtm: 0,
						gaUA: 0,
						ga4: 0,
						tiktok: 0,
						taboola: 0,
						pinterest: 0,
					};

					var sourceCode = document.documentElement.outerHTML;

					var fbPixelRegex = /src="[^"]*connect\.facebook\.net\/en_US\/fbevents\.js"/g;
					var gtmRegex = /src="[^"]*googletagmanager\.com\/gtm\.js\?id=GTM-[^"]*"/g;
					var gaUARegex =
						/src="[^"]*(googletagmanager\.com\/gtag\/js\?id=UA|www\.google-analytics\.com\/analytics\.js)/g;
					var ga4Regex = /src="[^"]*googletagmanager\.com\/gtag\/js\?id=G-[^"]*"/g;
					var tiktokRegex =
						/analytics\.tiktok\.com\/i18n\/pixel\/events\.js\?sdkid=|<!--pixel:start:vtexbr\.tiktok-tbp-->/g;
					var taboolaRegex = /src="[^"]*cdn\.taboola\.com\/libtrc\/unip\/.*?"/g;
					var pinterestRegex = /window\.pintrk\s*\(\s*([^)]*)\s*\)/g;

					scriptCounts.fbPixel = (sourceCode.match(fbPixelRegex) || []).length;
					scriptCounts.gtm = (sourceCode.match(gtmRegex) || []).length;
					scriptCounts.gaUA = (sourceCode.match(gaUARegex) || []).length;
					scriptCounts.ga4 = (sourceCode.match(ga4Regex) || []).length;
					scriptCounts.tiktok = (sourceCode.match(tiktokRegex) || []).length;
					scriptCounts.taboola = (sourceCode.match(taboolaRegex) || []).length;
					scriptCounts.pinterest = (sourceCode.match(pinterestRegex) || []).length;

					return scriptCounts;
				},
			},
			function (results) {
				var response = results[0].result;

				// Display the counts in the extension popup or perform any desired action
				fbAppear.innerHTML = response.fbPixel;
				gtmAppear.innerHTML = response.gtm;
				gaUAAppear.innerHTML = response.gaUA;
				ga4Appear.innerHTML = response.ga4;
				tiktokAppear.innerHTML = response.tiktok;
				taboolaAppear.innerHTML = response.taboola;
				pinterestAppear.innerHTML = response.pinterest;
			}
		);
	});
}

function getMetaTags() {
	sourceCode = document.documentElement.outerHTML;

	var metaTagsLoaded = {
		googleMeta: sourceCode.includes("google-site-verification"),
		fbMeta: sourceCode.includes("facebook-domain-verification"),
		pinterestMeta: sourceCode.includes("p:domain_verify"),
	};

	return { metaTagsLoaded: metaTagsLoaded };
}

function loadedMetaTags() {
	chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
		activeTab = tabs[0];
		tabId = activeTab.id;

		chrome.scripting.executeScript(
			{
				target: { tabId: tabId },
				function: getMetaTags,
			},
			function (results) {
				var response = results[0].result;

				if (response && response.metaTagsLoaded) {
					var metaTagsLoaded = response.metaTagsLoaded;

					googleTagLoaded.innerHTML = metaTagsLoaded.googleMeta ? "✅ Google Verified" : "❌ Not loaded";
					facebookMetaTagLoaded.innerHTML = metaTagsLoaded.fbMeta ? "✅ Facebook Verified" : "❌ Not loaded";
					pinterestTagLoaded.innerHTML = metaTagsLoaded.pinterestMeta ? "✅ Pinterest Verified" : "❌ Not loaded";
				}
			}
		);
	});
}

function countMetaTags() {
	chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
		var activeTab = tabs[0];
		var tabId = activeTab.id;

		chrome.scripting.executeScript(
			{
				target: { tabId: tabId },
				function: function () {
					var metaTagCount = {
						facebookTag: 0,
						googleTag: 0,
						pinterestTag: 0,
					};

					sourceCode = document.documentElement.outerHTML;

					var facebookDomainVerificationRegex = /<meta\s+name="facebook-domain-verification"\s+content="([^"]+)"/g;
					var googleSiteVerificationRegex = /<meta\s+name="google-site-verification"\s+content="([^"]+)"/g;
					var pinterestSiteVerificationRegex = /<meta\s+name="p:domain_verify"\s+content="([^"]*)"\s*\/?>/g;

					metaTagCount.facebookTag = (sourceCode.match(facebookDomainVerificationRegex) || []).length;
					metaTagCount.googleTag = (sourceCode.match(googleSiteVerificationRegex) || []).length;
					metaTagCount.pinterestTag = (sourceCode.match(pinterestSiteVerificationRegex) || []).length;

					return metaTagCount;
				},
			},
			function (results) {
				var response = results[0].result;

				// Display the counts in the extension popup or perform any desired action
				fbMetaTagCount.innerHTML = response.facebookTag;
				googleMetaTagCount.innerHTML = response.googleTag;
				pinterestMetaTagCount.innerHTML = response.pinterestTag;
			}
		);
	});
}

const cookieWarn = document.getElementById("cookie-msg");
let g_cookieValue = "";
var currentTab = "";
var currentTabUrl = "";

// Transforming fetched info into gloal scoped info
let g_brandStatusData = "";
let g_categoryStatusData = "";
let g_productStatusData = "";

// Product Variables
let responseData = [];
let productLink = "";
let brandId = "";
let categoryId = "";
let productId = "";
let g_allSkusFromProduct = "";
let g_simulationResponse = "";

// Product Information locations in the DOM
const productTitlePlace = document.getElementById("product-name");
const productIdPlace = document.getElementById("product-id");
const brandIdPlace = document.getElementById("product-brand");
const categoryIdPlace = document.getElementById("product-category");

// SKU information location in the DOM
const skuId = document.getElementById("sku-id");
const skuName = document.getElementById("sku-name");
const skuStatus = document.getElementById("sku-status");
const g_skuQuantity = document.getElementById("sku-quantity");

// Status information locations in the DOM
const g_brandStatus = document.getElementById("product-brand-status");
const g_categoryStatus = document.getElementById("product-category-status");
const g_productStatus = document.getElementById("product-id-status");

// Simulation DOM variables
const simulationInfoContainer = document.getElementById("simulation-info-container");
const simulationResponse = document.getElementById("simulation-response");
const simulationWarn = document.querySelector(".sim-msg-container");
const simulationResumeStatus = document.getElementById("simulation-resume-status");
const simulationResumeStockBalance = document.getElementById("simulation-resume-stock");
const simulationResumeReason = document.getElementById("simulation-resume-reason");

// Simulation attributes
let g_simulationAvailability;
let g_simulationSkuId;
let g_stockBalance;

document.getElementById("submitBtn").addEventListener("click", function () {
	g_cookieValue = document.getElementById("cookieInput").value;
	cookieWarn.style.display = "block";

	if (g_cookieValue) {
		getCurrentUrl(); // Call this function to get the current URL when the cookie is valid

		// Show the hidden tabs
		let hiddenTabs = document.querySelectorAll(".hidden-tab");
		for (let tab of hiddenTabs) {
			tab.style.display = "inline-block";
		}
	} else {
		cookieWarn.textContent = "⚠️ Please, enter a valid authCookie";
		cookieWarn.style.backgroundColor = "#fff9c4";
	}
});

function getCurrentUrl() {
	chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
		currentTab = tabs[0];
		currentTabUrl = currentTab.url;

		productLink = getProductTextLink(currentTabUrl);
		console.log(`prodLink = ${productLink}`);

		if (productLink) {
			mainFetchInfo(productLink);
		} else {
			cookieWarn.textContent = "⚠️ Error in fetching product link from URL";
			cookieWarn.style.backgroundColor = "#fff9c4";
		}
	});
}

const regexObject = {
	casaspernambucanas: /:\/\/[^/]+\/(?:p\/)?(.*?)(?=\/p$|\/p\?|\/|$)/,
	default: /:\/\/[^/]+\/(.*?)(?=\/p$|\/|$)/,
	// Add more as needed, e.g., accountName: /your-regex/
};

function getProductTextLink(url) {
	var match;
	// Check if there's a regex for the given accountName, or use default
	let selectedRegex = regexObject[accountName] || regexObject.default;

	match = url.match(selectedRegex);
	console.log(`Used regex for ${accountName in regexObject ? accountName : "default"}`);

	return match && match[1] ? match[1] : null;
}

async function mainFetchInfo(productLink) {
	try {
		// Display "Fetching data..." message before the fetch starts
		cookieWarn.textContent = "🔄 Fetching data...";
		cookieWarn.style.backgroundColor = "#f5f5f5"; // Light grey as an example

		const prodPubData = await fetchProductByTextLink(productLink);

		const productData = await fetchProductById(productId);
		g_productStatusData = productData;
		g_productStatus.textContent = g_productStatusData.IsActive ? "✅ Produto ativo" : "❌ Produto inativo";

		const skuData = await fetchSkuByProductId(productId);
		console.log(skuData);
		g_allSkusFromProduct = skuData;
		g_skuQuantity.textContent = `✅ This product contains ${g_allSkusFromProduct.length} ${
			g_allSkusFromProduct.length === 1 ? "SKU" : "SKUs"
		}`;

		const brandStatusData = await fetchBrandStatus(brandId);
		g_brandStatusData = brandStatusData;
		g_brandStatus.textContent = g_brandStatusData.isActive ? "✅ Marca ativa" : "❌ Marca inativa";

		const categoryStatusData = await fetchCategoryStatus(categoryId);
		g_categoryStatusData = categoryStatusData;
		g_categoryStatus.textContent = g_categoryStatusData.IsActive ? "✅ Categoria ativa" : "❌ Categoria inativa";

		generateCards(skuData);

		// Display the success message after all fetches are complete
		cookieWarn.textContent = "✅ Valid authCookie and fetched data successfully";
		cookieWarn.style.backgroundColor = "#e5ffe6";
	} catch (error) {
		console.error("Error fetching data:", error);
		cookieWarn.textContent = "⚠️ Error while fetching data";
		cookieWarn.style.backgroundColor = "#fff9c4";
	}
}

// bumerange -> accountname

// ----------------------------------------------------------------- Utility functions

// Capitalize the API returns
function toTitleCase(str) {
	return str.toLowerCase().replace(/\b\w/g, function (letter) {
		return letter.toUpperCase();
	});
}

// Fetch prodInfo through textLink
async function fetchProductByTextLink(productLink) {
	const url = `https://${accountName}.vtexcommercestable.com.br/api/catalog_system/pub/products/search/${productLink}/p`;

	const response = await fetch(url, {
		method: "GET",
		headers: {
			VtexIdclientAutCookie: g_cookieValue,
		},
	});

	const data = await response.json();

	// Getting value from the fetch into global variables for later usage
	productId = toTitleCase(data[0].productId);
	brandId = toTitleCase(String(data[0].brandId));
	categoryId = toTitleCase(data[0].categoryId);

	// Placing the product information into the DOM
	productTitlePlace.textContent = toTitleCase(data[0].productName);
	productIdPlace.textContent = productId;
	brandIdPlace.textContent = brandId;
	categoryIdPlace.textContent = categoryId;

	return data; // Return the productId for the next action
}

// Get complete prodInfo through prodId
async function fetchProductById(productId) {
	const url = `https://${accountName}.vtexcommercestable.com.br/api/catalog/pvt/product/${productId}`;

	const response = await fetch(url, {
		method: "GET",
		headers: {
			VtexIdclientAutCookie: g_cookieValue,
		},
	});

	return await response.json();
}
// Get the SKUs inside a product through prodId
async function fetchSkuByProductId(productId) {
	const url = `https://${accountName}.vtexcommercestable.com.br/api/catalog_system/pvt/sku/stockkeepingunitByProductId/${productId}`;

	const response = await fetch(url, {
		method: "GET",
		headers: {
			VtexIdclientAutCookie: g_cookieValue,
		},
	});

	return await response.json();
}
// Get if brand is active/inactive
async function fetchBrandStatus(brandId) {
	const url = `https://${accountName}.vtexcommercestable.com.br/api/catalog_system/pvt/brand/${brandId}`;

	const response = await fetch(url, {
		method: "GET",
		headers: {
			VtexIdclientAutCookie: g_cookieValue,
		},
	});

	return await response.json();
}
// Get if category is active/inactive
async function fetchCategoryStatus(categoryId) {
	const url = `https://${accountName}.vtexcommercestable.com.br/api/catalog/pvt/category/${categoryId}`;

	const response = await fetch(url, {
		method: "GET",
		headers: {
			VtexIdclientAutCookie: g_cookieValue,
		},
	});

	return await response.json();
}

// Generate a card for each SKU inside the product
async function generateCards(dataArray) {
	const container = document.querySelector(".cards-container");

	document.querySelector(".sku-quantity-wrap").style.display = "block";

	// Clear the container
	container.innerHTML = "";

	dataArray
		.sort((a, b) => b.IsActive - a.IsActive)
		.forEach((item) => {
			const card = document.createElement("div");
			card.className = "card";

			// Determine card background based on isActive property
			if (item.IsActive) {
				card.classList.add("card-active");
			} else {
				card.classList.add("card-inactive");
			}

			const cardContent = document.createElement("div");
			cardContent.className = "card-content";

			const skuElem = document.createElement("div");
			skuElem.className = "sku";
			skuElem.innerHTML = `<strong>skuID:</strong> <span>${item.Id}</span>`;

			const nameElem = document.createElement("div");
			nameElem.className = "name";
			nameElem.innerHTML = `<strong>Name:</strong> <span>${item.Name}</span>`;

			const statusElem = document.createElement("div");
			statusElem.className = "status";

			const statusValueClass = item.IsActive ? "status-true" : "status-false";
			statusElem.innerHTML = `<strong>isActive:</strong> <span class="${statusValueClass}">${item.IsActive}</span>`;

			// Add button to run the fetchSimulation function
			const simulateButton = document.createElement("button");
			simulateButton.classList.add("btn");
			simulateButton.innerText = "Simulate";
			simulateButton.onclick = () => fetchSimulation(item.Id);

			cardContent.appendChild(skuElem);
			cardContent.appendChild(nameElem);
			cardContent.appendChild(statusElem);
			cardContent.appendChild(simulateButton); // Append the button to the card content

			card.appendChild(cardContent);

			container.appendChild(card);
		});
}

// Do a fulfillment simulation with given skuId
function fetchSimulation(skuId) {
	simulationWarn.style.display = "none";
	simulationInfoContainer.style.display = "block";

	const url = `http://${accountName}.vtexcommercestable.com.br/api/checkout/pvt/orderForms/simulation?sc=${
		g_salesChannel || "1"
	}`;
	const headers = new Headers({
		VtexIdclientAutCookie: g_cookieValue,
		"Content-Type": "application/json",
	});

	const body = JSON.stringify({
		items: [
			{
				id: skuId,
				quantity: "1",
				seller: "1",
			},
		],
	});

	fetch(url, {
		method: "POST",
		headers: headers,
		body: body,
	})
		.then((response) => response.json())
		.then((data) => {
			g_simulationResponse = data;
			renderObjectInContainer(g_simulationResponse);
			g_simulationAvailability = g_simulationResponse.items[0].availability;
			g_simulationSkuId = g_simulationResponse.items[0].id;
			g_stockBalance = g_simulationResponse.logisticsInfo[0].stockBalance;

			simulationResumeStatus.textContent = g_simulationAvailability === "available" ? "available" : "not available";
			simulationResumeStockBalance.textContent = g_stockBalance;

			g_simulationAvailability !== "available"
				? (simulationResumeReason.textContent = g_simulationAvailability)
				: (document.querySelector(".tb-row-reason").style.display = "none");
		})
		.catch((error) => {
			console.error("Error:", error);
		});
}

// Format and render the simulation response inthe DOM
function renderObjectInContainer(obj) {
	// Stringify the object with indentation of 2 spaces
	const prettyString = JSON.stringify(obj, null, 2);

	// Use the <pre> tag to preserve formatting and add the stringified object
	simulationResponse.innerHTML = `<pre>${prettyString}</pre>`;
}

// Firing functions
document.addEventListener("DOMContentLoaded", getAccountName);
document.addEventListener("DOMContentLoaded", storeVersion);
document.addEventListener("DOMContentLoaded", loadedScripts);
document.addEventListener("DOMContentLoaded", countScripts);
document.addEventListener("DOMContentLoaded", loadedMetaTags);
document.addEventListener("DOMContentLoaded", countMetaTags);
document.addEventListener("DOMContentLoaded", getSalesChannel);
document.addEventListener("DOMContentLoaded", getCurrentUrl);
