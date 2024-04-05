// ==UserScript==
// @name         Youtube short remover Config menu
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  You can't extend the base file you have to use the merged version. Adds a Configuration Menu to the Settings at https://www.youtube.com/account_playback  
// @author       Mr_Comand
// @match        https://www.youtube.com/account_playback
// @icon         https://www.google.com/s2/favicons?sz=64&domain=youtube.com
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

(function() {
    'use strict';
    function updateConfig(key, value) {
		config[key] = value;
		GM_setValue(key, value); // Update the value in GM storage
		log(key, "changed to", value)
	}
    function log(...args) {
		const message = args.map(arg => String(arg)).join(' ');
		console.log('%c[ShortsRemover] '+message, 'color: ' + config.c_consoleColor);
	}
    var config = {
		c_removeFormStartPage: GM_getValue('config.c_removeFormStartPage', true),
		c_removeFormSubscriptionFeed: GM_getValue('config.c_removeFormSubscriptionFeed', true),
		c_removeFormAllFeeds: GM_getValue('config.c_removeFormAllFeeds', true), // except SubscriptionFeed
		c_removeFormFollowUp: GM_getValue('config.c_removeFormFollowUp', true),
		c_removeFormChannel: GM_getValue('config.c_removeFormChannel', true),
		c_removeSidebar: GM_getValue('config.c_removeSidebar', true),
        c_removeFormSearch : GM_getValue('c_removeFormSearch', true),
		c_disableShortPage: GM_getValue('config.c_disableShortPage', true),
		c_disableShortPageScrolling: GM_getValue('config.c_disableShortPageScrolling', true),
		c_consoleColor: GM_getValue('config.c_consoleColor', '#33bd52')
	};
	log("Configuration:");
	log("c_removeFormStartPage", config.c_removeFormStartPage);
	log("c_removeFormSubscriptionFeed", config.c_removeFormSubscriptionFeed);
	log("c_removeFormAllFeeds", config.c_removeFormAllFeeds);
	log("c_removeFormFollowUp", config.c_removeFormFollowUp);
	log("c_removeFormChannel", config.c_removeFormChannel);
	log("c_removeSidebar", config.c_removeSidebar);
    log("c_removeFormSearch", config.c_removeFormSearch);
	log("c_disableShortPage", config.c_disableShortPage);
	log("c_disableShortPageScrolling", config.c_disableShortPageScrolling);
	log("c_consoleColor", config.c_consoleColor);
	log("============================");

    function waitForElement(selector, callback) {
        const element = document.querySelector(selector);
        if (element) {
            callback(element);
        } else {
            setTimeout(() => waitForElement(selector, callback), 100); // Adjust the interval as needed
        }
    }   

    // Function to create configuration menu
    function createConfigMenu() {
		// Create menu container
		var menuContainer = document.createElement('div');
		menuContainer.id = 'yt-short-remover-config-menu';
		menuContainer.style.color = 'var(--yt-spec-text-secondary)';
		menuContainer.style.font_size = '1.4rem';
		menuContainer.style.lineHeight = '2rem';
		menuContainer.style.fontWeight = '400';
		menuContainer.style.padding = '10px';
		menuContainer.style.width = '50%';

		var hr = document.createElement('hr');
		var headline = document.createElement('h1');
		headline.style.lineHeight="6rem";
		headline.style.color="var(--yt-spec-text-primary)";
		headline.innerText="Shorts(Tampermonkey script)";
		menuContainer.appendChild(hr);
		menuContainer.appendChild(headline);

		// Create menu items
		var menuItems = [
			{ label: 'Remove Shorts from Start Page', key: 'c_removeFormStartPage', type:"checkbox"},
			{ label: 'Remove Shorts from Subscription Feed', key: 'c_removeFormSubscriptionFeed', type:"checkbox" },
			{ label: 'Remove Shorts from All Feeds (except Subscription Feed)', key: 'c_removeFormAllFeeds', type:"checkbox" },
			{ label: 'Remove Shorts from Follow Up Page', key: 'c_removeFormFollowUp', type:"checkbox" },
			{ label: 'Remove Shorts from Channel Page', key: 'c_removeFormChannel', type:"checkbox" },
            { label: 'Remove Shorts from Search Page', key: 'c_removeFormSearch', type:"checkbox" },
			{ label: 'Remove Sidebar Shorts', key: 'c_removeSidebar', type:"checkbox" },
			{ label: 'Disable Short Page', key: 'c_disableShortPage', type:"checkbox" },
			{ label: 'Disable Short Page Scrolling', key: 'c_disableShortPageScrolling', type:"checkbox" },
			{ label: 'Console log Color:', key: 'c_consoleColor', type:"color", default:"#33bd52" }
		];

		// Add menu items to menu container
		menuItems.forEach(item => {
			var input = document.createElement('input');
			input.type = item.type
			if (input.type == "checkbox"){
				input.checked = GM_getValue(item.key, item.default ? item.default : true);
			}else{
				input.value = GM_getValue(item.key, item.default ? item.default : "undefine");
			}
			input.addEventListener('change', function() {
				if (this.type == "checkbox"){
					updateConfig(item.key, this.checked);
				}else{
					updateConfig(item.key, this.value);
				}
			});

			var label = document.createElement('label');
			label.textContent = item.label;

			var menuItem = document.createElement('div');
			menuItem.style.display="flex";
			menuItem.style.justifyContent="space-between";
			menuItem.style.alignItems="center"

			menuItem.appendChild(label);
			menuItem.appendChild(input);
			menuContainer.appendChild(menuItem);
		});
		config.c_consoleColor
		// Append menu container to config element
		document.querySelector("div#contents.style-scope.ytd-section-list-renderer").appendChild(menuContainer);
	}

    // Create configuration menu

    waitForElement("div#contents.style-scope.ytd-section-list-renderer", createConfigMenu);

})();
