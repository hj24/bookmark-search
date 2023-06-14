// craco.config.js
module.exports = {
    style: {
        // why use postcssOptions? -> https://github.com/dilanx/craco/issues/353
        postcssOptions: {
            plugins: [
                require('tailwindcss'),
                require('autoprefixer'),
            ],
        },
    },
}
