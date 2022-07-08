const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const middleware = require('../utils/middleware')

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog
    .find({})
    .populate('user', { username: 1, name: 1 })

  response.json(blogs)
})

blogsRouter.get('/:id', async (request, response) => {
  const blog = await Blog
    .findById(request.params.id)
    .populate('user', { username: 1, name: 1 })

  blog ?
    response.json(blog)
    :
    response.status(404).end()
})

blogsRouter.post('/', middleware.userExtractor, async (request, response) => {
  if (!request.user) {
    return response.status(401).json({ error: 'token missing or invalid' })
  }

  const user = request.user
  const body = request.body

  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes || 0,
    user: user._id
  })

  const savedBlog = await blog.save()
  user.blogs = user.blogs.concat(savedBlog._id)
  await user.save()

  response.status(201)
    .json(savedBlog)
})

blogsRouter.delete('/:id', middleware.userExtractor, async (request, response) => {
  if (!request.user) {
    return response.status(401).json({ error: 'token missing or invalid' })
  }
  const user = request.user

  const blogToDelete = await Blog.findById(request.params.id)

  if (blogToDelete !== null) {
    if (blogToDelete.user._id.toString() === user._id.toString()) {
      await Blog.findByIdAndRemove(request.params.id)

      user.blogs = user.blogs
        .filter(blog => {
          return blog.toString() !== request.params.id.toString()
        })
      await user.save()

      response.status(204).end()

    } else {
      response.status(401).end()
    }
  } else {
    response.status(404).end()
  }
})

blogsRouter.put('/:id', middleware.userExtractor, async (request, response) => {
  if (!request.user) {
    return response.status(401).json({ error: 'token missing or invalid' })
  }
  const user = request.user
  const blog = {
    title: request.body.title,
    author: request.body.author,
    url: request.body.url,
    likes: request.body.likes,
  }

  const blogToUpdate = await Blog.findById(request.params.id)

  if (blogToUpdate !== null) {
    if (blogToUpdate.user._id.toString() === user._id.toString()) {
      const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blog, { new: true, runValidators: true, context: 'query' })

      response.json(updatedBlog)
    } else {
      response.status(401).end()
    }
  } else {
    response.status(404).end()
  }
})

module.exports = blogsRouter