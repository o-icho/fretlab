package com.fretlab.app;

import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebView;
import com.getcapacitor.Bridge;
import com.getcapacitor.BridgeWebViewClient;
import java.io.IOException;
import java.io.InputStream;
import java.util.Collections;

/** Serve Next's per-route HTML instead of Capacitor's single-page index fallback. */
public class StaticExportWebViewClient extends BridgeWebViewClient {
    private final Bridge bridge;

    public StaticExportWebViewClient(Bridge bridge) {
        super(bridge);
        this.bridge = bridge;
    }

    @Override
    public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
        String path = request.getUrl().getPath();
        boolean local = "https".equals(request.getUrl().getScheme())
            && "localhost".equals(request.getUrl().getHost());
        if (!local || !request.isForMainFrame() || !"GET".equals(request.getMethod())
            || path == null || !path.matches("/[a-z0-9/-]*")) {
            return super.shouldInterceptRequest(view, request);
        }
        String filename = "public" + path + (path.endsWith("/") ? "" : "/") + "index.html";
        InputStream stream;
        int status = 200;
        try {
            stream = bridge.getContext().getAssets().open(filename);
        } catch (IOException missingRoute) {
            try {
                stream = bridge.getContext().getAssets().open("public/404.html");
                status = 404;
            } catch (IOException missingExport) {
                return super.shouldInterceptRequest(view, request);
            }
        }
        // Keep Capacitor's native bridge available even in freshly loaded article/tool documents.
        stream = bridge.getLocalServer().getJavaScriptInjectedStream(stream);
        return new WebResourceResponse("text/html", "UTF-8", status,
            status == 200 ? "OK" : "Not Found", Collections.emptyMap(), stream);
    }
}
