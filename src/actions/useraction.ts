"use server";

import { prisma } from "@/lib/prisma";
import { auth, currentUser, EmailAddress } from "@clerk/nextjs/server";

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

  if (!clerkId) throw new Error("Unauthorized");

  const user = await getUserByClerkId(clerkId);

  if (!user) throw new Error("User not found");

  return user.id;
  
}

export async function getRandomUsers() {
  try {
    const userId = await getDbUserId()

    // GET THREE RANDOM USERS (EXCLUDE OURSELF and ALREADY FOLLOWED USERS)

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

