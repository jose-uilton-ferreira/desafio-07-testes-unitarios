import { AppError } from "../../../../shared/errors/AppError";

export namespace CreateTransferStatementError {
  export class SenderNotFound extends AppError {
    constructor() {
      super('Sender not found', 404);
    }
  }

  export class ReceiverNotFound extends AppError {
    constructor() {
      super('Receiver not found', 404);
    }
  }

  export class InsufficientFunds extends AppError {
    constructor() {
      super("Insufficient Funds", 400);
    }
  }
}
