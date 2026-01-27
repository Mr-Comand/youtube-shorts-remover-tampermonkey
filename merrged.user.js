// ==UserScript==
// @name         Youtube short remover
// @namespace    http://tampermonkey.net/
// @version      full.1.4
// @description  Removes Youtube shorts from search results and watch page. Configuration Menu to the Settings at https://www.youtube.com/account_playback
// @author       Mr_Comand
// @license      MIT
// @match        https://www.youtube.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=youtube.com
// @updateURL    https://raw.githubusercontent.com/Mr-Comand/youtube-shorts-remover-tampermonkey/main/merrged.user.js
// @downloadURL  https://raw.githubusercontent.com/Mr-Comand/youtube-shorts-remover-tampermonkey/main/merrged.user.js
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==


(function() {
	'use strict';

	function log(...args) {
		const message = args.map(arg => String(arg)).join(' ');
		console.log('%c[ShortsRemover] '+message, 'color: ' + config.c_consoleColor);
	}

	function updateConfig(key, value) {
		if (config.hasOwnProperty(key)) {
			config[key] = value;
			GM_setValue(key, value); // Update the value in GM storage
		}
	}


	// Configuration variables with default values
	var config = {
		c_removeFormStartPage: GM_getValue('c_removeFormStartPage', true),
		c_removeFormSubscriptionFeed: GM_getValue('c_removeFormSubscriptionFeed', true),
		c_removeFormAllFeeds: GM_getValue('c_removeFormAllFeeds', true), // except SubscriptionFeed
		c_removeFormFollowUp: GM_getValue('c_removeFormFollowUp', true),
		c_removeFormChannel: GM_getValue('c_removeFormChannel', true),
		c_removeSidebar: GM_getValue('c_removeSidebar', true),
		c_disableShortPage: GM_getValue('c_disableShortPage', true),
		c_removeFormSearch : GM_getValue('c_removeFormSearch', true),
		c_disableShortPageScrolling: GM_getValue('c_disableShortPageScrolling', true),
		c_consoleColor: GM_getValue('c_consoleColor', '#33bd52')
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


	// Define the regex pattern for the YouTube start page
	var youtubeStartPagePattern = /^https?:\/\/(www\.)?youtube\.com\/?$/;

	// Define the regex pattern for the all YouTube feed pages
	//https://www.youtube.com/feed/*
	var youtubeFeedPagePattern = /^https?:\/\/(www\.)?youtube\.com\/((feed)|(gaming))(?!\/subscriptions.*).*$/;

	// Define the regex pattern for the YouTube subscriptions feed page
	//https://www.youtube.com/feed/subscriptions
	var youtubeSubscriptionsPagePattern = /^https?:\/\/(www\.)?youtube\.com\/feed\/subscriptions\/?$/;

	// Define the regex pattern for the YouTube watch pages
	//https://www.youtube.com/watch?v=*
	var youtubeWatchPagePattern = /^https?:\/\/(www\.)?youtube\.com\/watch\/?.*$/;


	// Define the regex pattern for the YouTube shorts pages
	//https://www.youtube.com/shorts/*
	var youtubeShortPagePattern = /^https?:\/\/(www\.)?youtube\.com\/shorts.*$/;

    // Define the regex pattern for the YouTube channel pages
    //https://www.youtube.com/LinusTechTips or https://www.youtube.com/@LinusTechTips ...
    var youtubeChannelPagePattern = /^https?:\/\/(www\.)?youtube\.com\/(?!feed.*)(?!watch.*)(?!short.*)(?!playlist.*)(?!podcasts.*)(?!gaming.*)(?!results.*).+$/;
    // Define the regex pattern for the YouTube channel short pages
    //https://www.youtube.com/LinusTechTips/shorts or https://www.youtube.com/@LinusTechTips/shorts ...
    var youtubeChannelShortsPagePattern = /^(https?:\/\/(?:www\.)?youtube\.com\/(?!feed.*)(?!watch.*)(?!short.*)(?!playlist.*)(?!podcasts.*)(?!gaming.*)(?!results.*).+)\/shorts\/?$/;
    // Define the regex pattern for the YouTube search page
    //https://www.youtube.com/shorts/*
    var youtubeSearchPagePattern = /^https?:\/\/(www\.)?youtube\.com\/results.*$/;

	// Define the regex pattern for the Config pages
	//https://www.youtube.com/account_playback
	var configPagePattern = /^https:\/\/www\.youtube\.com\/account_playback$/;


	if (config.c_disableShortPageScrolling){
		// Function to handle the custom scroll event
		function handleScroll(event) {
            // If the event started inside the comments or an engagement panel, allow it.
            if (event.target && event.target.closest && (event.target.closest('#comments') || event.target.closest('ytd-engagement-panel-section-list-renderer'))) {
                return;
            }
			
			if (youtubeShortPagePattern.test(window.location.href)) {

				// Your custom scroll handling code goes here
				log("Scrolling is disabled.");
				sendToHome();
				// Prevent the default scroll behavior to disable other scroll listeners
				event.preventDefault();
				// Add a scroll listener to the window
			}
		}
		window.addEventListener('scroll', handleScroll);
		window.addEventListener('wheel', handleScroll);
	}

	function removeShorts(){

		// Get the current URL
		var currentURL = window.location.href;
		
		// Check if the current URL matches the YouTube short page URL pattern
		if (youtubeShortPagePattern.test(currentURL) && config.c_disableShortPage) {
			// URL & config matches
			sendToHome();
			log("Shorts page detected.");
			return;
		}
		if (configPagePattern.test(currentURL)) {
			// URL & config matches
			if (document.querySelector("div#contents.style-scope.ytd-section-list-renderer>#yt-short-remover-config-menu")){
				log("Config already exists.");
				return;
			}
			createConfigMenu();
			log("Config added.");
			return;
		}
		if (config.c_removeSidebar){
			removeSidebarElement();
		}
		// Check if the current URL matches the YouTube start page URL pattern
		if (youtubeStartPagePattern.test(currentURL) && config.c_removeFormStartPage) {
			// URL & config matches
			removeFormVideoOverview();
			log("Shorts removed from Startpage.");
			return;
		}
		// Check if the current URL matches the YouTube feed page URL pattern
		if (youtubeFeedPagePattern.test(currentURL) && config.c_removeFormAllFeeds) {
			// URL & config matches
			removeReelShelfRenderer();
			removeFormVideoOverview();
			log("Shorts removed from Feed.");
			return;
		}
		
		// Check if the current URL matches the YouTube subscriptions feed page URL pattern
		if (youtubeSubscriptionsPagePattern.test(currentURL) && config.c_removeFormSubscriptionFeed) {
			// URL & config matches
			removeFormVideoOverview();
			log("Shorts removed from subscriptions.");
			return;
		}
		
		// Check if the current URL matches the YouTube watch page URL pattern
		if (youtubeWatchPagePattern.test(currentURL) && config.c_removeFormFollowUp) {
			// URL & config matches
			removeReelShelfRenderer();
			return;
		}

        if (youtubeChannelPagePattern.test(currentURL) && config.c_removeFormChannel) {
            const match = youtubeChannelShortsPagePattern.exec(currentURL);
            if (match) {
                window.location.href = match[1];
            }
            // URL & config matches
            removeReelShelfRenderer();
            removeFormVideoOverview();
            // Select all elements with tab-title Shorts
            var elementsToRemove = document.querySelectorAll('[tab-title="Shorts"]');

            // Loop through each selected element and remove it
            elementsToRemove.forEach(function (element) {
                element.style.display = "none";
            });

            log("Shorts removed from channel.");
            return;
        }
        if (youtubeSearchPagePattern.test(currentURL) && config.c_removeFormSearch) {
            // URL & config matches
            removeReelShelfRenderer();
            removeFormVideoOverview();
            removeByUrl();
            return;
        }

	}


	// Remove shorts on videoOverview
	function removeFormVideoOverview() {
		// Select all elements with a specific attribute
		var elementsToRemove = document.querySelectorAll('[is-shorts],[is-reel-item-style-avatar-circle],ytd-reel-item-renderer');

		// Loop through each selected element and remove it
		elementsToRemove.forEach(function (element) {
			element.parentNode.removeChild(element);
		});

	}

	//Remove Sidebar Element Shorts
	function removeSidebarElement() {
		// Select all elements with a title Shorts and specific class names
		var elementsToRemove = document.querySelectorAll('.yt-simple-endpoint[title="Shorts"]');

		// Loop through each selected element and remove the parent
		elementsToRemove.forEach(function (element) {
			element.parentNode.parentNode.removeChild(element.parentNode);
		});
	}


	//Remove shorts from video recommendations of a video
	function removeReelShelfRenderer() {
		// Select all "ytd-reel-shelf-renderer" elements
		var elementsToRemove = document.querySelectorAll('ytd-reel-shelf-renderer,grid-shelf-view-model');

		// Loop through each selected element and remove it
		elementsToRemove.forEach(function (element) {
			element.parentNode.removeChild(element);
		});
	}
	function removeByUrl() {
		// Select all "ytd-video-renderer" elements containing a a element wit a herf containing /shorts/
		var elementsToRemove = document.querySelectorAll('ytd-video-renderer:has([href*="/shorts/"])');
		// Loop through each selected element and remove it
		elementsToRemove.forEach(function (element) {
			element.parentNode.removeChild(element);
		});
	}
	function sendToHome(){
		window.location.href = "https://www.youtube.com/";
	}


	let progress = null;
	let timeoutId;
	function handleMutations(mutationsList, observer) {
		if (progress==null){
			progress = document.querySelector('yt-page-navigation-progress>#progress'); 
			if (progress != null){
				observer.observe(progress, observer_config);
				log("Added observer");
			}
		}
		for(let mutation of mutationsList) {
			if (mutation.target.id=="progress"){
				clearTimeout(timeoutId);
				timeoutId = setTimeout(() => {
					// Run your script here after all changes are done
					removeShorts();
					log("All Shorts are removed, detected by progress bar.");
				}, 500);
				break;
			}
			if (mutation.target.tagName=="YTD-VIDEO-RENDERER"){
				clearTimeout(timeoutId);
				timeoutId = setTimeout(() => {
				     // Run your script here after all changes are done
					removeShorts();
					log("All Shorts are removed, detected by video renderer.");
				}, 500);
				break;
			}
			if(mutation.target.parentElement ==null ){}else
			if (mutation.target.parentElement.id === "page-manager" || (mutation.target.parentElement.id=="primary")) {
				// console.log('Changes detected', mutationsList);
				//console.log('Changes detected in ytd-page-manager');
				// Your code to execute when ytd-page-manager changes goes here
				clearTimeout(timeoutId);
				timeoutId = setTimeout(() => {
					// Run your script here after all changes are done
					removeShorts();
					log("All Shorts are removed, detected by page-manager.");
				}, 500); // Adjust the timeout duration as needed
				//end loop if one change is a direct child of #page-manager
				break;
			}
		}
	}
	

	// Create a MutationObserver instance
	const observer = new MutationObserver(handleMutations);

	// Select the target node
	const targetNode = document.querySelector('#page-manager'); 
	// yt-page-navigation-progress#progress
	// Options for the observer (which mutations to observe)
	const observer_config = { childList: true, attributes: true, subtree: true,};
	// Start observing the target node for configured mutations
	observer.observe(targetNode, observer_config);
	
	removeShorts();
	if (config.c_removeSidebar){
		removeSidebarElement();
	}

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
					log(item.key, "changed to", this.checked)
				}else{
					updateConfig(item.key, this.value);
					log(item.key, "changed to", this.value)
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

})();
