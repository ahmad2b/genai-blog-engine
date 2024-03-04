'use server'

import { supabase } from '@/lib/supabase'
import { decode } from 'base64-arraybuffer'
import { redirect } from 'next/navigation'
import OpenAI from 'openai'

if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing OPENAI_API_KEY environment variable')
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function createCompletion(prompt: string) {
  if (!prompt) {
    return { error: 'Prompt is required' }
  }

  // generate blog post using openai

  const messsages: any = [
    {
      role: 'user',
      content: `Write a blog post around 200 words about the following topic: "${prompt}" in markdown format.`
    }
  ]

  const completion = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: messsages
  })

  const content = completion?.choices?.[0]?.message?.content

  if (!content) {
    return { error: 'Failed to generate blog content' }
  }

  // generate an image using openai

  const image = await openai.images.generate({
    model: 'dall-e-3',
    prompt: `Generate an image for a blog post about "${prompt}"`,
    n: 1,
    size: '1792x1024',
    response_format: 'b64_json'
  })

  const imageName = `blog-${Date.now()}`
  const imageData = image?.data?.[0]?.b64_json as string
  if (!imageData) {
    return { error: 'Failed to generate blog image' }
  }

  // upload the image to supabase storage

  const { data, error } = await supabase.storage
    .from('imageStorage')
    .upload(imageName, decode(imageData), {
      contentType: 'image/png'
    })

  if (error) {
    return { error: 'Failed to upload blog image to storage' }
  }

  const path = data?.path
  const imageUrl = path
    ? `${process.env.SUPABASE_URL}/storage/v1/object/public/imageStorage/${path}`
    : null

  //  create a new blog post in supabase

  const { data: blog, error: blogError } = await supabase
    .from('blogs')
    .insert([
      {
        title: prompt,
        content: content,
        imageUrl: imageUrl,
        userId: '1234'
      }
    ])
    .select()

  if (blogError) {
    return { error: 'Failed to store blog post in the database' }
  }

  const blogId = blog?.[0]?.id

  redirect(`/blog/${blogId}`)
}
