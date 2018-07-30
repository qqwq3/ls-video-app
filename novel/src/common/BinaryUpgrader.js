'use strict';

import {
    Alert,
    Platform,
    Linking,
} from 'react-native';
import AppUpdate from 'react-native-appupdate';
import CodePush from 'react-native-code-push';

import { BINARY_VERSION } from "./Keys";
import { checkUpgrade } from "./Api";

export default class BinaryUpgrader {
    check(onStatusChanged, onProgress) {
        onStatusChanged && onStatusChanged(CodePush.SyncStatus.CHECKING_FOR_UPDATE);
        return Platform.OS == 'android' ? this._checkAndroid(onStatusChanged, onProgress) : this._checkiOS(onStatusChanged, onProgress);
    }

    _checkAndroid(onStatusChanged, onProgress) {
        let updateJsonUrl = global.launchSettings && global.launchSettings.agentData && global.launchSettings.agentData.data &&
            global.launchSettings.agentData.data.updateJson;
        if (!updateJsonUrl) {
            // 不需要更新
            onStatusChanged && onStatusChanged(CodePush.SyncStatus.UP_TO_DATE);
        }
        const upgrader = new AppUpdate({
            apkVersionUrl: updateJsonUrl,
            needUpdateApp: (needUpdate) => {
                onStatusChanged && onStatusChanged(CodePush.SyncStatus.AWAITING_USER_ACTION);
                Alert.alert('升级提示', '新版本可用，您想现在升级吗？', [
                    { text: '忽略', onPress: () => { onStatusChanged && onStatusChanged(CodePush.SyncStatus.UPDATE_IGNORED); } },
                    { text: '安装', onPress: () => {
                        needUpdate(true);
                    } },
                ], { cancelable: false });
            },
            forceUpdateApp: () => {
                // 强制更新
            },
            notNeedUpdateApp: () => {
                // 不需要更新
                onStatusChanged && onStatusChanged(CodePush.SyncStatus.UP_TO_DATE);
            },
            downloadApkStart: () => {
                // 下载开始
                onStatusChanged && onStatusChanged(CodePush.SyncStatus.DOWNLOADING_PACKAGE);
            },
            downloadApkProgress: (progress) => {
                onProgress && onProgress(progress);
            },
            downloadApkEnd: () => {
                onStatusChanged && onStatusChanged(CodePush.SyncStatus.INSTALLING_UPDATE);
            },
            onError: () => {
                onStatusChanged && onStatusChanged(CodePush.SyncStatus.UNKNOWN_ERROR);
            }
        });
        return upgrader.checkUpdate();
    }

    async _checkiOS(onStatusChanged, onProgress) {
        onStatusChanged && onStatusChanged(CodePush.SyncStatus.CHECKING_FOR_UPDATE);
        let result = await checkUpgrade('ios');
        if (result && result.code === 0 && result.data.versionName > BINARY_VERSION) {
            onStatusChanged && onStatusChanged(CodePush.SyncStatus.AWAITING_USER_ACTION);
            let buttons = [
                {
                    text: '安装',
                    onPress: () => {
                        Linking.openURL(result.data.downUrl);
                        onStatusChanged(CodePush.SyncStatus.INSTALLING_UPDATE);
                    }
                },
            ];
            if (!result.data.forceUpdate) {
                buttons.splice(0, 0, { text: '忽略', onPress: () => onStatusChanged && onStatusChanged(CodePush.SyncStatus.UPDATE_IGNORED) });
            }

            Alert.alert('升级提示', '新版本可用，您想现在升级吗？', buttons, { cancelable: false });

        } else {
            onStatusChanged && onStatusChanged(CodePush.SyncStatus.UP_TO_DATE);
        }
    }

    static getInstance() {
        return new BinaryUpgrader();
    }

}