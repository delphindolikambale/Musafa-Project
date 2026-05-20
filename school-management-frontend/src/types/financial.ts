// Types pour les réponses et envois
export interface StudentPaymentResponseDTO {
  id: number;
  receiptNumber: string;
  annualProfileId: number;
  accountNumber: string;
  studentFullName: string;
  amountPaid: number;
  balanceAfterPayment: number;
  currency: string;
  paymentMethod: string;
  paymentDate: string;
  collectedBy: string;
}

export interface StudentPaymentCreateDTO {
  annualProfileId: number;
  amountPaid: number;
  paymentMethod: string;
}