import { createApp } from "vue";
import { createWebHistory, createRouter } from "vue-router";
import "./assets/css/tailwind.css";
import "./style.css";
import App from "./App.vue";
import { routes } from "./configs/routes";

const router = createRouter({
  history: createWebHistory(),
  routes,
});

const app = createApp(App);
app.use(router);
app.mount("#app");
