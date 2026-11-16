package com.kettlehell.launcher;

import android.app.Activity;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.provider.Browser;

/** Opens the Kettle Hell artifact in Chrome (reusing the same tab), then closes. */
public class MainActivity extends Activity {
    private static final String URL = "https://claude.ai/artifact/RKwRxQPQ2Tg4FXXDaTWJsK";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        Intent i = new Intent(Intent.ACTION_VIEW, Uri.parse(URL));
        i.addCategory(Intent.CATEGORY_BROWSABLE);
        // Chrome reuses one tab for all launches carrying the same app id.
        i.putExtra(Browser.EXTRA_APPLICATION_ID, getPackageName());
        i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        i.setPackage("com.android.chrome");
        try {
            startActivity(i);
        } catch (ActivityNotFoundException e) {
            i.setPackage(null);
            try { startActivity(i); } catch (ActivityNotFoundException ignored) { }
        }
        finish();
    }
}
