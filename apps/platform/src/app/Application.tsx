import { RouterProvider } from 'react-router-dom';
import { router } from './router';

const Application = () => {
  return <RouterProvider router={router} />;
};

export default Application;
