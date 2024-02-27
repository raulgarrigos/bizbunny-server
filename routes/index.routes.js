const router = require("express").Router();

router.get("/", (req, res, next) => {
  res.json("All good in here");
});

const boardRouter = require("./boards.routes");
router.use("/boards", boardRouter);

module.exports = router;
