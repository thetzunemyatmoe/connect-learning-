"use server";

import { prisma } from "@/lib/prisma";
import { auth, currentUser, EmailAddress } from "@clerk/nextjs/server";
import { error } from "console";

export async function syncUser() {
  try {
    const { userId }= await auth()
    const user = await currentUser();

    if (!userId || !user) return;

    const existUser = await prisma.user.findUnique({
      where: {
        clerkId: userId
      }
    })

    if (existUser) {
      return existUser
    }

    const dbUser = await prisma.user.create(
      {
        data: {
          clerkId: userId,
          name: `${user.firstName || ""} ${user.lastName || ""}`,
          username: user.username ?? user.emailAddresses[0].emailAddress.split("@")[0],
          email: user.emailAddresses[0].emailAddress,
          image: user.imageUrl
        }
      }
    )

    return dbUser;

  } catch(error) {
      console.log("Error in syncUser", error)
  }
}

export async function getUserByClerkId(clerkId:string) {

  return prisma.user.findUnique({
    where: {
      clerkId: clerkId
    },
    include:{
      _count:{
        select:{
          followers:true,
          followings:true,
          posts:true
        }
      }
    }
  })
  
}

export async function getDbUserId() {
  const { userId:clerkId } = await auth();

  if (!clerkId) return null;

  const user = await getUserByClerkId(clerkId);

  if (!user) throw new Error("User not found");

  return user.id;
  
}

export async function getRandomUsers() {
  try {
    const userId = await getDbUserId()

    // GET THREE RANDOM USERS (EXCLUDE OURSELF and ALREADY FOLLOWED USERS)
    if (!userId) return [];

    const randomUsers = await prisma.user.findMany({
      where: {
        AND: [
          // {
          //   NOT: { id: userId }
          // },
          {
            NOT: {
              followers: {
                some: {
                  followerId: userId
                }
              }
            }
          }
        ]
      }, 
      select: {
        id: true,
        name: true,
        username: true,
        image: true,
        _count: {
          select: {
            followers: true,
            followings: true
          }
        }
      },
      take: 3
    })

    return randomUsers;
  } catch (errror) {
    console.log("Error fetching random users", errror);
    return []
  }
}


export async function toggleFollow(targetUserId: string) {


  try {
    const userId = await getDbUserId();

    if (!userId) {
      return;
    }

    


    if (userId === targetUserId) {
      return {
        success: false,
        error: "You cannot follow yourself"
      }
    }

    console.log("this is reached")

    const existingFollow = await prisma.follows.findUnique({
      where: {
        followerId_followingId : {
          followerId: userId,
          followingId: targetUserId
        }
      }
    })

    if (existingFollow) {
        await prisma.follows.delete({
          where: {
            followerId_followingId: {
              followerId: userId,
              followingId: targetUserId
            }
          }
        })
      } else {
        await prisma.$transaction(
          [
            prisma.follows.create(
              {
                data: {
                  followerId: userId,
                  followingId: targetUserId
                }
              }
            ),
            prisma.notification.create(
              {
                data: {
                  type:"FOLLOW",
                  userId: targetUserId,
                  creatorId: userId
                }
              }
            )
          ]

        ) 
      }
      return {
          success: true
        }
  } catch (error) {
    console.log("Error in toggle follow", error);
    return {
      success: false,
      error: "Error toggling follow"
    }
  }
}
