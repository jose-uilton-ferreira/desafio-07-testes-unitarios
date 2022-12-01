import { inject, injectable } from "tsyringe";
import { IUsersRepository } from "../../../users/repositories/IUsersRepository";
import { Statement } from "../../entities/Statement";
import { IStatementsRepository } from "../../repositories/IStatementsRepository";
import { CreateTransferStatementError } from "./CreateTransferStatementError";

interface IRequest {
  user_id: string;
  sender_id: string;
  amount: number;
  description: string;
}

enum OperationType {
  TRANSFER = 'transfer',
}

@injectable()
class CreateTransferStatementUseCase {
  constructor(
    @inject("StatementsRepository")
    private statementsRepository: IStatementsRepository,
    @inject("UsersRepository")
    private usersRepository: IUsersRepository
  ) {}

  async execute({ user_id, sender_id, amount, description }: IRequest): Promise<Statement> {
    const senderExists = await this.usersRepository.findById(sender_id);

    if (!senderExists) {
      throw new CreateTransferStatementError.SenderNotFound();
    }

    const receiverExists = await this.usersRepository.findById(user_id);

    if (!receiverExists) {
      throw new CreateTransferStatementError.ReceiverNotFound();
    }

    const { balance: senderBalance } = await this.statementsRepository.getUserBalance({
      user_id: sender_id
    });

    if (amount > senderBalance) {
      throw new CreateTransferStatementError.InsufficientFunds();
    }

    const transferStatement = await this.statementsRepository.create({
      user_id,
      sender_id,
      type: OperationType.TRANSFER,
      amount,
      description
    })

    return transferStatement;
  }
}

export { CreateTransferStatementUseCase };