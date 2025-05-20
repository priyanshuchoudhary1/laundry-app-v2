import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import Home from "./Home";
import About from "./AboutUs";
import Services from "./Services";
import SignUp from "./SignUp";
import Cart from "./Cart";
import TrackOrder from "./TrackOrder";
import Account from "./Account";
import Login from "./Login";
import Payment from "./Payment";
import BasicPayment from "./BasicPayment";
import OrderConfirmation from "./OrderConfirmation";
import QualityCleaning from "./QualityCleaning";
import FastDelivery from "./FastDelivery";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/track-order" element={<TrackOrder />} />
          <Route path="/account" element={<Account />} />
          <Route path="/login" element={<Login />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/basic-payment" element={<BasicPayment />} />
          <Route path="/order-confirmation" element={<OrderConfirmation />} />
          <Route path="/quality-cleaning" element={<QualityCleaning />} />
          <Route path="/fast-delivery" element={<FastDelivery />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
