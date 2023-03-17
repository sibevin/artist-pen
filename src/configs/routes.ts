import EntryPage from "~/pages/EntryPage.vue";
import DiariesPage from "~/pages/dwdy/DiariesPage.vue";
import DiaryPage from "~/pages/dwdy/DiaryPage.vue";
import DiaryEditorPage from "~/pages/dwdy/DiaryEditorPage.vue";
import SettingsPage from "~/pages/SettingsPage.vue";
import AccountPage from "~/pages/AccountPage.vue";
import AboutPage from "~/pages/AboutPage.vue";
import ErrorPage from "~/pages/ErrorPage.vue";
import DevPage from "~/pages/DevPage.vue";

export const routes = [
  {
    path: "/",
    name: "entry",
    component: EntryPage,
  },
  {
    path: "/dwdy/diaries",
    name: "diaries",
    component: DiariesPage,
  },
  {
    path: "/dwdy/diary/:uid",
    name: "diary",
    component: DiaryPage,
  },
  {
    path: "/dwdy/diary/:uid/edit",
    name: "diaryEditor",
    component: DiaryEditorPage,
  },
  {
    path: "/settings",
    name: "settings",
    component: SettingsPage,
  },
  {
    path: "/account",
    name: "account",
    component: AccountPage,
  },
  {
    path: "/about",
    name: "about",
    component: AboutPage,
  },
  {
    path: "/error",
    name: "error",
    component: ErrorPage,
  },
  {
    path: "/dev",
    name: "dev",
    component: DevPage,
  },
  {
    path: "/:pathMatch(.*)*",
    redirect: () => {
      return { path: "/error", query: { err: "not_found" } };
    },
  },
];
