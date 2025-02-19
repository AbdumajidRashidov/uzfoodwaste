// src/services/category.service.ts
import { PrismaClient } from "@prisma/client";
import { AppError } from "../middlewares/error.middleware";

const prisma = new PrismaClient();

export class CategoryService {
  async createCategory(data: {
    name: string;
    description: string;
    image: string;
  }) {
    // Check if category with same name exists
    const existingCategory = await prisma.category.findUnique({
      where: { name: data.name },
    });

    if (existingCategory) {
      throw new AppError("Category with this name already exists", 400);
    }

    // Create category
    const category = await prisma.category.create({
      data,
    });

    return category;
  }

  async updateCategory(
    categoryId: string,
    data: {
      name?: string;
      description?: string;
      image?: string;
    }
  ) {
    // Check if category exists
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      throw new AppError("Category not found", 404);
    }

    // If name is being updated, check for uniqueness
    if (data.name) {
      const existingCategory = await prisma.category.findUnique({
        where: { name: data.name },
      });

      if (existingCategory && existingCategory.id !== categoryId) {
        throw new AppError("Category with this name already exists", 400);
      }
    }

    // Update category
    const updatedCategory = await prisma.category.update({
      where: { id: categoryId },
      data,
    });

    return updatedCategory;
  }

  async deleteCategory(categoryId: string) {
    // Check if category exists
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      include: {
        listings: true,
      },
    });

    if (!category) {
      throw new AppError("Category not found", 404);
    }

    // Check if category is being used by any listings
    if (category.listings.length > 0) {
      throw new AppError(
        "Cannot delete category that is being used by listings",
        400
      );
    }

    // Delete category
    await prisma.category.delete({
      where: { id: categoryId },
    });
  }

  async getCategory(categoryId: string) {
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      include: {
        listings: {
          include: {
            listing: {
              include: {
                business: true,
                location: true,
              },
            },
          },
        },
      },
    });

    if (!category) {
      throw new AppError("Category not found", 404);
    }

    return category;
  }

  async getAllCategories(query: {
    page?: number;
    limit?: number;
    search?: string;
  }) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: "insensitive" } },
        { description: { contains: query.search, mode: "insensitive" } },
      ];
    }

    // Get total count
    const total = await prisma.category.count({ where });

    // Get categories
    const categories = await prisma.category.findMany({
      where,
      include: {
        _count: {
          select: {
            listings: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: {
        name: "asc",
      },
    });

    return {
      categories,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
