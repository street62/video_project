import Video from "../models/video"

export const home = async (req, res) => {
  const videos = await Video.find({}).sort({ createdAt: "desc" })
  return res.render('home', {pageTitle: 'Home', videos})
}
export const watch = async (req, res) => {
  const id = req.params.id
  const video = await Video.findById(id)
  if (video === null) {
    return res.status(404).render("404", {pageTitle: 'Video Not Found'}) // 여기서 return을 해줬기 때문에 video가 없을 경우에는 밑의 코드가 실행되지 않고 404를 렌더하는 데에서 끝남.
  }
  return res.render("watch", {pageTitle: video.title, video})
} 
export const getEdit = async (req, res) => {
  const id = req.params.id
  const video = await Video.findById(id)
  if (!video) {
    return res.status(404).render("404", {pageTitle: 'Video Not Found'})
  }
  return res.render("edit", {pageTitle: `Edit ${video.title}`, video}) // 여기서 video object를 'edit'에 보내줘야 하기 때문에 앞에서 .findById()로 video object를 찾아줘야 함.
}
export const postEdit = async (req, res) => {
  const id = req.params.id // === const {id} = req.params
  const {title, description, hashtags} = req.body
  // const video = await Video.findById(id) ---> Video는 동영상 model(schema), video는 그 model 안에서 특정 id로 찾은 동영상 DB object
  const video = await Video.exists({_id: id}) // postEdit에서는 getEdit처럼 video object의 필요성이 없기 때문에, exists()로 true/false만 반환해 줘도 됨
  if (!video) {
    return res.render('404', {pageTitle: 'Video Not Found'})
  }
  await Video.findByIdAndUpdate(id, {
    title, // === title: title
    description, // === description: description
    hashtags: Video.formatHashtags(hashtags)
  })
  return res.redirect(`/videos/${id}`)
}
export const getUpload = (req, res) => {
  return res.render('upload', {pageTitle: 'Upload'})
}
export const postUpload = async (req, res) => {
  const {title, description, hashtags} = req.body
  try {
    await Video.create({
      title: title,
      description: description,
      hashtags: Video.formatHashtags(hashtags),
    })
    return res.redirect('/')  
  } catch (error) {
    console.log(error)
    return res.status(400 ).render('upload', {pageTitle: 'Upload', errorMessage: error._message})
  }
}
export const deleteVideo = async (req, res) => {
  const { id } = req.params
  console.log(id)
  // delete video
  await Video.findByIdAndDelete(id)
  res.redirect('/')
}
export const search = async (req, res) => {
  let videos = []
  const {keyword} = req.query
  if (keyword) {
    videos = await Video.find({
      title: {
        $regex: new RegExp(keyword, 'i')
      }
    })
  } 
  res.render('search', {pageTitle: 'Search', videos})
}