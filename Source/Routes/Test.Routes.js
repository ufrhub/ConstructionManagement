import EXPRESS from "express";

const ROUTER = EXPRESS.Router();

import { TestGetRequest, TestPostRequest } from "../Controllers/Test.Controllers.js";

ROUTER.get("/testGetRequest", TestGetRequest);
ROUTER.post("/testPostRequest", TestPostRequest);

export default ROUTER;