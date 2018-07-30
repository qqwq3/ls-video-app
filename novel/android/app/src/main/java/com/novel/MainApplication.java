package com.novel;

import android.app.Application;
import android.util.Log;
import com.facebook.react.ReactApplication;
import com.example.qiepeipei.react_native_clear_cache.ClearCachePackage;
import com.ninty.system.setting.SystemSettingPackage;

import com.meituan.android.walle.WalleChannelReader;
import com.microsoft.codepush.react.CodePush;

import com.rnfs.RNFSPackage;
import com.parryworld.rnappupdate.RNAppUpdatePackage;

import im.shimo.react.cookie.CookieManagerPackage;
import com.ocetnik.timer.BackgroundTimerPackage;
import com.theweflex.react.WeChatPackage;
import com.BV.LinearGradient.LinearGradientPackage;
import io.wj.rnappmetadata.RNAppMetadataPackage;
import com.reactnativecomponent.splashscreen.RCTSplashScreenPackage;
import com.learnium.RNDeviceInfo.RNDeviceInfo;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;

import com.umeng.analytics.MobclickAgent;
import com.umeng.analytics.MobclickAgent.EScenarioType;
import com.novel.umeng.DplusReactPackage;
import com.novel.umeng.RNUMConfigure;
import com.umeng.commonsdk.UMConfigure;

import java.util.Arrays;
import java.util.List;

public class MainApplication extends Application implements ReactApplication {

  private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {

        @Override
        protected String getJSBundleFile() {
        return CodePush.getJSBundleFile();
        }
    
    @Override
    public boolean getUseDeveloperSupport() {
      return BuildConfig.DEBUG;
    }

    @Override
    protected List<ReactPackage> getPackages() {
      return Arrays.<ReactPackage>asList(
          new MainReactPackage(),
            new ClearCachePackage(),
            new SystemSettingPackage(),
            new CodePush(null, getApplicationContext(), BuildConfig.DEBUG),
            new RNFSPackage(),
            new RNAppUpdatePackage(),
            new CookieManagerPackage(),
            new BackgroundTimerPackage(),
            new WeChatPackage(),
            new LinearGradientPackage(),
            new RNAppMetadataPackage(),
            new RCTSplashScreenPackage(),
            new RNDeviceInfo(),
            new DplusReactPackage()
      );
    }

    @Override
    protected String getJSMainModuleName() {
      return "index";
    }
  };

  @Override
  public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }

  @Override
  public void onCreate() {
    super.onCreate();
    SoLoader.init(this, /* native exopackage */ false);

    String channel = WalleChannelReader.getChannel(this.getApplicationContext());
    channel = null == channel ? "10" : channel;

    // RN UMeng初始化
    RNUMConfigure.init(this, "5a600a268f4a9d15470008d9", channel, UMConfigure.DEVICE_TYPE_PHONE, "");
  }
}
