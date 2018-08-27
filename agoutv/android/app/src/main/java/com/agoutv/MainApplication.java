package com.agoutv;

import android.app.Application;
import com.facebook.react.ReactApplication;
import com.horcrux.svg.SvgPackage;
import com.ocetnik.timer.BackgroundTimerPackage;
import com.ninty.system.setting.SystemSettingPackage;

import com.example.qiepeipei.react_native_clear_cache.ClearCachePackage;
import im.shimo.react.cookie.CookieManagerPackage;
import com.reactnativecomponent.splashscreen.RCTSplashScreenPackage;
import com.futurepress.staticserver.FPStaticServerPackage;
import com.RNFetchBlob.RNFetchBlobPackage;
import com.rnfs.RNFSPackage;
import com.theweflex.react.WeChatPackage;
import com.brentvatne.react.ReactVideoPackage;
import com.sha256lib.Sha256Package;
import com.github.yamill.orientation.OrientationPackage;
import com.BV.LinearGradient.LinearGradientPackage;
import com.corbt.keepawake.KCKeepAwakePackage;
import com.learnium.RNDeviceInfo.RNDeviceInfo;
import com.microsoft.codepush.react.CodePush;

import com.parryworld.rnappupdate.RNAppUpdatePackage;
import io.wj.rnappmetadata.RNAppMetadataPackage;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.soloader.SoLoader;

import com.agoutv.umeng.DplusReactPackage;
import com.agoutv.umeng.RNUMConfigure;
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
            new SvgPackage(),
            new BackgroundTimerPackage(),
            new SystemSettingPackage(),

            new ClearCachePackage(),
            new CookieManagerPackage(),
            new RCTSplashScreenPackage(),
            new FPStaticServerPackage(),
            new RNFetchBlobPackage(),
            new RNFSPackage(),
            new WeChatPackage(),
            new ReactVideoPackage(),
            new Sha256Package(),
            new OrientationPackage(),
            new LinearGradientPackage(),
            new KCKeepAwakePackage(),
            new RNDeviceInfo(),

            new CodePush(getResources().getString(R.string.reactNativeCodePush_androidDeploymentKey), getApplicationContext(), BuildConfig.DEBUG),
            new RNAppUpdatePackage(),
            new RNAppMetadataPackage(),
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

    // 以下调试需要umenng-social  4个jar包放到app/libs目录下
    // UMConfigure.setLogEnabled(true);

    RNUMConfigure.init(this, UMConfigure.DEVICE_TYPE_PHONE, null);
  }
}
