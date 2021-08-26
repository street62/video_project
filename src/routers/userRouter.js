import express from "express"
import {getEdit, postEdit, remove, logout, see, getJoin, postJoin, startGitbubLogin, finishGithubLogin, getChangePassword, postChangePassword} from "../controllers/userController"
import { protectorMiddleware, publicOnlyMiddleware, uploadMiddleware } from "../middlewares";

const userRouter = express.Router()

userRouter.route("/edit").all(protectorMiddleware).get(getEdit).post(uploadMiddleware.single("avatar"), postEdit);
userRouter.get("/remove", remove)
userRouter.get("/github/start", publicOnlyMiddleware, startGitbubLogin)
userRouter.get("/github/finish", publicOnlyMiddleware, finishGithubLogin)
userRouter.route("/change-password").all(protectorMiddleware).get(getChangePassword).post(postChangePassword)
userRouter.get("/:id",protectorMiddleware, see)

export default userRouter