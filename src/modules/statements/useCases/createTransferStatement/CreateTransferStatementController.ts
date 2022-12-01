import { Request, Response } from "express";
import { container } from "tsyringe";

import { CreateTransferStatementUseCase } from "./CreateTransferStatementUseCase"

class CreateTransferStatementController {
  async execute(request: Request, response: Response): Promise<Response> {
    const { id: sender_id } = request.user;
    const { user_id } = request.params;

    const { amount, description } = request.body;

    const createTransferStatementUseCase = container.resolve(CreateTransferStatementUseCase);
    const transferStatement = await createTransferStatementUseCase.execute({
      user_id,
      sender_id,
      amount,
      description
    });

    return response.status(201).json(transferStatement);
  }
}

export { CreateTransferStatementController };