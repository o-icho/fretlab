package com.fretlab.app;

import android.Manifest;
import android.content.pm.PackageManager;
import android.content.pm.ApplicationInfo;
import android.os.Bundle;
import android.util.Log;
import android.webkit.PermissionRequest;
import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.core.content.ContextCompat;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.BridgeWebChromeClient;

public class MainActivity extends BridgeActivity {
    private PermissionRequest pendingAudio;
    private final ActivityResultLauncher<String> audioPermission = registerForActivityResult(
        new ActivityResultContracts.RequestPermission(), granted -> {
            logAudio("permission result: " + (granted ? "granted" : "denied"));
            PermissionRequest request = pendingAudio;
            pendingAudio = null;
            if (request == null) return;
            if (granted) request.grant(new String[] { PermissionRequest.RESOURCE_AUDIO_CAPTURE });
            else request.deny();
        }
    );

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        getBridge().getWebView().setWebViewClient(new StaticExportWebViewClient(getBridge()));
        // Preserve Capacitor dialogs and WebView behavior, but request RECORD_AUDIO only.
        // This callback runs only when getUserMedia is invoked by the tuner button.
        getBridge().getWebView().setWebChromeClient(new BridgeWebChromeClient(getBridge()) {
            @Override
            public void onPermissionRequest(PermissionRequest request) {
                runOnUiThread(() -> handleAudioRequest(request));
            }

            @Override
            public void onPermissionRequestCanceled(PermissionRequest request) {
                logAudio("permission-handler: request cancelled by WebView");
                if (pendingAudio == request) pendingAudio = null;
            }
        });
    }

    private void handleAudioRequest(PermissionRequest request) {
        logAudio("permission-handler: audio request received");
        String[] resources = request.getResources();
        boolean localOrigin = "https".equals(request.getOrigin().getScheme())
            && "localhost".equals(request.getOrigin().getHost());
        if (!localOrigin || resources.length != 1
            || !PermissionRequest.RESOURCE_AUDIO_CAPTURE.equals(resources[0])
            || pendingAudio != null) {
            logAudio("permission-handler: request denied (origin/resources/concurrent request)");
            request.deny();
            return;
        }
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.RECORD_AUDIO)
            == PackageManager.PERMISSION_GRANTED) {
            logAudio("permission-handler: existing RECORD_AUDIO permission granted to WebView");
            request.grant(new String[] { PermissionRequest.RESOURCE_AUDIO_CAPTURE });
        } else {
            pendingAudio = request;
            logAudio("permission-handler: requesting RECORD_AUDIO dialog");
            audioPermission.launch(Manifest.permission.RECORD_AUDIO);
        }
    }

    private void logAudio(String event) {
        if ((getApplicationInfo().flags & ApplicationInfo.FLAG_DEBUGGABLE) != 0) {
            Log.i("TUNER", event);
        }
    }

    @Override
    public void onDestroy() {
        if (pendingAudio != null) {
            logAudio("permission-handler: activity destroyed, pending request denied");
            pendingAudio.deny();
            pendingAudio = null;
        }
        super.onDestroy();
    }
}
