"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

// Flag to indicate if form submission is in progress
let isSubmitting = false;

/** Get and show stories when the site first loads. */
async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();

  // Set the isFavorite property to false for all stories
  storyList.stories.forEach((story) => {
    story.isFavorite = false;
  });

  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */
function generateStoryMarkup(story) {
  const hostName = story.getHostName();
  const starClass = story.isFavorite ? "fas fa-star" : "far fa-star";
  const starColor = story.isFavorite ? "#ffff00" : "#000000";
  return $(`
    <li id="${story.storyId}">
      <i class="${starClass} fa-sm" style="color: ${starColor};"></i>
      <a href="${story.url}" target="_blank" class="story-link">
        ${story.title}
      </a>
      <small class="story-hostname">(${hostName})</small>
      <small class="story-author">by ${story.author}</small>
      <small class="story-user">posted by ${story.username}</small>
    </li>
  `);
}

function addStoryToPage(story) {
  const $story = generateStoryMarkup(story);
  $allStoriesList.prepend($story);
  storyList.stories.unshift(story); // Add the new story to the storyList instance
}


const $navMyStories = $("#nav-my-stories");

$navMyStories.on("click", function (evt) {
  hidePageComponents();
  putUserStoriesOnPage();
});


const $navFavorites = $("#nav-favorites");

$allStoriesList.on("click", ".fa-star", async function (evt) {
  const $star = $(evt.target);
  const $story = $star.closest("li");
  const storyId = $story.attr("id");

  // Find the story in the storyList using the storyId
  const story = storyList.stories.find((s) => s.storyId === storyId);

  if (!story) {
    throw new Error("Story not found");
  }

  await storyList.toggleFavoriteStory(currentUser, storyId);

  // Toggle the star appearance based on the favorite status
  $star.toggleClass("fas far");

  // Toggle the star color based on the favorite status
  $star.css("color", story.isFavorite ? "#ffff00" : "#000000");
});

$navFavorites.on("click", function (evt) {
  hidePageComponents();
  putFavoriteStoriesOnPage();
});

function putFavoriteStoriesOnPage() {
  console.debug("putFavoriteStoriesOnPage");

  $allStoriesList.empty();

  const favoriteStories = storyList.getFavoriteStories();

  // Loop through all favorite stories and generate HTML for them
  for (let story of favoriteStories) {
    const favoriteClass = story.isFavorite ? "favorited" : "";
    const $story = generateStoryMarkup(story).addClass(favoriteClass);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}

$allStoriesList.on("click", ".remove-button", async function (evt) {
  const $tgt = $(evt.target);
  const $story = $tgt.closest("li");
  const storyId = $story.attr("id");

  await storyList.removeFavoriteStory(currentUser, storyId);

  $story.remove();

  // Remove the story from the currentUser's favorites array
  currentUser.favorites = currentUser.favorites.filter(
    (story) => story.storyId !== storyId
  );
});

/** Gets the list of stories from the server, generates their HTML, and puts them on the page. */
function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  if (currentUser) {
    $storyForm.removeClass("hidden");
  }

  $allStoriesList.show();
}


// Function to handle form submission and add a new story
async function handleStoryFormSubmit(event) {
  event.preventDefault(); // Prevent the default form submission behavior

  // Check if form is already being submitted
  if (isSubmitting) {
    return;
  }

  // Set the flag to indicate form submission is in progress
  isSubmitting = true;

  // Get the form data
  const title = $("#story-title").val();
  const author = $("#story-author").val();
  const url = $("#story-url").val();

  // Call addStory method to add new story
  try {
    const newStory = await storyList.addStory(currentUser, { title, author, url });

    // Add new story to the page
    addStoryToPage(newStory);

    // Add new story to currentUser's favorites
    currentUser.favorites.push(newStory);

    // Reset form fields
    $("#story-title").val("");
    $("#story-author").val("");
    $("#story-url").val("");

    console.log("Story submitted successfully!");

    // Navigate to the list of stories
    putStoriesOnPage();
  } catch (error) {
    console.log("Error submitting story:", error);
  }

  // Reset the flag after form submission is completed
  isSubmitting = false;
}

function putUserStoriesOnPage() {
  console.debug("putUserStoriesOnPage");

  $allStoriesList.empty();

  const userStories = storyList.getStoriesByUser(currentUser);

  // Loop through all user stories and generate HTML for them
  for (let story of userStories) {
    const $story = generateStoryMarkup(story);
    const $removeButton = $("<span>")
      .addClass("remove-button")
      .text("Remove")
      .appendTo($story);

    $removeButton.on("click", async function () {
      await storyList.removeStory(currentUser, story.storyId);
      $story.remove();
    });

    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}

// Remove the event listener from the form submission event in main.js
$storyForm.off("submit", submitStory);

// Bind the event listener to the form submission event in stories.js
$storyForm.on("submit", handleStoryFormSubmit);

// Once the DOM is entirely loaded, begin the app
console.warn(
  "HEY STUDENT: This program sends many debug messages to the console. If you don't see the message 'start' below this, you're not seeing those helpful debug messages. In your browser console, click on menu 'Default Levels' and add Verbose"
);
$(getAndShowStoriesOnStart);




