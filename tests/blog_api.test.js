const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)

const Blog = require('../models/blog')

beforeEach(async () => {
  await Blog.deleteMany({})

  const blogObjects = helper.initialBlogs
    .map(blog => new Blog(blog))
  const promiseArray = blogObjects.map(blog => blog.save())
  await Promise.all(promiseArray)
})

test('blogs are returned as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test('all blogs are returned', async () => {
  const response = await api.get('/api/blogs')
  expect(response.body).toHaveLength(helper.initialBlogs.length)
})

test('unique identifier property of the blog posts is id, which is named as _id by default', async () => {
  const response = await api.get('/api/blogs')
  expect(JSON.parse(response.text)[0].id).toBeDefined()
})

test('a specific blog is within the returned blogs', async () => {
  const response = await api.get('/api/blogs')
  const title = helper.initialBlogs[Math.floor(Math.random()*helper.initialBlogs.length)].title
  const titles = response.body.map(r => r.title)
  expect(titles).toContain(title)
})

test('a new blog is successfully created', async () => {
  const newBlog = {
    title: 'Dummy Blog',
    author: 'Anon',
    url: 'http://blog.dummy.com',
    likes: 1,
  }
  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const blogsAtEnd = await helper.blogsInDb()
  expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)

  const storedBlog = blogsAtEnd[blogsAtEnd.length - 1]
  expect(blogsAtEnd).toContainEqual(
    {
      id: storedBlog.id,
      ...newBlog
    }
  )
})

test('if the likes property is missing from the request, it will default to the value 0', async () => {
  const newBlog = {
    title: 'Dummy Blog',
    author: 'Anon',
    url: 'http://blog.dummy.com',
  }
  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const blogsAtEnd = await helper.blogsInDb()
  expect(blogsAtEnd[blogsAtEnd.length - 1].likes).toEqual(0)
})

test('toContainEqual', () => {
  expect(['a', 'b', { foo: 'bar' }, 'd']).toContainEqual({ foo: 'bar' })
})

test('400 Bad Request if the title and url properties are missing from the request data', async () => {
  const newBlog = {
    author: 'Anon',
    likes: 1,
  }
  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(400)

  const blogsAtEnd = await helper.blogsInDb()
  expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)
})

test('delete a blog post', async () => {
  const randomIndex = Math.floor(Math.random() * helper.initialBlogs.length)
  const blogsAtStart = await helper.blogsInDb()
  const randomBlogId = blogsAtStart[randomIndex].id
  await api
    .delete(`/api/blogs/${randomBlogId}`)
    .expect(204)
  const blogsAtEnd = await helper.blogsInDb()
  expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length - 1)
  await api
    .get(`/api/blogs/${randomBlogId}`)
    .expect(404)
})

test('update a blog post', async () => {
  const randomIndex = Math.floor(Math.random() * helper.initialBlogs.length)
  const randomLikes = Math.floor(Math.random() * 100)
  const BlogToUpdate = {
    likes: randomLikes,
  }
  const blogsAtStart = await helper.blogsInDb()
  await api
    .put(`/api/blogs/${blogsAtStart[randomIndex].id}`)
    .send(BlogToUpdate)
    .expect(200)
  const blogsAtEnd = await helper.blogsInDb()
  expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)
  expect(blogsAtEnd[randomIndex].likes).toEqual(randomLikes)
})

afterAll(() => {
  mongoose.connection.close()
})