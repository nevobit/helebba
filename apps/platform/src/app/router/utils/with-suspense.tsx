import { LineScaleLoader } from '@hlb/design-system';
import { Suspense, type JSX } from 'react';

const withSuspense = (el: JSX.Element) => (
  <Suspense fallback={<LineScaleLoader />}> {el} </Suspense>
);
export default withSuspense;
