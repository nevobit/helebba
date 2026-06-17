import { Collection, getModel } from '@hlb/constant-definitions';
import {
  DocumentSchemaMongo,
  LifecycleStatus,
  PaymentSchemaMongo,
  StatusDocument,
  type Document as SalesDocument,
  type DocumentId,
  type Payment,
} from '@hlb/contracts';

export const reconcileDocumentPayments = async (documentId?: string) => {
  if (!documentId) return null;

  const documentModel = getModel<SalesDocument>(Collection.DOCUMENTS, DocumentSchemaMongo);
  const paymentModel = getModel<Payment>(Collection.PAYMENTS, PaymentSchemaMongo);
  const document = await documentModel.findById(documentId);

  if (!document) return null;

  const payments = await paymentModel.find({
    documentId,
    lifecycleStatus: LifecycleStatus.ACTIVE,
  });
  const paymentsTotal = payments.reduce(
    (total, payment) => total + Number(payment.grossAmount ?? payment.amount ?? 0),
    0,
  );
  const paymentsPending = Math.max(Number(document.total ?? 0) - paymentsTotal, 0);
  const status =
    paymentsTotal <= 0
      ? StatusDocument.Pending
      : paymentsPending <= 0
        ? StatusDocument.Paid
        : StatusDocument.PartiallyPaid;

  await documentModel.updateOne(
    { _id: documentId as DocumentId },
    {
      $set: {
        paymentsTotal,
        paymentsPending,
        status,
        updatedAt: new Date(),
      },
    },
  );

  return documentModel.findById(documentId);
};
