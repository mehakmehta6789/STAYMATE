const PGRequest = require("../models/PGRequest");
const PG = require("../models/PG");
const StudentProfile = require("../models/StudentProfile");

/**
 * Student creates a request for a PG
 */
exports.createRequest = async (req, res) => {
  try {
    const { pgId, type, message, expectedRentShare } = req.body;

    if (!pgId) return res.status(400).send("PG is required");

    const pg = await PG.findById(pgId).lean();
    if (!pg) return res.status(404).send("PG not found");

    if (pg.availableBeds <= 0 && type !== "roommate") {
      return res.status(400).send("No beds available in this PG");
    }

    const existingPending = await PGRequest.findOne({
      pg: pgId,
      student: req.session.user._id,
      status: "pending",
    }).lean();

    if (existingPending) {
      return res.redirect(`/pg/${pgId}`);
    }

    await PGRequest.create({
      pg: pgId,
      student: req.session.user._id,
      type: type === "roommate" ? "roommate" : "stay",
      message,
      expectedRentShare: expectedRentShare || undefined,
    });

    res.redirect(`/pg/${pgId}`);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error creating request");
  }
};

/**
 * Owner: list requests for their PGs
 */
exports.listForOwner = async (req, res) => {
  try {
    const ownerId = req.session.user._id;

    const requests = await PGRequest.find()
      .populate({
        path: "pg",
        match: { owner: ownerId },
      })
      .populate("student", "name email")
      .sort({ createdAt: -1 })
      .lean();

    const filtered = requests.filter((r) => r.pg); // only PGs owned by this owner

    const studentIds = filtered
      .map((r) => r.student?._id)
      .filter(Boolean)
      .map((id) => id.toString());

    const profiles = studentIds.length
      ? await StudentProfile.find({ user: { $in: studentIds } })
          .select("user collegeName budgetMin budgetMax")
          .lean()
      : [];

    const profileMap = profiles.reduce((acc, profile) => {
      acc[profile.user.toString()] = profile;
      return acc;
    }, {});

    const requestsWithProfile = filtered.map((request) => {
      const profile = request.student
        ? profileMap[request.student._id.toString()]
        : null;

      return {
        ...request,
        studentProfile: profile || null,
      };
    });

    res.render("owner/enquiries", { requests: requestsWithProfile || [] });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error loading enquiries");
  }
};

/**
 * Owner: update request status
 */
exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const valid = ["pending", "approved", "rejected"];
    if (!valid.includes(status)) return res.status(400).send("Invalid status");

    const request = await PGRequest.findById(req.params.id).populate("pg");
    if (!request || !request.pg)
      return res.status(404).send("Request not found");

    if (request.pg.owner.toString() !== req.session.user._id.toString()) {
      return res.status(403).send("Not allowed");
    }

    if (status === "approved") {
      if (!request.pg.approvedStudents) {
        request.pg.approvedStudents = [];
      }

      const alreadyApproved = request.pg.approvedStudents.some(
        (studentId) => studentId.toString() === request.student.toString()
      );

      if (!alreadyApproved) {
        if (request.pg.availableBeds <= 0) {
          return res.status(400).send("No available beds left");
        }

        request.pg.approvedStudents.push(request.student);
        request.pg.availableBeds = Math.max(0, (request.pg.availableBeds || 0) - 1);
        request.pg.availability = request.pg.availableBeds > 0;
        await request.pg.save();
      }

      await StudentProfile.findOneAndUpdate(
        { user: request.student },
        { $set: { currentPg: request.pg._id } },
        { upsert: true, new: true }
      );
    }

    request.status = status;
    await request.save();

    res.redirect("/owner/enquiries");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error updating request");
  }
};

