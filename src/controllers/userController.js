import User from '../models/user'
import bcrypt from 'bcrypt'
import fetch from 'node-fetch'

export const getJoin = (req, res) => res.render('join', {pageTitle: 'Join'})
export const postJoin = async (req, res) => {
  console.log(req.body) 
  const {name, email, username, password, password2, location} = req.body
  const usernameExists = await User.exists({ $or: [{username}, {email}] })
  if (password !== password2) {
    return res.status(400).render('join', {pageTitle: 'Join', errorMessage: 'Please confirm password again.'})
  }
  if (usernameExists) {
    return res.status(400).render('join', {pageTitle: 'Join', errorMessage: 'This username/email is already taken.'})
  }
  try {
    await User.create({
      name,
      email,
      username,
      password,
      location
    })
    return res.redirect('/login') // 여기서 return은 없어도 동작한다. 그냥 끝이라는 의미임!
  } catch(error) {
    res.status(400).render('Join', {pageTitle: 'Join', errorMessage: error._message})
  }
}
export const getLogin = (req, res) => res.render("login", {pageTitle: 'Login'})
export const postLogin = async (req, res) => {
  const pageTitle = 'Login'
    // check if  account exists
  const {username, password} = req.body
  const user = await User.findOne({username, socialOnly: false})
  if (!user) {
    res.status(400).render('login', {pageTitle, errorMessage: 'Account not exists'})
  }
  // check if password is correct
  const matched = await bcrypt.compare(password, user.password)
  if (!matched) {
    res.status(400).render('login', {pageTitle, errorMessage: 'Password is not correct.'})
  }
  req.session.loggedIn = true
  req.session.user = user
  return res.redirect('/')
}

export const startGitbubLogin = (req, res) => {
  const BASE_URL = `https://github.com/login/oauth/authorize`
  const config = {
    client_id: process.env.GH_CLIENTID,
    allow_signup: false,
    scope: "read:user user:email"
  }
  const params = new URLSearchParams(config).toString();

  const FINAL_URL = `${BASE_URL}?${params}`;
  return res.redirect(FINAL_URL)
}
export const finishGithubLogin = async (req, res) => {
  const baseUrl = "https://github.com/login/oauth/access_token"
  const config = {
    client_id: process.env.GH_CLIENTID,
    client_secret: process.env.GH_SECRET,
    code: req.query.code,
  }
  const params = new URLSearchParams(config).toString();
  const finalUrl = `${baseUrl}?${params}`;
  const tokenRequest = await (await fetch(finalUrl, {
    method: "POST",
    headers: {
      Accept: "application/json",
    },
  })).json()

  if ("access_token" in tokenRequest) {
    // access api
    const {access_token} = tokenRequest;
    const REQUEST_URL = "https://api.github.com"
    const userData = await (await fetch(`${REQUEST_URL}/user`, {
      headers: {
        Authorization: `token ${access_token}`
      }
    })).json();
    const emailData = await (await fetch(`${REQUEST_URL}/user/emails`, {
      headers: {
        Authorization: `token ${access_token}`
      }
    })).json();
    const emailObj = emailData.find(
      (email) => email.primary === true && email.verified === true
    );
    if (!emailObj) {
      return res.redirect("/login");
    }
    let user = await User.findOne({email: emailObj.email});
    if (!user) {
      user = await User.create({
        name: userData.name ? userData.name : userData.login,
        email: emailObj.email,
        avatarUrl: userData.avatar_url,
        username: userData.login,
        socialOnly: true,
        location: userData.location,
        password: ""
      })
    }
    req.session.loggedIn = true;
    req.session.user = user; 
    return res.redirect("/");
  } else {
    res.redirect('/login')
  }
}
export const logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error(err);
      return res.redirect('/');
    }
  })
  res.clearCookie('connect.sid')
  console.log('User logged out!');
  return res.redirect('/')
}
export const getEdit = (req, res) => {
  const user = req.session.user
  return res.render('edit-profile', {pageTitle: "Edit Profile", user});
}
export const postEdit = async (req, res) => {
  // const user = req.session.user;
  // const {name, username, location} = req.body;
  const {
    body: {name, username, location},
    session: {user},
    file,
  } = req;
  if (user.username !== username) {
    if (await User.exists({username})) {
      return res.status(400).render('edit-profile', {pageTitle: "Edit Profile", errorMessage: "This username already exists. Try another one.", user})
    }
  }
  const updatedUser = await User.findByIdAndUpdate(user._id, {
    avatarUrl: file ? file.path : user.avatarUrl,
    name,
    username,
    location,
  }, {new: true});
  req.session.user = updatedUser;
  return res.redirect('/');
}

export const getChangePassword = (req, res) => {
  res.render("change-password", {pageTitle: "Change Password"})
}
export const postChangePassword = async (req, res) => {
  // send notification
  const {
    body: {currentPassword, newPassword, newPasswordConfirm},
    session: {
      user: {_id, password}
    }
  } = req
  const passwordMatched = await bcrypt.compare(currentPassword, password);
  if (!passwordMatched) {
    return res.status(400).render('change-password', {pageTitle: "Change Password", errorMessage: "Please check the current password."}) 
  }
  if (newPassword !== newPasswordConfirm) {
    return res.status(400).render('change-password', {pageTitle: "Change Password", errorMessage: "Password confirmation does not match."}) 
  }

  const user = await User.findOne({_id})
  user.password = newPassword
  console.log("password input: ", user.password)
  await user.save()
  console.log("hashed password: ", user.password)
  return res.redirect("/logout")

}
export const remove = (req, res) => res.send("Remove User")
export const see = (req, res) => res.send("See user")
