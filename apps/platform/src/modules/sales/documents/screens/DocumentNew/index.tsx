import { DocumentEditor } from '../../components';
import { getDocumentConfig } from '../../config';
import type { DocumentKind } from '../../types';

type DocumentNewProps = {
  kind: DocumentKind;
};

const DocumentNew = ({ kind }: DocumentNewProps) => <DocumentEditor config={getDocumentConfig(kind)} />;

export default DocumentNew;
