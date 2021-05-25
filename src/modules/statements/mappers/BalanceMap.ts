import { Statement } from "../entities/Statement";

export class BalanceMap {
  static toDTO({ statement, balance }: { statement: Statement[], balance: number }) {
    const parsedStatement = statement.map(({
      id,
      sender_user,
      recipient_user,
      amount,
      description,
      type,
      created_at,
      updated_at
    }) => (
      {
        id,
        amount: Number(amount),
        sender_id: sender_user?.id,
        sender_name: sender_user?.name,
        recipient_id: recipient_user?.id,
        recipient_name: recipient_user?.name,
        description,
        type,
        created_at,
        updated_at
      }
    ));

    return {
      statement: parsedStatement,
      balance: Number(balance)
    }
  }
}
