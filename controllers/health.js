import Video from "../models/Video.js";

export const healthCheck = async (req, res) => {
  try {
    // Preload or cache trending video data
    const videos = await Video.find({ visibility: "published" })
      .sort({ views: -1 })
      .limit(10);
    // Preload top 10 videos
    console.log("Preloaded videos:", videos.length);
    res.sendStatus(200);
  } catch (error) {
    console.error("Error preloading videos:", error);
    res.sendStatus(500);
  }
};
