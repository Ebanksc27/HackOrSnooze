"use strict";

// So we don't have to keep re-finding things on page, find DOM elements once:
const $body = $("body");

const $storiesLoadingMsg = $("#stories-loading-msg");
const $allStoriesList = $("#all-stories-list");

const $loginForm = $("#login-form");
const $signupForm = $("#signup-form");
const $storyForm = $("#story-form");

const $navLogin = $("#nav-login");
const $navUserProfile = $("#nav-user-profile");
const $navLogOut = $("#nav-logout");

/** To make it easier for individual components to show just themselves, this
 * is a useful function that hides pretty much everything on the page. After
 * calling this, individual components can re-show just what they want.
 */
function hidePageComponents() {
  const components = [
    $allStoriesList,
    $loginForm,
    $signupForm,
    $storyForm,
  ];
  components.forEach((c) => c.hide());
}

/** Overall function to kick off the app. */
async function start() {
  console.debug("start");

  // "Remember logged-in user" and log in, if credentials in localStorage
  await checkForRememberedUser();
  await getAndShowStoriesOnStart();

  // if we have a logged-in user
  if (currentUser) updateUIOnUserLogin();
}

// Handle story submission form
async function submitStory(evt) {
  console.debug("submitStory", evt);
  evt.preventDefault();

  const title = $("#story-title").val();
  const author = $("#story-author").val();
  const url = $("#story-url").val();

  const newStory = {
    title,
    author,
    url,
  };

  try {
    await storyList.addStory(currentUser, newStory);
    console.log("Story submitted successfully!");

    // Reset form fields
    $("#story-title").val("");
    $("#story-author").val("");
    $("#story-url").val("");

    // Get and show updated stories
    await getAndShowStoriesOnStart();

    // Add the new story to the page
    addStoryToPage(newStory);
  } catch (error) {
    console.log("Error submitting story:", error);
  }
}

// Bind the event listener to the form submission event
$storyForm.on("submit", submitStory);

// Once the DOM is entirely loaded, begin the app
console.warn(
  "HEY STUDENT: This program sends many debug messages to" +
    " the console. If you don't see the message 'start' below this, you're not" +
    " seeing those helpful debug messages. In your browser console, click on" +
    " menu 'Default Levels' and add Verbose"
);
$(start);



