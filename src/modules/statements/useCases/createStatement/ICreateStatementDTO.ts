import { Statement } from "../../entities/Statement";

export type ICreateStatementDTO =
  Pick<
    Statement,
    'user_id' |
    'recipient_user_id' |
    'sender_user_id' |
    'description' |
    'amount' |
    'type'
  >
