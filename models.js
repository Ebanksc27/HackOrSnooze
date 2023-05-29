"use strict";

const BASE_URL = "https://hack-or-snooze-v3.herokuapp.com";

/******************************************************************************
 * Story: a single story in the system
 */

class Story {
  constructor({ storyId, title, author, url, username, createdAt }) {
    this.storyId = storyId;
    this.title = title;
    this.author = author;
    this.url = url;
    this.username = username;
    this.createdAt = createdAt;
    this.isFavorite = false; //to track the favorite status, initially set to false
  }

  getHostName() {
    const urlObject = new URL(this.url);
    return urlObject.hostname;
  }
}

/******************************************************************************
 * List of Story instances: used by UI to show story lists in DOM.
 */

class StoryList {
  constructor(stories) {
    this.stories = stories;
  }

  async addStory(user, newStory) {
    const response = await axios.post(`${BASE_URL}/stories`, {
      token: user.loginToken,
      story: newStory,
    });
  
    const addedStory = new Story(response.data.story);
    this.stories.push(addedStory);
    return addedStory;
  }

  static async getStories() {
    const response = await axios({
      url: `${BASE_URL}/stories`,
      method: "GET",
    });
  
    const stories = response.data.stories.map(story => new Story(story));
    const sortedStories = stories.sort((a, b) => b.createdAt - a.createdAt);
    return new StoryList(sortedStories);
  }

  async addFavoriteStory(user, storyId) {
    await axios.post(`${BASE_URL}/users/${user.username}/favorites/${storyId}`, {
      token: user.loginToken,
    });
  }

  async removeFavoriteStory(user, storyId) {
    await axios.delete(`${BASE_URL}/users/${user.username}/favorites/${storyId}`, {
      data: { token: user.loginToken },
    });
  }

  async toggleFavoriteStory(user, storyId) {
  console.log("Inside toggleFavoriteStory");
  
  const story = this.stories.find(story => story.storyId === storyId);

  if (!story) {
    throw new Error("Story not found");
  }

  if (story.isFavorite) {
    console.log("Attempting to remove favorite story");
    await this.removeFavoriteStory(user, storyId);
    console.log("Successfully removed favorite story");
    story.isFavorite = false;
  } else {
    console.log("Attempting to add favorite story");
    await this.addFavoriteStory(user, storyId);
    console.log("Successfully added favorite story");
    story.isFavorite = true;
  }
}

  getFavoriteStories() {
    return this.stories.filter(story => story.isFavorite);
  }

 async removeStory(user, storyId) {
  await axios.delete(`${BASE_URL}/stories/${storyId}`, {
    headers: { Authorization: `Bearer ${user.loginToken}` },
  });

  this.stories = this.stories.filter((story) => story.storyId !== storyId);
}


  getStoriesByUser(user) {
    return this.stories.filter(story => story.username === user.username);
}
}


/******************************************************************************
 * User: a user in the system (only used to represent the current user)
 */

class User {
  constructor(
    { username, name, createdAt, favorites = [], ownStories = [] },
    token
  ) {
    this.username = username;
    this.name = name;
    this.createdAt = createdAt;
    this.favorites = favorites.map(story => new Story(story));
    this.ownStories = ownStories.map(story => new Story(story));
    this.loginToken = token;
  }

  static async signup(username, password, name) {
    const response = await axios({
      url: `${BASE_URL}/signup`,
      method: "POST",
      data: { user: { username, password, name } },
    });

    const { user } = response.data;

    return new User(
      {
        username: user.username,
        name: user.name,
        createdAt: user.createdAt,
        favorites: user.favorites,
        ownStories: user.stories,
      },
      response.data.token
    );
  }

  static async login(username, password) {
    const response = await axios({
      url: `${BASE_URL}/login`,
      method: "POST",
      data: { user: { username, password } },
    });

    const { user } = response.data;

    return new User(
      {
        username: user.username,
        name: user.name,
        createdAt: user.createdAt,
        favorites: user.favorites,
        ownStories: user.stories,
      },
      response.data.token
    );
  }

  static async loginViaStoredCredentials(token, username) {
    try {
      const response = await axios({
        url: `${BASE_URL}/users/${username}`,
        method: "GET",
        params: { token },
      });

      const { user } = response.data;

      return new User(
        {
          username: user.username,
          name: user.name,
          createdAt: user.createdAt,
          favorites: user.favorites,
          ownStories: user.stories,
        },
        token
      );
    } catch (err) {
      console.error("loginViaStoredCredentials failed", err);
      return null;
    }
  }
}