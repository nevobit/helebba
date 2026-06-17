import { useParams } from 'react-router-dom';
import { DocumentEditor } from '../../components';
import { getDocumentConfig } from '../../config';
import type { DocumentKind } from '../../types';

type DocumentEditProps = {
  kind: DocumentKind;
};

const DocumentEdit = ({ kind }: DocumentEditProps) => {
  const { documentId } = useParams();

  return <DocumentEditor config={getDocumentConfig(kind)} documentId={documentId ?? null} />;
};

export default DocumentEdit;
