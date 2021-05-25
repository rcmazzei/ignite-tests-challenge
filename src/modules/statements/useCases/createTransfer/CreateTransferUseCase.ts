import { inject, injectable } from "tsyringe";
import { AppError } from "../../../../shared/errors/AppError";
import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { OperationType, Statement } from "../../entities/Statement";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { ICreateTransferDTO } from "./ICreateTransferDTO";

@injectable()
class CreateTransferUseCase {
  constructor(
    @inject("StatementsRepository")
    private statementsRepository: IStatementsRepository,
    @inject("UsersRepository")
    private usersRepository: IUsersRepository,
  ) { }

  public async execute({
    sender_user_id,
    recipient_user_id,
    amount,
    description
  }: ICreateTransferDTO): Promise<void> {

    const sender_user = await this.usersRepository.findById(sender_user_id);

    if (!sender_user) {
      throw new AppError('Sender user does not exists', 404);
    }

    const userBalance = await this.statementsRepository.getUserBalance({
      user_id: sender_user_id,
      with_statement: false
    });

    if (userBalance.balance < amount) {
      throw new AppError('Insuficcient funds to make the transfer');
    }

    const recipient_user = await this.usersRepository.findById(recipient_user_id);

    if (!recipient_user) {
      throw new AppError('Recipient user does not exists', 404);
    }


    await this.statementsRepository.create({
      user_id: sender_user_id,
      type: OperationType.TRANSFER,
      amount,
      description,
      recipient_user_id
    });

    await this.statementsRepository.create({
      user_id: recipient_user_id,
      type: OperationType.TRANSFER,
      amount,
      description,
      sender_user_id
    });
  }
}

export { CreateTransferUseCase };
