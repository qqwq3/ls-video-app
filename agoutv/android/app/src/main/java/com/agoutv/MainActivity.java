package com.agoutv;

import com.facebook.react.ReactActivity;
import android.os.Bundle;
import android.content.Intent; // <--- import
import android.content.res.Configuration; // <--- import
import com.umeng.analytics.MobclickAgent;
import com.umeng.analytics.MobclickAgent.EScenarioType;

import com.reactnativecomponent.splashscreen.RCTSplashScreen;    //import RCTSplashScreen

public class MainActivity extends ReactActivity {
    /**
     * Returns the name of the main component registered from JavaScript.
     * This is used to schedule rendering of the component.
     */
    @Override
    protected String getMainComponentName() {
        return "agoutv";
    }

    @Override
    public void onConfigurationChanged(Configuration newConfig) {
        super.onConfigurationChanged(newConfig);
        Intent intent = new Intent("onConfigurationChanged");
        intent.putExtra("newConfig", newConfig);
        this.sendBroadcast(intent);
    }

    @Override
    public void onResume() {
        super.onResume();
        MobclickAgent.onResume(this);
    }

    @Override
    public void onPause() {
        super.onPause();
        MobclickAgent.onPause(this);
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {

        RCTSplashScreen.openSplashScreen(this);   //open splashscreen
        //RCTSplashScreen.openSplashScreen(this, true, ImageView.ScaleType.FIT_XY);   //open splashscreen fullscreen

        super.onCreate(savedInstanceState);
        MobclickAgent.setSessionContinueMillis(30000);
        MobclickAgent.setScenarioType(this, EScenarioType.E_DUM_NORMAL);
    }
}
