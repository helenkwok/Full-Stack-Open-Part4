const _ = require('lodash')

const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  return blogs.reduce((sum, blog) => {
    return sum + blog.likes
  }, 0)
}

const favoriteBlog = (blogs) => {
  if (blogs.length > 0) {
    const sortedBlogs = blogs.slice().sort((a, b) => b.likes - a.likes)
    return {
      title: sortedBlogs[0].title,
      author: sortedBlogs[0].author,
      likes: sortedBlogs[0].likes
    }} else {
    return undefined
  }
}

const mostBlogs = (blogs) => {
  if (blogs.length > 0) {
    const countedList = _.entries(_.countBy(blogs, 'author')).sort((a, b) => b[1] - a[1])
    return {
      author: countedList[0][0],
      blogs: countedList[0][1]
    }
  } else {
    return undefined
  }

}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs
}