// src/Layout.jsx
import SendNav from './components/SendNav';
import { Outlet } from 'react-router-dom';
import NavBar from './components/navBar'; // Local component
export default function Layout() {
  return (
    <>
      <NavBar />
      <SendNav />
      <main>
        <Outlet />
      </main>
    </>
  );
}
