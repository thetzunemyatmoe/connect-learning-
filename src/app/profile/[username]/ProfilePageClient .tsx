"use client"
import { getProfileByUsername, getUserPosts, updateProfile } from '@/actions/profile.actions'
import { useUser } from '@clerk/nextjs';
import React, { useState } from 'react'
import toast from 'react-hot-toast';

type User = Awaited<ReturnType<typeof getProfileByUsername>>;
type Posts = Awaited<ReturnType<typeof getUserPosts>>;

interface ProfilePageClientProps {
  user: NonNullable<User>,
  posts: Posts,
  likedPosts: Posts,
  isFollowing: boolean
}

const ProfilePageClient = ({user, posts, likedPosts, isFollowing: initialFollowing}: ProfilePageClientProps) => {

  const { user: currentUser } = useUser();
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [isFollowing, setIsFollowing] = useState(initialFollowing);
  const [isUpdatingFollow, setIsUpdatingFollow] = useState(false);

  const [editForm, setEditForm] = useState({
    name: user.name || "",
    bio: user.bio || "",
    location: user.location || "",
    website: user.website || ""
  })

  const handleEditSubmit = async() => {
    const formData = new FormData();

    Object.entries(editForm).forEach(([key, value]) => {
      formData.append(key, value);
    });

    const result = await updateProfile(formData);

    if (result.success) {
      setShowEditDialog(false);
      toast.success("Profile updated successful.")
    }
  }

  return (
    <div>ProfilePageClient </div>
  )
}

export default ProfilePageClient 