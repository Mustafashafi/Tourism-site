import { Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import VerifyLogin from "./pages/VerifyLogin";
import Signup from "./components/Signup";
import Navbar from "./components/Navbar";
import Activities from "./pages/Activities";
import HomePage from "./pages/HomePage";
import Holidays from "./pages/Holidays";
import Visas from "./pages/Visas";
import Cruise from "./pages/Cruise";
import AboutUs from "./pages/AboutUs";
import Footer from "./components/Footer";
import UserSidebar from "./components/UserSidebar";
import ProductDetail from "./pages/ProductDetail";
import CityDetail from "./pages/CityDetail";
import Booking from "./pages/Booking";
import VisaBooking from "./pages/VisaBooking";
import { useState } from "react";
import { LanguageCurrencyProvider } from "./context/LanguageCurrencyContext";
import { CartProvider } from "./context/CartContext";
import { GoogleOAuthProvider } from "@react-oauth/google";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import { Toaster } from "react-hot-toast";

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  return (
    <GoogleOAuthProvider clientId="860874102599-d8jog91f7t0cfb5olp881l2hq6bio6jc.apps.googleusercontent.com">
      <LanguageCurrencyProvider>
        <CartProvider>
          <Toaster position="top-center" reverseOrder={false} />
          <Navbar onOpenUserMenu={() => setIsSidebarOpen(true)}/>
          <UserSidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />
      <Routes>
        <Route path="/" element={<HomePage/>}/>

        {/* ── Category listing pages ── */}
        <Route path="/activity" element={<Activities/>}/>
        <Route path="/activities" element={<Activities/>}/>
        <Route path="/holiday" element={<Holidays/>}/>
        <Route path="/holidays" element={<Holidays/>}/>
        <Route path="/visa" element={<Visas/>}/>
        <Route path="/visas" element={<Visas/>}/>
        <Route path="/cruises" element={<Cruise/>}/>
        <Route path="/cruise" element={<Cruise/>}/>

        {/* ── Dynamic product detail pages (plural slugs) ── */}
        <Route path="/activities/:slug" element={<ProductDetail/>}/>
        <Route path="/holidays/:slug" element={<ProductDetail/>}/>
        <Route path="/visas/:slug" element={<ProductDetail/>}/>
        <Route path="/cruises/:slug" element={<ProductDetail/>}/>
        <Route path="/booking/:slug" element={<Booking/>}/>
        <Route path="/visa-booking/:slug" element={<VisaBooking/>}/>

        {/* ── Other pages ── */}
        <Route path="/cart" element={<Cart/>}/>
        <Route path="/checkout" element={<Checkout/>}/>
        <Route path="/city/:citySlug" element={<CityDetail/>}/>
        <Route path="/about-us" element={<AboutUs/>}/>
        <Route path="/login" element={<Login />} />
        <Route path="/verify-login" element={<VerifyLogin />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
      <Footer/>
        </CartProvider>
      </LanguageCurrencyProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
