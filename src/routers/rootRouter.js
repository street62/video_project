import express from "express"
import {getJoin, postJoin, getLogin, postLogin, logout} from "../controllers/userController"
import {home, search} from "../controllers/videoController"
import { protectorMiddleware, publicOnlyMiddleware } from "../middlewares"

const rootRouter = express.Router()

rootRouter.get("/", home)
rootRouter.route('/join').get(getJoin).post(postJoin)
rootRouter.route("/login").all(publicOnlyMiddleware).get(getLogin).post(postLogin)
rootRouter.get("/logout", protectorMiddleware, logout)
rootRouter.get("/search", search)
 
export default rootRouter
