import Home from "@/pages/HomePage.vue";
import About from "@/pages/AboutPage.vue";

export const routes = [
  {
    path: "/",
    name: "Home",
    component: Home,
  },
  {
    path: "/about",
    name: "About",
    component: About,
  },
];
