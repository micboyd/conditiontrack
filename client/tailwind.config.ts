module.exports = {
  theme: {
    extend: {
      keyframes: {
        loader: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        loader: 'loader 2s linear infinite',
      },
    },
  },
};
