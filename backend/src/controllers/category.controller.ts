// src/controllers/category.controller.ts
import { Request, Response, NextFunction } from "express";
import { CategoryService } from "../services/category.service";

const categoryService = new CategoryService();

export class CategoryController {
  async createCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const category = await categoryService.createCategory(req.body);
      res.status(201).json({
        status: "success",
        data: category,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const { categoryId } = req.params;
      const category = await categoryService.updateCategory(
        categoryId,
        req.body
      );
      res.status(200).json({
        status: "success",
        data: category,
      });
    } catch (error) {
      next(error);
    }
  }

  async deleteCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const { categoryId } = req.params;
      await categoryService.deleteCategory(categoryId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  async getCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const { categoryId } = req.params;
      const category = await categoryService.getCategory(categoryId);
      res.status(200).json({
        status: "success",
        data: category,
      });
    } catch (error) {
      next(error);
    }
  }

  async getAllCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const query = {
        page: req.query.page ? parseInt(req.query.page as string) : undefined,
        limit: req.query.limit
          ? parseInt(req.query.limit as string)
          : undefined,
        search: req.query.search as string | undefined,
      };

      const result = await categoryService.getAllCategories(query);
      res.status(200).json({
        status: "success",
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}
