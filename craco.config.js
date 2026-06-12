// craco.config.js
function captureAppUse(devServer, setup) {
    const app = devServer.app;
    const originalUse = app.use.bind(app);
    const captured = [];

    app.use = (...args) => {
        const hasPath =
            typeof args[0] === 'string' ||
            args[0] instanceof RegExp ||
            Array.isArray(args[0]);
        const path = hasPath ? args[0] : undefined;
        const handlers = hasPath ? args.slice(1) : args;

        handlers.forEach((middleware) => {
            captured.push(path === undefined ? {middleware} : {path, middleware});
        });

        return app;
    };

    try {
        setup(devServer);
    } finally {
        app.use = originalUse;
    }

    return captured;
}

function adaptReactScriptsDevServerHooks(config) {
    const {
        https,
        onBeforeSetupMiddleware,
        onAfterSetupMiddleware,
        setupMiddlewares,
        ...restConfig
    } = config;
    const nextConfig = {
        ...restConfig,
        server: https ? {type: 'https', options: https} : {type: 'http'},
    };

    if (!onBeforeSetupMiddleware && !onAfterSetupMiddleware) {
        return nextConfig;
    }

    return {
        ...nextConfig,
        setupMiddlewares(middlewares, devServer) {
            let nextMiddlewares = middlewares;

            if (typeof onBeforeSetupMiddleware === 'function') {
                nextMiddlewares = [
                    ...captureAppUse(devServer, onBeforeSetupMiddleware),
                    ...nextMiddlewares,
                ];
            }

            if (typeof setupMiddlewares === 'function') {
                nextMiddlewares = setupMiddlewares(nextMiddlewares, devServer);
            }

            if (typeof onAfterSetupMiddleware === 'function') {
                nextMiddlewares = [
                    ...nextMiddlewares,
                    ...captureAppUse(devServer, onAfterSetupMiddleware),
                ];
            }

            return nextMiddlewares;
        },
    };
}

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
    devServer: adaptReactScriptsDevServerHooks,
}
