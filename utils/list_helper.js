const blog = require("../models/blog")

const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  return blogs.reduce((sum, blog) => {
    return sum + blog.likes
  }, 0)
}

const favoriteBlog = (blogs) => {
  const sortedBlogs = blogs.slice().sort((a, b) => b.likes - a.likes)
  return sortedBlogs[0]
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog
}