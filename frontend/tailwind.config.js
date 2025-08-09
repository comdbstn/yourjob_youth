module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
  safelist: [
    {
      pattern: /text-\[.*\]/, // 동적 폰트 크기 허용
    },
  ],
};
