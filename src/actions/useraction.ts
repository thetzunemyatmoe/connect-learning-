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

export async function geUserByClerkId(clerkId:string) {

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