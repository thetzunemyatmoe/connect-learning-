"use client";
import { getPosts, toggleLike } from '@/actions/post.actions';
import { useUser } from '@clerk/nextjs';
import React, { useState } from 'react'

type PostsDB = Awaited<ReturnType<typeof getPosts>>;
type PostDB = PostsDB[number]

const PostCard = ({ post, dbUserId }: { post: PostDB; dbUserId: string | null}) => {

  const { user } = useUser();
  const [newComment, setNewcomment] = useState("");
  const [isCommenting, setIsCommenting] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [hasLiked, setHasLiked] = useState(post.likes.some(like => like.userId === dbUserId));
  const [optimisticLikes, setOptimisticLikes] = useState(post._count.likes)


  // Functions
  const handleLike = async () => {
    if(isLiking) return

    try {
      setIsLiking(true)
      setHasLiked(prev => !prev)

      // If the user has already liked, decrement. Else increment.
      setOptimisticLikes(prev => prev + (hasLiked ? -1 : 1))

      await toggleLike(post.id)
    } catch (error) {
      setOptimisticLikes(post._count.likes)
      setHasLiked(false)
    } finally {
      setIsLiking(false)
    }
  }

  const handleAddCommen = async () => {

  }

  const handleDeletePost = async () => {

  }



  return (
    <div>PostCard</div>
  )
}

export default PostCard