// @ts-check
import { defineConfig } from "vite";
import reactRefresh from "@vitejs/plugin-react-refresh";
import vitePluginImp from "vite-plugin-imp";

/**
 * @type { import('vite').UserConfig }
 */
const config = defineConfig({
  css: {
    preprocessorOptions: {
      less: {
        // modifyVars: { 'primary-color': '#13c2c2' },
        javascriptEnabled: true,
      },
    },
  },
  plugins: [
    reactRefresh(),
    vitePluginImp({
      libList: [
        {
          //   libName: "antd",
          //   style: (name) => `antd/lib/${name}/style/index.css`,
          libName: "antd",
          style: (name) => {
            console.log("antd", name);
            return `antd/es/${name}/style`;
          },
        },
      ],
    }),
  ],
});

module.exports = config;
