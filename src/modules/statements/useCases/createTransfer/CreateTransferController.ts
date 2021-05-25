import { Request, Response } from "express";
import { container } from "tsyringe";
import { CreateTransferUseCase } from "./CreateTransferUseCase";

class CreateTransferController {
  public async execute(request: Request, response: Response): Promise<Response> {
    const { id: sender_user_id } = request.user;
    const { amount, description } = request.body;
    const { user_id: recipient_user_id } = request.params;

    const createTransferUseCase = container.resolve(CreateTransferUseCase);

    await createTransferUseCase.execute({
      sender_user_id,
      recipient_user_id: String(recipient_user_id),
      amount,
      description
    })

    return response.status(201).send();
  }

}

export { CreateTransferController };
