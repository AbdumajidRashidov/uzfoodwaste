// src/services/banner.service.ts
import { PrismaClient } from "@prisma/client";
import { AppError } from "../middlewares/error.middleware";

const prisma = new PrismaClient();

export class BannerService {
  async createBanner(data: {
    title: string;
    title1?: string;
    title2?: string;
    image: string;
    btnText?: string;
    description1?: string;
    description2?: string;
    isActive?: boolean;
    order?: number;
  }) {
    return await prisma.banner.create({
      data,
    });
  }

  async updateBanner(
    bannerId: string,
    data: {
      title?: string;
      title1?: string;
      title2?: string;
      image?: string;
      btnText?: string;
      description1?: string;
      description2?: string;
      isActive?: boolean;
      order?: number;
    }
  ) {
    const banner = await prisma.banner.findUnique({
      where: { id: bannerId },
    });

    if (!banner) {
      throw new AppError("Banner not found", 404);
    }

    return await prisma.banner.update({
      where: { id: bannerId },
      data,
    });
  }

  async deleteBanner(bannerId: string) {
    const banner = await prisma.banner.findUnique({
      where: { id: bannerId },
    });

    if (!banner) {
      throw new AppError("Banner not found", 404);
    }

    await prisma.banner.delete({
      where: { id: bannerId },
    });
  }

  async getBanner(bannerId: string) {
    const banner = await prisma.banner.findUnique({
      where: { id: bannerId },
    });

    if (!banner) {
      throw new AppError("Banner not found", 404);
    }

    return banner;
  }

  async getAllBanners(query: {
    page?: number;
    limit?: number;
    isActive?: boolean;
  }) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.isActive !== undefined) {
      where.isActive = query.isActive;
    }

    const [total, banners] = await Promise.all([
      prisma.banner.count({ where }),
      prisma.banner.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ order: "asc" }, { created_at: "desc" }],
      }),
    ]);

    return {
      banners,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async updateBannerOrder(data: { id: string; order: number }[]) {
    const updates = data.map(({ id, order }) =>
      prisma.banner.update({
        where: { id },
        data: { order },
      })
    );

    await prisma.$transaction(updates);
  }
}
