package com.kettlehell.launcher;

import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;
import android.os.Bundle;
import android.speech.tts.TextToSpeech;
import android.view.WindowManager;
import android.webkit.CookieManager;
import android.webkit.JavascriptInterface;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import androidx.webkit.WebViewCompat;
import androidx.webkit.WebViewFeature;

import java.util.Collections;
import java.util.HashSet;
import java.util.Locale;

/**
 * Full-screen Kettle Hell: shows the claude.ai artifact without Chrome's address bar
 * and with Claude's own header hidden. The app itself still lives in the artifact,
 * so it updates whenever the artifact does.
 */
public class MainActivity extends Activity {
    private static final String URL = "https://claude.ai/artifact/RKwRxQPQ2Tg4FXXDaTWJsK";
    private static final int PICK_FILE = 1;

    /** Runs in every frame before the page's own scripts. */
    private static final String START_JS =
        "(function(){try{" +
        // 1) Hide Claude's header bar on the outer claude.ai page.
        "if(location.hostname==='claude.ai'){" +
        "  var d=document.documentElement;" +
        "  var hide=function(){if(!d.hasAttribute('data-header-hidden'))d.setAttribute('data-header-hidden','');};" +
        "  hide();" +
        "  new MutationObserver(hide).observe(d,{attributes:true,attributeFilter:['data-header-hidden']});" +
        "}" +
        // 2) Speak through Android's voice (WebView has no working speechSynthesis).
        "if(window.KHVoice){" +
        "  var U=function(t){this.text=t||'';this.rate=1;this.pitch=1;this.volume=1;this.lang='';this.voice=null;this._l={};};" +
        "  U.prototype.addEventListener=function(n,f){(this._l[n]=this._l[n]||[]).push(f);};" +
        "  U.prototype.removeEventListener=function(n,f){var a=this._l[n]||[];var i=a.indexOf(f);if(i>=0)a.splice(i,1);};" +
        "  U.prototype._fire=function(n){var e={type:n,utterance:this,target:this};try{if(this['on'+n])this['on'+n](e);}catch(x){}(this._l[n]||[]).forEach(function(f){try{f(e);}catch(x){}});};" +
        "  var S={speaking:false,pending:false,paused:false,onvoiceschanged:null,_t:null,_u:null," +
        "    speak:function(u){var s=this;s.cancel();s._u=u;s.speaking=true;" +
        "      window.KHVoice.speak(String(u.text||''),+u.rate||1,+u.pitch||1,String(u.lang||''));" +
        "      setTimeout(function(){u._fire('start');},0);" +
        "      var ms=Math.max(600,String(u.text||'').length*75/(+u.rate||1));" +
        "      s._t=setTimeout(function(){s.speaking=false;s._u=null;u._fire('end');},ms);}," +
        "    cancel:function(){if(this._t){clearTimeout(this._t);this._t=null;}window.KHVoice.stop();" +
        "      var u=this._u;this._u=null;this.speaking=false;if(u)u._fire('end');}," +
        "    pause:function(){},resume:function(){},getVoices:function(){return [];}," +
        "    addEventListener:function(){},removeEventListener:function(){}};" +
        "  try{Object.defineProperty(window,'speechSynthesis',{value:S,configurable:true});}catch(x){window.speechSynthesis=S;}" +
        "  try{Object.defineProperty(window,'SpeechSynthesisUtterance',{value:U,configurable:true,writable:true});}catch(x){window.SpeechSynthesisUtterance=U;}" +
        "}" +
        "}catch(e){}})();";

    private WebView web;
    private TextToSpeech tts;
    private ValueCallback<Uri[]> fileCallback;

    @SuppressLint({"SetJavaScriptEnabled", "AddJavascriptInterface"})
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);

        tts = new TextToSpeech(this, status -> {
            if (status == TextToSpeech.SUCCESS) tts.setLanguage(Locale.getDefault());
        });

        web = new WebView(this);
        web.setBackgroundColor(Color.parseColor("#141719"));
        setContentView(web);

        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setSupportMultipleWindows(false);
        s.setJavaScriptCanOpenWindowsAutomatically(true);
        // Look like normal Chrome so sign-in pages don't refuse an in-app browser.
        s.setUserAgentString(s.getUserAgentString().replace("; wv)", ")").replaceAll(" Version/\\d+\\.\\d+", ""));

        CookieManager cm = CookieManager.getInstance();
        cm.setAcceptCookie(true);
        cm.setAcceptThirdPartyCookies(web, true);

        web.addJavascriptInterface(new Voice(), "KHVoice");
        if (WebViewFeature.isFeatureSupported(WebViewFeature.DOCUMENT_START_SCRIPT)) {
            WebViewCompat.addDocumentStartJavaScript(web, START_JS, new HashSet<>(Collections.singletonList("*")));
        }

        web.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest req) {
                Uri u = req.getUrl();
                String scheme = u.getScheme();
                if ("http".equals(scheme) || "https".equals(scheme)) {
                    String host = u.getHost() == null ? "" : u.getHost();
                    // Videos and other outside links open in their own app or browser.
                    if (host.contains("youtube.com") || host.equals("youtu.be")) return openOutside(u);
                    return false;
                }
                return openOutside(u);
            }

            @Override
            public void onPageStarted(WebView view, String url, android.graphics.Bitmap favicon) {
                if (!WebViewFeature.isFeatureSupported(WebViewFeature.DOCUMENT_START_SCRIPT)) {
                    view.evaluateJavascript(START_JS, null);
                }
            }

            @Override
            public void onPageFinished(WebView view, String url) {
                cm.flush();
                if (!WebViewFeature.isFeatureSupported(WebViewFeature.DOCUMENT_START_SCRIPT)) {
                    view.evaluateJavascript(START_JS, null);
                }
            }
        });

        web.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onShowFileChooser(WebView v, ValueCallback<Uri[]> cb, FileChooserParams params) {
                if (fileCallback != null) fileCallback.onReceiveValue(null);
                fileCallback = cb;
                try {
                    startActivityForResult(params.createIntent(), PICK_FILE);
                } catch (ActivityNotFoundException e) {
                    fileCallback = null;
                    return false;
                }
                return true;
            }
        });

        if (savedInstanceState != null) web.restoreState(savedInstanceState);
        else web.loadUrl(URL);
    }

    private boolean openOutside(Uri u) {
        try {
            startActivity(new Intent(Intent.ACTION_VIEW, u).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK));
        } catch (ActivityNotFoundException ignored) { }
        return true;
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == PICK_FILE && fileCallback != null) {
            fileCallback.onReceiveValue(WebChromeClient.FileChooserParams.parseResult(resultCode, data));
            fileCallback = null;
        }
    }

    @Override
    protected void onSaveInstanceState(Bundle out) {
        super.onSaveInstanceState(out);
        web.saveState(out);
    }

    @Override
    public void onBackPressed() {
        if (web.canGoBack()) web.goBack();
        else moveTaskToBack(true);
    }

    @Override
    protected void onPause() {
        super.onPause();
        CookieManager.getInstance().flush();
    }

    @Override
    protected void onDestroy() {
        if (tts != null) tts.shutdown();
        web.destroy();
        super.onDestroy();
    }

    /** Lets the page speak workout cues with the phone's voice. */
    private class Voice {
        @JavascriptInterface
        public void speak(String text, float rate, float pitch, String lang) {
            if (tts == null) return;
            if (lang != null && !lang.isEmpty()) tts.setLanguage(Locale.forLanguageTag(lang));
            tts.setSpeechRate(rate);
            tts.setPitch(pitch);
            tts.speak(text, TextToSpeech.QUEUE_FLUSH, null, "kh");
        }

        @JavascriptInterface
        public void stop() {
            if (tts != null) tts.stop();
        }
    }
}
