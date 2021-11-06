import { Controller, Post, ClassMiddleware } from '@overnightjs/core';
import { Request, Response } from 'express';
import { Account } from '@src/models/account';
import { authMiddleware } from '@src/middlewares/auth';
import { BaseController } from '.';

@Controller('accounts')
@ClassMiddleware(authMiddleware)
export class AccountsController extends BaseController {
  @Post('new')
  public async create(req: Request, res: Response): Promise<void> {
    try {
      const account = new Account({ ...req.body, ...{ user: req.decoded?.id } });
      const result = await account.save();
      res.status(201).send(result);
    } catch (error) {
      this.sendCreateUpdateErrorResponse(res, error)
    }
  }
}