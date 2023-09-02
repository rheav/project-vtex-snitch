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
					accountSub.innerHTML = "⚠️ If this is a FastStore or headless store, check for the accountName directly into source code (CTRL+U).";
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
	} else if (/type="text\/partytown"/.test(sourceCode) || /content="Gatsby/.test(sourceCode)) {
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
				wrapperSalesChannel.innerHTML = '❌ Error reading <span style="color:#f71963; font-style:italic;">channel</span> in Segments API';
				salesChannelSub.innerHTML = "⚠️ If this is a FastStore or headless store, it's expected. Check the SalesChannel through orderForm or network requests.";
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
	var pinterestRegex = /\/\/assets\.pinterest\.com\/js\/pinit\.js/g;

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
					var gaUARegex = /src="[^"]*(googletagmanager\.com\/gtag\/js\?id=UA|www\.google-analytics\.com\/analytics\.js)/g;
					var ga4Regex = /src="[^"]*googletagmanager\.com\/gtag\/js\?id=G-[^"]*"/g;
					var tiktokRegex = /analytics\.tiktok\.com\/i18n\/pixel\/events\.js\?sdkid=|<!--pixel:start:vtexbr\.tiktok-tbp-->/g;
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

const fetchResult = document.getElementById("fetch-result");
const errorsCheck = document.getElementById("check-errors");

const useInPdp = document.getElementById("warn-use-pdp");
const warnCookieSubmit = document.getElementById("warn-cookie-submit");

let g_cookieValue = "";
var currentTab = "";
var currentTabUrl = "";

// Transforming fetched info into global scoped info
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
let g_sellerList;
let g_salesChannel;
let g_scList = "";
let g_scIds = "";
let g_userSelectedSc = "";
let defaultVal = "";

// SELLER LIST STUFF - TESTING
const sellerInput = document.getElementById("sellerInput");
let g_sellerListIds;

document.getElementById("submitBtn").addEventListener("click", function () {
	g_cookieValue = document.getElementById("cookieInput").value;
	fetchResult.style.display = "block";

	if (g_cookieValue) {
		getCurrentUrl(); // Call this function to get the current URL when the cookie is valid

		// Show the hidden tabs
		let hiddenTabs = document.querySelectorAll(".hidden-tab");
		for (let tab of hiddenTabs) {
			tab.style.display = "inline-block";
		}
	} else {
		fetchResult.textContent = "⚠️ Please, enter a valid authCookie";
		fetchResult.style.backgroundColor = "#fff9c4";
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
			fetchResult.textContent = "⚠️ Error in fetching product link from URL";
			fetchResult.style.backgroundColor = "#fff9c4";
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
		fetchResult.textContent = "🔄 Fetching data...";
		fetchResult.style.backgroundColor = "#f5f5f5"; // Light grey as an example

		const prodPubData = await fetchProductByTextLink(productLink);

		const productData = await fetchProductById(productId);
		g_productStatusData = productData;
		g_productStatus.textContent = g_productStatusData.IsActive ? "✅ Produto ativo" : "❌ Produto inativo";

		const skuData = await fetchSkuByProductId(productId);
		console.log(skuData);
		g_allSkusFromProduct = skuData;
		g_skuQuantity.textContent = `✅ This product contains ${g_allSkusFromProduct.length} ${g_allSkusFromProduct.length === 1 ? "SKU" : "SKUs"}`;

		const brandStatusData = await fetchBrandStatus(brandId);
		g_brandStatusData = brandStatusData;
		g_brandStatus.textContent = g_brandStatusData.isActive ? "✅ Marca ativa" : "❌ Marca inativa";

		const categoryStatusData = await fetchCategoryStatus(categoryId);
		g_categoryStatusData = categoryStatusData;
		g_categoryStatus.textContent = g_categoryStatusData.IsActive ? "✅ Categoria ativa" : "❌ Categoria inativa";

		const sellerListData = await fetchSellerList();
		g_sellerList = sellerListData;
		g_sellerListIds = g_sellerList.items.map((item) => item.id);

		const salesChannelsList = await fetchSalesChannels();
		g_scList = salesChannelsList;
		g_scIds = g_scList.map((channel) => channel.Id);

		generateCards(skuData);

		// Display the success message after all fetches are complete
		fetchResult.textContent = "✅ Valid authCookie and fetched data successfully";
		fetchResult.style.backgroundColor = "#ddffe0";
		useInPdp.style.opacity = "0.6";
		warnCookieSubmit.style.opacity = "0.6";
	} catch (error) {
		console.error("Error fetching data:", error);
		fetchResult.textContent = "⚠️ Error while fetching data";
		fetchResult.style.backgroundColor = "";

		if (fetchResult.textContent === "⚠️ Error while fetching data") {
			errorsCheck.style.display = "block";
		}
	}
}

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
	const skuQuantityWrap = document.querySelector(".sku-quantity-wrap");

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

			// Separate simulation info
			const separatorHr = document.createElement("hr");

			// Simulation part title
			const simulationTitle = document.createElement("h3");
			simulationTitle.textContent = "Build your check-out simulation";
			simulationTitle.classList.add("simulate-title");

			// Create the label element
			const labelSeller = document.createElement("label");
			labelSeller.textContent = "selectSeller";

			// Seller List input
			const sellerInput = document.createElement("input");
			sellerInput.type = "text";
			sellerInput.placeholder = "Seller ID...";
			sellerInput.classList.add("simulate-input");

			// Create a container for the autocomplete dropdown
			const autocompleteDropdown = document.createElement("div");
			autocompleteDropdown.classList.add("autocomplete-dropdown");

			// Create the label element
			const labelSc = document.createElement("label");
			labelSc.textContent = "selectSalesChannel";

			// Sales Channel Select
			const scSelect = document.createElement("select");
			scSelect.type = "text";
			scSelect.placeholder = "Sales Channel";
			scSelect.classList.add("simulate-input");

			// Create an "empty" default option
			const defaultOption = document.createElement("option");
			defaultOption.value = "";

			defaultVal = typeof g_salesChannel !== "undefined" ? g_salesChannel : g_scIds.length > 0 ? g_scIds[0] : "";

			// Create options based on the g_scIds array
			g_scIds.map((id) => {
				const option = document.createElement("option");
				option.value = id; // Set the option's value to the ID
				option.textContent = id; // Display the ID as the option's text
				scSelect.appendChild(option);
			});

			// Set the default value of the select element
			g_userSelectedSc = scSelect.value = defaultVal;

			// Add button to run the fetchSimulation function
			const simulateButton = document.createElement("button");
			simulateButton.classList.add("btn");
			simulateButton.innerText = "Simulate";
			simulateButton.onclick = () => {
				const selectedSellerId = sellerInput.value; // Get the selected seller ID
				fetchSimulation(item.Id, selectedSellerId, g_userSelectedSc); // Pass both SKU ID and selected seller ID
			};
			cardContent.appendChild(skuElem);
			cardContent.appendChild(nameElem);
			cardContent.appendChild(statusElem);
			cardContent.appendChild(separatorHr);
			cardContent.appendChild(simulationTitle);
			cardContent.appendChild(labelSeller);
			cardContent.appendChild(sellerInput);
			cardContent.appendChild(autocompleteDropdown);
			cardContent.appendChild(labelSc);
			cardContent.appendChild(scSelect);
			scSelect.appendChild(defaultOption);
			cardContent.appendChild(simulateButton);
			card.appendChild(cardContent);
			container.appendChild(card);

			// Set up autocomplete for the sellerInput element
			autoCompleteSellers(sellerInput, autocompleteDropdown);

			// Add an event listener to capture the selected value and update g_userSelectedSc
			scSelect.addEventListener("change", function () {
				g_userSelectedSc = scSelect.value;
				fetchSellerList();
			});
		});

	// Display the sku-quantity-wrap if there are items
	skuQuantityWrap.style.display = dataArray.length ? "block" : "none";

	// Get all elements with the class 'card'
	const cards = document.querySelectorAll(".card");

	// Add event listeners for hover on each card
	cards.forEach((card) => {
		card.addEventListener("mouseover", () => {
			// Add the 'grayed-out' class to all cards except the one being hovered
			cards.forEach((otherCard) => {
				if (otherCard !== card) {
					otherCard.classList.add("grayed-out");
				}
			});
		});

		card.addEventListener("mouseout", () => {
			// Remove the 'grayed-out' class from all cards when mouse leaves
			cards.forEach((otherCard) => {
				otherCard.classList.remove("grayed-out");
			});
		});
	});
}

// Do a fulfillment simulation with given skuId
function fetchSimulation(skuId, selectedSellerId, g_userSelectedSc) {
	simulationWarn.style.display = "none";
	simulationInfoContainer.style.display = "block";

	const url = `http://${accountName}.vtexcommercestable.com.br/api/checkout/pvt/orderForms/simulation?sc=${g_userSelectedSc ? g_userSelectedSc : g_salesChannel}`;

	console.log(url);
	const headers = new Headers({
		VtexIdclientAutCookie: g_cookieValue,
		"Content-Type": "application/json",
	});

	const body = JSON.stringify({
		items: [
			{
				id: skuId,
				quantity: "1",
				seller: selectedSellerId,
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
			// clean previous info
			simulationResumeReason.textContent = "";
			simulationResumeStatus.textContent = "";
			simulationResumeStockBalance.textContent = "";

			g_simulationResponse = data;
			renderObjectInContainer(g_simulationResponse);

			// Check if g_simulationResponse.messages[0].text contains 'não encontrado ou indisponível'
			if (g_simulationResponse.messages[0]?.text.includes("não encontrado ou indisponível")) {
				simulationResumeReason.textContent = g_simulationResponse.messages[0].text;
				document.querySelector(".tb-row-reason").style.display = "table-row";
				simulationResumeStatus.textContent = "Unavailable";
				document.querySelector(".tb-row-stockBalance").style.display = "none";
				document.getElementById("unavailable-sc").textContent = g_userSelectedSc;
				document.getElementById("warn-unavailable-tip").style.display = "block";
			} else {
				document.getElementById("warn-unavailable-tip").style.display = "none";
				document.querySelector(".tb-row-reason").style.display = "none";
				document.querySelector(".tb-row-stockBalance").style.display = "table-row";
				g_simulationAvailability = g_simulationResponse.items[0].availability;
				g_simulationSkuId = g_simulationResponse.items[0].id;
				g_stockBalance = g_simulationResponse.logisticsInfo[0].stockBalance;

				simulationResumeStatus.textContent = g_simulationAvailability === "available" ? "available" : "not available";
				simulationResumeStockBalance.textContent = g_stockBalance;

				if (g_simulationAvailability !== "available") {
					simulationResumeReason.textContent = g_simulationAvailability;
					document.querySelector(".tb-row-reason").style.display = "table-row";
				} else {
					document.querySelector(".tb-row-reason").style.display = "none";
				}
			}
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

// Get seller list
async function fetchSellerList() {
	const url = `https://${accountName}.vtexcommercestable.com.br/api/seller-register/pvt/sellers?from=0&to=100&isActive=true&isBetterScope=false&sc=${
		g_userSelectedSc ? g_userSelectedSc : g_salesChannel
	}&sellerType=1&sort=id%3Aasc`;
	console.log(url);

	const response = await fetch(url, {
		method: "GET",
		headers: {
			VtexIdclientAutCookie: g_cookieValue,
		},
	});

	return await response.json();
}
// Get salesChannels list

async function fetchSalesChannels() {
	const url = `https://${accountName}.vtexcommercestable.com.br/api/catalog_system/pvt/saleschannel/list`;

	const response = await fetch(url, {
		method: "GET",
		headers: {
			VtexIdclientAutCookie: g_cookieValue,
		},
	});

	return await response.json();
}

// Autocomplete setup function
function autoCompleteSellers(inputElement, dropdownElement) {
	const autocompleteDropdown = dropdownElement;

	inputElement.addEventListener("input", function () {
		const userInput = inputElement.value.toLowerCase();
		const suggestions = g_sellerListIds.filter((sellerId) => sellerId.includes(userInput));
		autocompleteDropdown.style.display = suggestions.length > 0 ? "block" : "none";

		autocompleteDropdown.innerHTML = ""; // Clear previous suggestions

		suggestions.forEach((suggestion) => {
			const option = document.createElement("div");
			option.textContent = suggestion;
			option.classList.add("autocomplete-option");
			option.addEventListener("click", function () {
				inputElement.value = suggestion;
				autocompleteDropdown.innerHTML = ""; // Clear dropdown after selection
			});
			autocompleteDropdown.appendChild(option);
		});
	});

	// Hide dropdown when clicking outside of it
	document.addEventListener("click", function (event) {
		if (!autocompleteDropdown.contains(event.target)) {
			autocompleteDropdown.style.display = "none"; // Hide the dropdown
		}
	});
}

// Firing functions
document.addEventListener("DOMContentLoaded", getAccountName);
document.addEventListener("DOMContentLoaded", storeVersion);
document.addEventListener("DOMContentLoaded", loadedScripts);
document.addEventListener("DOMContentLoaded", countScripts);
document.addEventListener("DOMContentLoaded", loadedMetaTags);
document.addEventListener("DOMContentLoaded", countMetaTags);
document.addEventListener("DOMContentLoaded", getSalesChannel);
