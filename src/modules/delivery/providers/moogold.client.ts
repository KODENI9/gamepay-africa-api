import axios from "axios";
import { createHmac } from "crypto";
import { env } from "../../../config/env";

/**
 * Client HTTP pour l'API MooGold (doc.moogold.com). Chaque requête doit
 * porter 3 en-têtes : Basic Auth (partnerId:secretKey en base64), une
 * signature HMAC-SHA256 du corps + timestamp + chemin, et le timestamp
 * Unix courant.
 */

interface MoogoldEnvelope {
  status: boolean | "true" | "false";
  message?: string;
  [key: string]: unknown;
}

export interface CreateOrderResponse extends MoogoldEnvelope {
  account_details?: {
    player_id?: string;
    server_id?: string;
    order_id: string;
  };
}

export interface OrderDetailResponse {
  order_id: string;
  order_status: "processing" | "completed" | "refunded" | string;
  total: string;
  [key: string]: unknown;
}

export interface ValidateResponse extends MoogoldEnvelope {
  username?: string;
}

export interface ProductVariation {
  ID: string;
  variation_name?: string;
  price?: string;
  [key: string]: unknown;
}

export interface ProductDetailResponse {
  Product_Name: string;
  Image_URL?: string;
  Variation: ProductVariation[];
}

export interface BalanceResponse {
  currency: string;
  balance: string;
}

function buildAuthHeaders(fullBody: Record<string, unknown>, path: string) {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const bodyString = JSON.stringify(fullBody);
  const signature = createHmac("sha256", env.MOOGOLD_SECRET_KEY)
    .update(bodyString + timestamp + path)
    .digest("hex");
  const basicAuth = Buffer.from(`${env.MOOGOLD_PARTNER_ID}:${env.MOOGOLD_SECRET_KEY}`).toString(
    "base64"
  );

  return {
    Authorization: `Basic ${basicAuth}`,
    auth: signature,
    timestamp,
    "Content-Type": "application/json",
  };
}

async function callMoogold<T>(path: string, extra: Record<string, unknown>): Promise<T> {
  const fullBody = { path, ...extra };
  const headers = buildAuthHeaders(fullBody, path);

  const response = await axios.post<T>(`https://moogold.com/wp-json/v1/api/${path}`, fullBody, {
    headers,
  });
  return response.data;
}

export const moogoldClient = {
  async createOrder(params: {
    productId: string;
    quantity?: number;
    playerId: string;
    server?: string;
    partnerOrderId: string;
  }): Promise<CreateOrderResponse> {
    const data: Record<string, string> = {
      "product-id": params.productId,
      quantity: String(params.quantity ?? 1),
      "User ID": params.playerId,
    };
    if (params.server) data["Server"] = params.server;

    return callMoogold<CreateOrderResponse>("order/create_order", {
      data,
      partnerOrderId: params.partnerOrderId,
    });
  },

  async getOrderDetailByPartnerId(partnerOrderId: string): Promise<OrderDetailResponse> {
    return callMoogold<OrderDetailResponse>("order/order_detail_partner_id", {
      partner_order_id: partnerOrderId,
    });
  },

  async validateProduct(params: {
    productId: string;
    playerId: string;
    server?: string;
  }): Promise<ValidateResponse> {
    const data: Record<string, string> = {
      "product-id": params.productId,
      "User ID": params.playerId,
    };
    if (params.server) data["Server"] = params.server;

    return callMoogold<ValidateResponse>("product/validate", { data });
  },

  async listProducts(categoryId: number): Promise<{ ID: string; post_title: string }[]> {
    return callMoogold("product/list_product", { category_id: categoryId });
  },

  async getProductDetail(productId: number): Promise<ProductDetailResponse> {
    return callMoogold<ProductDetailResponse>("product/product_detail", { product_id: productId });
  },

  async getServerList(productId: number): Promise<Record<string, string>> {
    return callMoogold("product/server_list", { product_id: productId });
  },

  async getBalance(): Promise<BalanceResponse> {
    return callMoogold<BalanceResponse>("user/balance", {});
  },
};