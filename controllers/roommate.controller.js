const RoommatePost = require("../models/RoommatePost");
const StudentProfile = require("../models/StudentProfile");
const RoommateRequest = require("../models/RoommateRequest");
const compatibilityScore = require("../utils/compatibilityScore");

const toBool = (value) => value === true || value === "true";

const parseTags = (tags) => {
  if (!tags) return [];
  return String(tags)
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
};

const profileFromPost = (post) => {
  if (!post) return null;

  const budgetMin =
    post.budgetMin !== undefined && post.budgetMin !== null
      ? Number(post.budgetMin)
      : Number(post.rentShare || 0);

  const budgetMax =
    post.budgetMax !== undefined && post.budgetMax !== null
      ? Number(post.budgetMax)
      : Number(post.rentShare || 0);

  return {
    foodPreference: post.foodPreference,
    lifestyle: post.lifestyle,
    habits: {
      smoking: post.habits?.smoking,
      drinking: post.habits?.drinking,
      cleanliness: post.habits?.cleanliness,
      sleepTime: post.habits?.sleepTime,
    },
    tags: post.tags || [],
    budgetMin,
    budgetMax,
    rentShare: Number(post.rentShare || 0),
  };
};

/**
 * Roommate Finder Page
 */
exports.finderPage = async (req, res) => {
  try {
    const currentUserId = req.user ? req.user._id : null;
    const currentProfile = currentUserId
      ? await StudentProfile.findOne({ user: currentUserId }).lean()
      : null;

    const currentUserPost = currentUserId
      ? await RoommatePost.findOne({ user: currentUserId })
          .sort({ createdAt: -1 })
          .lean()
      : null;

    // Get filter params from query
    const { collegeName, course, year } = req.query;
    const profileFilter = {};
    if (collegeName) profileFilter.collegeName = { $regex: collegeName, $options: "i" };
    if (course) profileFilter.course = { $regex: course, $options: "i" };
    if (year) profileFilter.year = { $regex: year, $options: "i" };
    const hasProfileFilter = Object.keys(profileFilter).length > 0;

    // Find roommate posts whose user profile matches filter
    let userIds = [];
    if (Object.keys(profileFilter).length > 0) {
      const filteredProfiles = await StudentProfile.find(profileFilter).lean();
      userIds = filteredProfiles.map((p) => p.user);
    }

    const postQuery = hasProfileFilter
      ? { user: { $in: userIds } }
      : {};
    const posts = await RoommatePost.find(postQuery)
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .lean();

    // Get all profiles for scoring
    const allUserIds = posts.map((p) => p.user?._id).filter(Boolean);
    const profiles =
      allUserIds.length > 0
        ? await StudentProfile.find({ user: { $in: allUserIds } }).lean()
        : [];

    const profileByUserId = profiles.reduce((acc, profile) => {
      acc[profile.user.toString()] = profile;
      return acc;
    }, {});

    const userRequests = currentUserId
      ? await RoommateRequest.find({
          $or: [{ requester: currentUserId }, { recipient: currentUserId }],
        })
          .select("post requester recipient status")
          .lean()
      : [];

    const requestByPostId = userRequests.reduce((acc, request) => {
      acc[request.post.toString()] = request;
      return acc;
    }, {});

    const incomingRequests = currentUserId
      ? await RoommateRequest.find({ recipient: currentUserId, status: "pending" })
          .populate("requester", "name email")
          .populate("post", "preferredLocation preferredArea rentShare postType")
          .sort({ createdAt: -1 })
          .lean()
      : [];

    const outgoingRequests = currentUserId
      ? await RoommateRequest.find({ requester: currentUserId })
          .populate("recipient", "name email")
          .populate("post", "preferredLocation preferredArea rentShare postType")
          .sort({ createdAt: -1 })
          .lean()
      : [];

    const postsWithScore = posts.map((post) => {
      const otherProfile = post.user
        ? profileByUserId[post.user._id.toString()]
        : null;

      const currentBasis = currentProfile || profileFromPost(currentUserPost);
      const otherBasis = otherProfile || profileFromPost(post);

      const score =
        currentBasis && otherBasis
          ? compatibilityScore(currentBasis, otherBasis)
          : 0;

      const linkedRequest = requestByPostId[post._id.toString()];

      return {
        ...post,
        compatibilityScore: score,
        profile: otherProfile || null,
        requestStatus: linkedRequest ? linkedRequest.status : null,
        canSendRequest: Boolean(
          currentUserId &&
            post.user &&
            post.user._id.toString() !== currentUserId.toString() &&
            !linkedRequest
        ),
        isOwner: Boolean(
          currentUserId &&
            post.user &&
            post.user._id.toString() === currentUserId.toString()
        ),
      };
    });

    res.render("student/roommate-finder", {
      pageCSS: "roommate.css",
      posts: postsWithScore,
      filter: { collegeName, course, year },
      canCreate: Boolean(req.user && req.user.role === "student"),
      incomingRequests,
      outgoingRequests,
    });
  } catch (err) {
    console.error(err);
    res.render("student/roommate-finder", {
      pageCSS: "roommate.css",
      posts: [],
      error: "Error loading roommate posts",
      canCreate: Boolean(req.user && req.user.role === "student"),
      incomingRequests: [],
      outgoingRequests: [],
    });
  }
};

/**
 * Send roommate request to post owner
 */
exports.sendRequest = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "student") {
      return res.status(403).send("Only students can send roommate requests");
    }

    const post = await RoommatePost.findById(req.params.postId).lean();
    if (!post || !post.user) return res.status(404).send("Roommate post not found");

    if (post.user.toString() === req.user._id.toString()) {
      return res.status(400).send("You cannot send request to your own post");
    }

    await RoommateRequest.findOneAndUpdate(
      { requester: req.user._id, post: post._id },
      {
        requester: req.user._id,
        recipient: post.user,
        post: post._id,
        message: req.body.message || "",
        status: "pending",
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.redirect("/roommate");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error sending roommate request");
  }
};

/**
 * Accept / reject roommate request
 */
exports.updateRequestStatus = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "student") {
      return res.status(403).send("Only students can update roommate requests");
    }

    const nextStatus = req.body.status;
    if (!["accepted", "rejected"].includes(nextStatus)) {
      return res.status(400).send("Invalid request status");
    }

    const request = await RoommateRequest.findById(req.params.id);
    if (!request) return res.status(404).send("Request not found");

    if (request.recipient.toString() !== req.user._id.toString()) {
      return res.status(403).send("Not allowed");
    }

    request.status = nextStatus;
    await request.save();

    res.redirect("/roommate");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error updating roommate request");
  }
};

/**
 * Dedicated requests page for roommate requests
 */
exports.requestsPage = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "student") {
      return res.redirect("/auth/login");
    }

    const incomingRequests = await RoommateRequest.find({ recipient: req.user._id })
      .populate("requester", "name email")
      .populate("post", "preferredLocation preferredArea rentShare postType")
      .sort({ createdAt: -1 })
      .lean();

    const outgoingRequests = await RoommateRequest.find({ requester: req.user._id })
      .populate("recipient", "name email")
      .populate("post", "preferredLocation preferredArea rentShare postType")
      .sort({ createdAt: -1 })
      .lean();

    res.render("student/roommate-requests", {
      incomingRequests,
      outgoingRequests,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading roommate requests");
  }
};

/**
 * Create Roommate Post
 */
exports.createPost = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "student") {
      return res.status(403).send("Only students can create roommate posts");
    }

    if (!req.body.rentShare) {
      return res.status(400).send("Rent share is required");
    }

    await RoommatePost.create({
      user: req.user._id,
      personImage: req.file ? req.file.filename : "",
      postType: req.body.postType === "existing_pg" ? "existing_pg" : "new_pg",
      pgName: req.body.pgName,
      preferredArea: req.body.preferredArea,
      preferredLocation: req.body.preferredLocation,
      roommatesNeeded: Number(req.body.roommatesNeeded) || 1,
      currentRentSplitDetails: req.body.currentRentSplitDetails,
      budgetMin: req.body.budgetMin ? Number(req.body.budgetMin) : undefined,
      budgetMax: req.body.budgetMax ? Number(req.body.budgetMax) : undefined,
      lifestylePreferences: req.body.lifestylePreferences,
      occupationOrCollege: req.body.occupationOrCollege,
      rentShare: Number(req.body.rentShare),
      genderPreference: req.body.genderPreference || "any",
      description: req.body.description,
      habits: {
        smoking: toBool(req.body["habits.smoking"]),
        drinking: toBool(req.body["habits.drinking"]),
        studyFriendly: toBool(req.body["habits.studyFriendly"]),
      },
      tags: parseTags(req.body.tags),
    });
    res.redirect("/roommate");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error creating roommate post");
  }
};

/**
 * Update roommate post
 */
exports.updatePost = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "student") {
      return res.status(403).send("Only students can edit roommate posts");
    }

    const post = await RoommatePost.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!post) return res.status(404).send("Roommate post not found");

    post.postType = req.body.postType === "existing_pg" ? "existing_pg" : "new_pg";
    if (req.file) {
      post.personImage = req.file.filename;
    }
    post.pgName = req.body.pgName || "";
    post.preferredArea = req.body.preferredArea || "";
    post.preferredLocation = req.body.preferredLocation || "";
    post.roommatesNeeded = Number(req.body.roommatesNeeded) || 1;
    post.currentRentSplitDetails = req.body.currentRentSplitDetails || "";
    post.budgetMin = req.body.budgetMin ? Number(req.body.budgetMin) : undefined;
    post.budgetMax = req.body.budgetMax ? Number(req.body.budgetMax) : undefined;
    post.lifestylePreferences = req.body.lifestylePreferences || "";
    post.occupationOrCollege = req.body.occupationOrCollege || "";
    post.rentShare = Number(req.body.rentShare) || post.rentShare;
    post.genderPreference = req.body.genderPreference || post.genderPreference;
    post.description = req.body.description || "";
    post.habits = {
      smoking: toBool(req.body["habits.smoking"]),
      drinking: toBool(req.body["habits.drinking"]),
      studyFriendly: toBool(req.body["habits.studyFriendly"]),
    };
    post.tags = parseTags(req.body.tags);

    await post.save();
    res.redirect("/roommate");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error updating roommate post");
  }
};

/**
 * Delete roommate post
 */
exports.deletePost = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "student") {
      return res.status(403).send("Only students can delete roommate posts");
    }

    await RoommatePost.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    res.redirect("/roommate");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error deleting roommate post");
  }
};

/**
 * Search Roommates
 */
exports.search = async (req, res) => {
  try {
    const filters = req.query;
    const posts = await RoommatePost.find(filters).populate(
      "user",
      "name email"
    );
    res.json(posts || []);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Search failed" });
  }
};

/**
 * Compatibility details page
 */
exports.compatibilityPage = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "student") {
      return res.redirect("/auth/login");
    }

    const currentProfile = await StudentProfile.findOne({
      user: req.user._id,
    }).lean();

    const otherProfile = await StudentProfile.findOne({
      user: req.params.userId,
    }).lean();

    if (!currentProfile || !otherProfile) {
      return res.status(404).render("student/compatibility", {
        score: 0,
      });
    }

    const score = compatibilityScore(currentProfile, otherProfile);

    res.render("student/compatibility", { score });
  } catch (err) {
    console.error(err);
    res.status(500).render("student/compatibility", { score: 0 });
  }
};