const PG = require("../models/PG");

/**
 * Create PG
 */
exports.createPG = async (req, res) => {
  try {
    if (!req.body.title || !req.body.rent) {
      return res.status(400).render("owner/add-pg", {
        error: "Title and rent are required",
      });
    }

    const facilities = req.body.facilities
      ? req.body.facilities.split(",").map((f) => f.trim()).filter(Boolean)
      : [];

    // Store only filenames; templates resolve them under /images/.
    const images = req.files ? req.files.map((file) => file.filename) : [];

    const city = (req.body.city || "").trim();
    const area = (req.body.area || "").trim();
    const fallbackLocation = [city, area].filter(Boolean).join(", ");
    const location = (req.body.location || fallbackLocation || "").trim();

    const totalBeds = Number(req.body.totalBeds) || 1;
    const availableBeds =
      req.body.availableBeds !== undefined && req.body.availableBeds !== ""
        ? Math.max(0, Number(req.body.availableBeds))
        : totalBeds;

    await PG.create({
      title: req.body.title,
      location,
      city,
      area,
      fullAddress: req.body.fullAddress,
      mapEmbedUrl: req.body.mapEmbedUrl,
      rent: req.body.rent,
      rentBreakdown: req.body.rentBreakdown,
      roomType: req.body.roomType,
      genderPreference: req.body.genderPreference,
      facilities,
      rules: req.body.rules,
      totalBeds,
      availableBeds,
      ownerContact: req.body.ownerContact,
      images,
      owner: req.session.user._id,
      availability: availableBeds > 0,
    });
    res.redirect("/owner/my-pgs");
  } catch (err) {
    console.error(err);
    res.status(500).render("owner/add-pg", {
      error: "Failed to create PG",
    });
  }
};

/**
 * Update PG
 */
exports.updatePG = async (req, res) => {
  try {
    const facilities = req.body.facilities
      ? req.body.facilities.split(",").map((f) => f.trim()).filter(Boolean)
      : undefined;

    const city = req.body.city !== undefined ? req.body.city.trim() : undefined;
    const area = req.body.area !== undefined ? req.body.area.trim() : undefined;

    const nextData = {
      ...req.body,
    };

    if (facilities !== undefined) nextData.facilities = facilities;
    if (city !== undefined) nextData.city = city;
    if (area !== undefined) nextData.area = area;

    if ((city && city.length > 0) || (area && area.length > 0)) {
      nextData.location = [city || "", area || ""].filter(Boolean).join(", ");
    }

    if (nextData.totalBeds !== undefined) {
      nextData.totalBeds = Math.max(1, Number(nextData.totalBeds));
    }

    if (nextData.availableBeds !== undefined) {
      nextData.availableBeds = Math.max(0, Number(nextData.availableBeds));
    }

    if (nextData.availableBeds !== undefined) {
      nextData.availability = Number(nextData.availableBeds) > 0;
    }

    if (req.files && req.files.length > 0) {
      // Replace image set only when new files are uploaded.
      nextData.images = req.files.map((file) => file.filename);
    }

    await PG.findOneAndUpdate(
      { _id: req.params.id, owner: req.session.user._id },
      nextData,
      { new: true }
    );
    res.redirect("/owner/my-pgs");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error updating PG");
  }
};

/**
 * Toggle Availability
 */
exports.toggleAvailability = async (req, res) => {
  try {
    const pg = await PG.findOne({
      _id: req.params.id,
      owner: req.session.user._id,
    });
    if (!pg) return res.status(404).send("PG not found");

    pg.availability = !pg.availability;
    await pg.save();
    res.redirect("/owner/my-pgs");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error toggling availability");
  }
};

/**
 * Delete PG
 */
exports.deletePG = async (req, res) => {
  try {
    await PG.findOneAndDelete({
      _id: req.params.id,
      owner: req.session.user._id,
    });
    res.redirect("/owner/my-pgs");
  } catch (err) {
    console.error(err);
    res.status(500).send("Error deleting PG");
  }
};