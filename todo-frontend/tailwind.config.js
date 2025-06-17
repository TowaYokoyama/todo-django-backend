// tailwind.config.js

module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}", // もしExpo Routerを使っている場合
    "./components/**/*.{js,jsx,ts,tsx}" // これから作るコンポーネントフォルダ
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}