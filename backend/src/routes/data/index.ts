const router = require("express").Router();
const data = require("../../controllers/data/data");

// POST
router.post("/addUser", data.createData);

export default router;
