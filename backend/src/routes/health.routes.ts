import { Router } from "express";

const router = Router();

router.route("/health").get((_req, res) => {
  res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: Date.now(),
  });
});

export default router;