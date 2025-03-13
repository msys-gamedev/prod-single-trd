function createUnityInstance(canvas, config, onProgress) {
    function showMessage(type, message) {
        if (type === "error") {
            console.error(message);
        } else if (type === "warning") {
            console.warn(message);
        } else {
            console.log(message);
        }
    }

    function handleError(event) {
        let error = event.reason || event.error || event.message || "Unknown error";
        console.error("Unity WebGL Error: ", error);

        document.body.innerHTML = `
            <div style="text-align: center; padding: 20px; margin-top: 15%;">
                <h2>⚠ Oops! Something went wrong.</h2>
                <p>The game failed to load due to a network or configuration issue.</p>
                <p>Please check your connection and try again.</p>
                <button onclick="location.reload()" style="padding: 10px 20px; font-size: 16px; cursor: pointer;">🔄 Reload Game</button>
            </div>
        `;
    }

    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleError);

    config = config || {};
    let unityConfig = {
        canvas: canvas,
        webglContextAttributes: { preserveDrawingBuffer: false, powerPreference: "high-performance" },
        streamingAssetsUrl: "StreamingAssets",
        deinitializers: [],
        print: console.log,
        printErr: console.error,
        locateFile: (file) => file,
        preRun: [],
        postRun: [],
        errorHandler: handleError,
    };

    Object.assign(unityConfig, config);

    function handleInstantiationError(error) {
        console.error("Failed to instantiate WebGL:", error);

        document.body.innerHTML = `
            <div style="text-align: center; padding: 20px; margin-top: 15%;">
                <h2>🚨 Game Load Failed</h2>
                <p>The WebGL player encountered an issue. It may be a network error or an unsupported browser.</p>
                <p>Make sure you're using a modern browser like Chrome, Edge, or Firefox.</p>
                <button onclick="location.reload()" style="padding: 10px 20px; font-size: 16px; cursor: pointer;">🔄 Retry</button>
            </div>
        `;
    }

    return new Promise((resolve, reject) => {
        if (!unityConfig.canvas.getContext("webgl")) {
            reject("WebGL is not supported in your browser.");
            return;
        }

        fetch(config.frameworkUrl)
            .then(response => {
                if (!response.ok) throw new Error(`Failed to load WebAssembly file: ${config.frameworkUrl}`);
                return response;
            })
            .then(() => instantiateAsync(config))
            .then(unityInstance => {
                resolve(unityInstance);
            })
            .catch(handleInstantiationError);
    });
}
