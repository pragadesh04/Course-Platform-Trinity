import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Layout/Navbar';
import Footer from './components/Layout/Footer';
import WhatsAppButton from './components/UI/WhatsAppButton';
import SmoothScroll from './components/UI/SmoothScroll';
import CustomCursor from './components/UI/Cursor';
import Home from './pages/Home';
import Courses from './pages/Courses';
import CourseDetail from './pages/CourseDetail';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Orders from './pages/Orders';
import Admin from './pages/Admin';
import About from './pages/About';
import Contact from './pages/Contact';
import Player from './pages/Player';
import './styles/index.css';

function AppContent() {
  const location = useLocation();
  const isPlayerPage = location.pathname.startsWith('/course/');
  const isAdminPage = location.pathname === '/admin' || location.pathname.startsWith('/admin/');

  return (
    <SmoothScroll>
      <CustomCursor />
      <div className="app">
        {!isPlayerPage && !isAdminPage && <Navbar />}
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/courses/:id" element={<CourseDetail />} />
            <Route path="/course/:courseId/play/:sessionIndex" element={<Player />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
          </Routes>
        </main>
        {!isPlayerPage && !isAdminPage && <Footer />}
        {!isPlayerPage && !isAdminPage && <WhatsAppButton />}
      </div>
    </SmoothScroll>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
