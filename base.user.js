// ==UserScript==
// @name         Youtube short remover
// @namespace    http://tampermonkey.net/
// @version      base.1.2
// @description  Removes Youtube shorts from search results and watch page, but without a configuration menu.
// @author       Mr_Comand
// @license      MIT
// @match        https://www.youtube.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=youtube.com
// @updateURL    https://raw.githubusercontent.com/Mr-Comand/youtube-shorts-remover-tampermonkey/main/base.user.js
// @downloadURL  https://raw.githubusercontent.com/Mr-Comand/youtube-shorts-remover-tampermonkey/main/base.user.js
// @grant        none
// ==/UserScript==


(function () {
    'use strict';
    // Configuration variables with default values
    var config = {
        c_removeFormStartPage: true,
        c_removeFormSubscriptionFeed: true,
        c_removeFormAllFeeds: true, // except SubscriptionFeed
        c_removeFormFollowUp: true,
        c_removeFormChannel: true,
        c_removeSidebar: true,
        c_disableShortPage: true,
        c_disableShortPageScrolling: true,
        c_removeFormSearch: true,
        c_consoleColor: '#33bd52',
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

    function log(...args) {
        const message = args.map(arg => String(arg)).join(' ');
        console.log('%c[ShortsRemover] ' + message, 'color: ' + config.c_consoleColor);
    }


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

    // Define the regex pattern for the YouTube search page
    //https://www.youtube.com/shorts/*
    var youtubeSearchPagePattern = /^https?:\/\/(www\.)?youtube\.com\/results.*$/;

    // Define the regex pattern for the YouTube channel pages
    //https://www.youtube.com/LinusTechTips or https://www.youtube.com/@LinusTechTips ...
    var youtubeChannelPagePattern = /^https?:\/\/(www\.)?youtube\.com\/(?!feed.*)(?!watch.*)(?!short.*)(?!playlist.*)(?!podcasts.*)(?!gaming.*)(?!results.*).+$/;
    // Define the regex pattern for the YouTube channel short pages
    //https://www.youtube.com/LinusTechTips/shorts or https://www.youtube.com/@LinusTechTips/shorts ...
    var youtubeChannelShortsPagePattern = /^(https?:\/\/(?:www\.)?youtube\.com\/(?!feed.*)(?!watch.*)(?!short.*)(?!playlist.*)(?!podcasts.*)(?!gaming.*)(?!results.*).+)\/shorts\/?$/;

    if (config.c_disableShortPageScrolling) {
        // Function to handle the custom scroll event
        function handleScroll(event) {
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

    function removeShorts() {

        // Get the current URL
        var currentURL = window.location.href;
        if (config.c_removeSidebar) {
            removeSidebarElement();
        }
        // Check if the current URL matches the YouTube short page URL pattern
        if (youtubeShortPagePattern.test(currentURL) && config.c_disableShortPage) {
            // URL & config matches
            sendToHome();
            log("Shorts page detected.");
        }

        // Check if the current URL matches the YouTube start page URL pattern
        if (youtubeStartPagePattern.test(currentURL) && config.c_removeFormStartPage) {
            // URL & config matches
            removeFormVideoOverview();
            log("Shorts removed from Startpage.");
        }
        // Check if the current URL matches the YouTube feed page URL pattern
        if (youtubeFeedPagePattern.test(currentURL) && config.c_removeFormAllFeeds) {
            // URL & config matches
            removeReelShelfRenderer();
            removeFormVideoOverview();
            log("Shorts removed from Feed.");
        }

        // Check if the current URL matches the YouTube subscriptions feed page URL pattern
        if (youtubeSubscriptionsPagePattern.test(currentURL) && config.c_removeFormSubscriptionFeed) {
            // URL & config matches
            removeFormVideoOverview();
            log("Shorts removed from subscriptions.");
        }

        // Check if the current URL matches the YouTube watch page URL pattern
        if (youtubeWatchPagePattern.test(currentURL) && config.c_removeFormFollowUp) {
            // URL & config matches
            removeReelShelfRenderer();
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
        var elementsToRemove = document.querySelectorAll('.yt-simple-endpoint.style-scope.ytd-guide-entry-renderer[title="Shorts"]');

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
        // Select all "ytd-reel-shelf-renderer" elements
        var elementsToRemove = document.querySelectorAll('ytd-video-renderer:has([href*="/shorts/"])');

        // Loop through each selected element and remove it
        elementsToRemove.forEach(function (element) {
            element.parentNode.removeChild(element);
        });
    }
    function sendToHome() {
        window.location.href = "https://www.youtube.com/";
    }


    let progress = null;
    let timeoutId;
    function handleMutations(mutationsList, observer) {
        if (progress == null) {
            progress = document.querySelector('yt-page-navigation-progress>#progress');
            if (progress != null) {
                observer.observe(progress, config_observer);
                log("Added observer");
            }
        }
        for (let mutation of mutationsList) {
            if (mutation.target.id == "progress") {
                clearTimeout(timeoutId);
                timeoutId = setTimeout(() => {
                    // Run your script here after all changes are done
                    removeShorts();
                    log("All Shorts are removed, detected by progress bar.");
                }, 500);
                break;
            }
            if (mutation.target.tagName == "YTD-VIDEO-RENDERER") {
                clearTimeout(timeoutId);
                timeoutId = setTimeout(() => {
                    // Run your script here after all changes are done
                    removeShorts();
                    log("All Shorts are removed, detected by video renderer.");
                }, 500);
                break;
            }
            //console.log('Changes detected',mutation.type, mutation.target,mutation);
            if (mutation.target.parentElement == null) { } else
                if (mutation.target.parentElement.id === "page-manager" || (mutation.target.parentElement.id == "primary")) {
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
    const config_observer = { childList: true, attributes: true, subtree: true, };
    // Start observing the target node for configured mutations
    observer.observe(targetNode, config_observer);

    removeShorts();
    if (config.c_removeSidebar) {
        removeSidebarElement();
    }
})();