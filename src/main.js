import { createApp } from "vue";
import { createMetaManager } from "vue-meta";
import "./assets/css/tailwind.css";
import App from "./App.vue";
import { buildRouter } from "./services/route";

const router = buildRouter();
const metaManager = createMetaManager();

const app = createApp(App);
app.use(router);
app.use(metaManager);
app.mount("#app");
