"use server"

import { prisma } from "@/lib/prisma";
import { getDbUserId } from "./useraction"

export async function getNotifications() {
  try {
    const userId = await getDbUserId();

    if (!userId) return [];

    const notificationsList = await prisma.notification.findMany({
      where: {
        userId
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            username: true,
            image: true,
          }

        },
        post: {
          select: {
            id: true,
            content: true,
            image: true,
          }
        },
        comment: {
          select: {
            id: true,
            content: true,
            createdAt: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    return notificationsList;

  } catch (error) {
    console.error("Error fetching notifications: ", error);
    throw new Error("Failed to fetch notifications.")
  }
}

export async function markNotificationAsRead(notificationIds : string[]) {
  try {
    await prisma.notification.updateMany({
      where: {
        id: {
          in: notificationIds
        }
      },
      data: {
        read: true
      }
    });

     return { success: true };
  } catch (error) {
    return { success: false }
  }
}