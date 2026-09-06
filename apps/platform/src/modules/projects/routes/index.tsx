import type { RouteObject } from 'react-router-dom';
import withSuspense from '@/app/router/utils/with-suspense';
import MyTasks from '../screens/MyTasks';
import Projects from '../screens/Projects';
import ProjectBoard from '../screens/ProjectBoard';
import AllTasks from '../screens/AllTasks';
import TimeEntries from '../screens/TimeEntries';

export const projectRoutes: RouteObject[] = [
  { path: '/projects', element: withSuspense(<Projects />) },
  { path: '/projects/tasks', element: withSuspense(<MyTasks />) },
  { path: '/projects/all-tasks', element: withSuspense(<AllTasks />) },
  { path: '/projects/time', element: withSuspense(<TimeEntries />) },
  { path: '/projects/:projectId', element: withSuspense(<ProjectBoard />) },
];
