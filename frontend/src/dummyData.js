// dummyData.js
// Central source of fake data for D1. In later deliverables this will be
// replaced by real API calls to the Express backend + MongoDB.

export const currentUser = {
  id: "u1",
  name: "Alex Rivera",
  pronouns: "He/Him",
  bio: "Capturing light where I find it. Film photography enthusiast.",
  links: "alexrivera.photo",
  avatar: "https://placehold.co/150x150?text=AR",
  postsCount: 24,
  friendsCount: 58,
};

export const dummyFriends = [
  { id: "u2", name: "Jane Doe", pronouns: "She/Her", avatar: "https://placehold.co/80x80?text=JD" },
  { id: "u3", name: "Mike Chen", pronouns: "He/Him", avatar: "https://placehold.co/80x80?text=MC" },
  { id: "u4", name: "Priya Patel", pronouns: "She/Her", avatar: "https://placehold.co/80x80?text=PP" },
  { id: "u5", name: "Sam Okafor", pronouns: "They/Them", avatar: "https://placehold.co/80x80?text=SO" },
  { id: "u6", name: "Lena Novak", pronouns: "She/Her", avatar: "https://placehold.co/80x80?text=LN" },
  { id: "u7", name: "Tom Baker", pronouns: "He/Him", avatar: "https://placehold.co/80x80?text=TB" },
];

const makeComments = () => ([
  { id: "c1", user: "jane_doe", text: "Beautiful shot!" },
  { id: "c2", user: "mike99", text: "Where is this?" },
]);

export const dummyPosts = [
  { id: "p1", authorId: "u1", authorName: "Alex Rivera", authorAvatar: currentUser.avatar,
    imageUrl: "https://placehold.co/500x500?text=Post+1", caption: "Sunset over the mountains",
    likes: 42, comments: makeComments(), feed: "friends" },
  { id: "p2", authorId: "u2", authorName: "Jane Doe", authorAvatar: "https://placehold.co/80x80?text=JD",
    imageUrl: "https://placehold.co/500x500?text=Post+2", caption: "City lights",
    likes: 17, comments: [], feed: "friends" },
  { id: "p3", authorId: "u3", authorName: "Mike Chen", authorAvatar: "https://placehold.co/80x80?text=MC",
    imageUrl: "https://placehold.co/500x500?text=Post+3", caption: "Desert road trip",
    likes: 63, comments: makeComments(), feed: "adventure" },
  { id: "p4", authorId: "u4", authorName: "Priya Patel", authorAvatar: "https://placehold.co/80x80?text=PP",
    imageUrl: "https://placehold.co/500x500?text=Post+4", caption: "Hiking the ridge trail",
    likes: 29, comments: [], feed: "adventure" },
  { id: "p5", authorId: "u5", authorName: "Sam Okafor", authorAvatar: "https://placehold.co/80x80?text=SO",
    imageUrl: "https://placehold.co/500x500?text=Post+5", caption: "Campfire nights",
    likes: 51, comments: makeComments(), feed: "adventure" },
  { id: "p6", authorId: "u6", authorName: "Lena Novak", authorAvatar: "https://placehold.co/80x80?text=LN",
    imageUrl: "https://placehold.co/500x500?text=Post+6", caption: "Coastal walk",
    likes: 12, comments: [], feed: "friends" },
];

// A user's own posts, shown on their Profile page
export const dummyProfilePosts = dummyPosts.filter(p => p.authorId === "u1");

// A single post used for the Post page (dynamic route will pick the real one later)
export const dummySinglePost = dummyPosts[0];
