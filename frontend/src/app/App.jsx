import { Routes, Route } from 'react-router-dom';
import { appRoutes } from './routes';

export default function App() {
  return (
    <Routes>
      {appRoutes.map(({ path, element: Element, index }) => (
        <Route key={path || 'index'} path={path} index={index} element={<Element />} />
      ))}
    </Routes>
  );
}
