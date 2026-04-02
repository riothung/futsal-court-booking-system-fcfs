const expressRouter = require("express").Router();
const dataRouter = require("./data/index");

expressRouter.use("/data", dataRouter.expressRouter);

module.exports = expressRouter;
