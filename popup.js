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
					var match = sourceCode.match(/https:\/\/(.*?)\.(vteximg\.com\.br|vtexassets\.com)\//);
					return match ? match[1] : null;
				},
			},
			function (results) {
				var accountName = results[0].result;

				if (accountName && accountName.length < 15) {
					accountText.innerText = accountName;
				} else {
					wrapperAccount.innerText = "❌ Account name not found";
					accountSub.innerHTML =
						"⚠️ If this is a FastStore or headless store, check for the accountName directly into source code (CTRL+U).";
					accountSub.style.display = "inline-flex";
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

function getSalesChannel() {
	chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
		var url = new URL(tabs[0].url);
		var baseUrl = url.protocol + "//" + url.host;

		fetch(baseUrl + "/api/segments")
			.then((response) => response.json())
			.then((data) => {
				currentSalesChannel.innerText = data.channel;
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

document.addEventListener("DOMContentLoaded", getAccountName);
document.addEventListener("DOMContentLoaded", storeVersion);
document.addEventListener("DOMContentLoaded", loadedScripts);
document.addEventListener("DOMContentLoaded", countScripts);
document.addEventListener("DOMContentLoaded", loadedMetaTags);
document.addEventListener("DOMContentLoaded", countMetaTags);
document.addEventListener("DOMContentLoaded", getSalesChannel);
