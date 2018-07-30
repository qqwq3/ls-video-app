
'use strict';

import { NetInfo } from 'react-native';
import * as DeviceInfo from 'react-native-device-info';

// 判定用户是否登录
export const isLogin = (props: Object = {}): boolean => {
    const { userData } = props;

    if(!userData){
        return false;
    }

    if(userData){
        if(!userData.baseInfo){
            return false;
        }

        if(userData.baseInfo && userData.baseInfo.login){
            return true;
        }

        if(userData.baseInfo && !userData.baseInfo.login){
            return false;
        }
    }
};

// 拿到用户基本信息
export const userInfo = (props:  Object = {}) => {
    const { userData } = props;
    const baseInfo =  userData ? userData.baseInfo : false;
    const data = baseInfo ? baseInfo.data : false;

    return data;
};

// 设置user-agent
export async function makeUserAgent() {
    const info = await NetInfo.getConnectionInfo();

    return '(Linux; ' +
        DeviceInfo.getSystemName() + ' ' + DeviceInfo.getSystemVersion() + '; ' +
        DeviceInfo.getModel() + ') GoApp/' + DeviceInfo.getVersion() + ' NetType/' + info.type + ' Language/zh_CN)';
}













