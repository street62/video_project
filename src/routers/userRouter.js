import express from "express"
import {getEdit, postEdit, remove, logout, see, getJoin, postJoin, startGitbubLogin, finishGithubLogin} from "../controllers/userController"
import { protectorMiddleware, publicOnlyMiddleware } from "../middlewares";

const userRouter = express.Router()

userRouter.route("/edit").all(protectorMiddleware).get(getEdit).post(postEdit);
userRouter.get("/remove", remove)
userRouter.get("/github/start", publicOnlyMiddleware, startGitbubLogin)
userRouter.get("/github/finish", publicOnlyMiddleware, finishGithubLogin)
userRouter.get("/:id",protectorMiddleware, see)

export default userRouter