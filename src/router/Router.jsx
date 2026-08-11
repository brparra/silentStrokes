import { createBrowserRouter } from "react-router-dom";

import Main from "../Main/Main.jsx";
import ErrorPage from "../pages/error/ErrorPage";
import RippleCursor from "../components/shared/RippleCursor.jsx";

// Public pages
import Home from "../pages/home/Home";
import About from "../pages/about/About";
import Contact from "../pages/contact/Contact";
import Portfolio from "../pages/portfolio/Portfolio";
import Booking from "../pages/bookings/Booking";

// Shop and account
import Shop from "../pages/shop/Shop";
import MyCart from "../pages/shop/MyCart";
import Login from "../pages/auth/login/Login";
import Register from "../pages/auth/register/Register";
import Profile from "../pages/Profile/Profile";
import ReviewForm from "../pages/Review/ReviewForm";

// Studio dashboard
import StudioDashboard from "../pages/admin/StudioDashboard";

const Router = createBrowserRouter([
  {
    path: "/",
    element: (
      <>
        <RippleCursor />
        <Main />
      </>
    ),
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "booking",
        element: <Booking />,
      },
      {
        path: "about",
        element: <About />,
      },
      {
        path: "contact",
        element: <Contact />,
      },
      {
        path: "leave-a-note",
        element: <ReviewForm />,
      },
      {
        path: "portfolio",
        element: <Portfolio />,
      },
      {
        path: "shop",
        element: <Shop />,
      },
      {
        path: "my-cart",
        element: <MyCart />,
      },
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "register",
        element: <Register />,
      },
      {
        path: "profile",
        element: <Profile />,
      },
    ],
  },

  {
    path: "/studio-door",
    element: (
      <>
        <RippleCursor />
        <StudioDashboard />
      </>
    ),
    errorElement: <ErrorPage />,
  },
]);

export default Router;
