import { Statement } from "../../entities/Statement";

export interface ICreateTransferDTO {
  sender_user_id: string;
  recipient_user_id: string;
  amount: number;
  description: string;
}
