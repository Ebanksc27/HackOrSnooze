"use strict";

/******************************************************************************
 * Handling navbar clicks and updating navbar
 */

/** Show main list of all stories when clicking site name */
function navAllStories(evt) {
  console.debug("navAllStories", evt);
  hidePageComponents();
  putStoriesOnPage();
}

$body.off("click", "#nav-all").on("click", "#nav-all", navAllStories);

/** Show login/signup form on click on "login" */
function navLoginClick(evt) {
  console.debug("navLoginClick", evt);
  hidePageComponents();
  $loginForm.show();
  $signupForm.show();
}

$body.on("click", "#nav-login", navLoginClick);

/** When a user first logs in, update the navbar to reflect that. */
function updateNavOnLogin() {
  console.debug("updateNavOnLogin");
  $(".main-nav-links").show();
  $navLogin.hide();
  $navLogOut.show();
  $navUserProfile.text(`${currentUser.username}`).show();
}

/** Show story submission form when submit button is clicked in navigation bar */
function handleNavbarSubmitClick(evt) {
  console.debug("handleNavbarSubmitClick", evt);
  hidePageComponents();
  $storyForm.show();
}

$("#nav-submit-story").off("click").on("click", handleNavbarSubmitClick);

