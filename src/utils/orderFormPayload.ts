import type { OrderFormModalValues } from "../components/OrderFormModal";
import type { CreateOrderBody, PatchOrderBody } from "../api/orders";

export function orderFormToCreateBody(v: OrderFormModalValues): CreateOrderBody {
  return {
    customerId: v.customerId,
    orderNo: v.orderNo?.trim() || undefined,
    productSummary: v.productSummary,
    amount: v.amount,
    currency: v.currency,
    incoterms: v.incoterms || null,
    shippingMethod: v.shippingMethod || null,
    logisticsNo: v.logisticsNo || null,
    depositAmount: v.depositAmount ?? null,
    balanceAmount: v.balanceAmount ?? null,
    status: v.status,
    orderedAt: v.orderedAt?.toISOString() ?? null,
    expectedShipAt: v.expectedShipAt?.toISOString() ?? null,
    shippedAt: v.shippedAt?.toISOString() ?? null,
    remark: v.remark || null,
  };
}

export function orderFormToPatchBody(v: OrderFormModalValues): PatchOrderBody {
  return orderFormToCreateBody(v);
}
