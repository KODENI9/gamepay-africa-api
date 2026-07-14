import axios from "axios";
import { env } from "../../config/env";

export interface InitiatePaymentParams {
  totalPrice: number;
  articleName: string;
  orderId: string;
  numeroSend: string;
  nomclient: string;
}

export interface InitiatePaymentResult {
  statut: boolean;
  token: string;
  message: string;
  url: string;
}

export interface CheckStatusResult {
  statut: boolean;
  message: string;
  data: {
    _id: string;
    tokenPay: string;
    numeroSend: string;
    nomclient: string;
    numeroTransaction: string;
    Montant: number;
    frais: number;
    statut: "pending" | "failure" | "no paid" | "paid";
    moyen: string;
    createdAt: string;
  };
}

export const moneyFusionClient = {
  async initiatePayment(params: InitiatePaymentParams): Promise<InitiatePaymentResult> {
    const response = await axios.post<InitiatePaymentResult>(
      env.MONEYFUSION_API_URL,
      {
        totalPrice: params.totalPrice,
        article: [{ [params.articleName]: params.totalPrice }],
        personal_Info: [{ orderId: params.orderId }],
        numeroSend: params.numeroSend,
        nomclient: params.nomclient,
        return_url: `${env.FRONTEND_BASE_URL}/confirmation/${params.orderId}`,
        webhook_url: `${env.PUBLIC_BASE_URL}/api/v1/payments/webhook`,
      },
      { headers: { "Content-Type": "application/json" } }
    );
    console.log("MoneyFusion initiatePayment response:", response.data);
    return response.data;
  },

  async checkPaymentStatus(token: string): Promise<CheckStatusResult> {
    const response = await axios.get<CheckStatusResult>(
      `https://pay.moneyfusion.net/paiementNotif/${token}`
    );
    console.log("MoneyFusion checkPaymentStatus response:", response.data);
    return response.data;
  },
};