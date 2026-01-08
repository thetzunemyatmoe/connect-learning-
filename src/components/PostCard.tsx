"use client";
import { getPosts } from '@/actions/post.actions';
import { useUser } from '@clerk/nextjs';
import React, { useState } from 'react'

type PostDB = Awaited<ReturnType<typeof getPosts>>;

const PostCard = ({ post, dbUserId }: { post: PostDB; dbUserId: string | null}) => {

  const { user } = useUser();
  const [newComment, setNewcomment] = useState("");
  const [isCommenting, setIsCommenting] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [hasLiked, setHasLiked] = useState(false);
  const [likes, setLikes] = useState(post._count.likes)


  return (
    <div>PostCard</div>
  )
}

export default PostCard