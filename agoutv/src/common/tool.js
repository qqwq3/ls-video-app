
'use strict';

import { Dimensions, PixelRatio, NetInfo, StatusBar, Platform } from 'react-native';
import RNFetchBlob from 'react-native-fetch-blob';
import accounting from 'accounting';
import _ from 'lodash';

// 获取设备的密度
export const pixel = PixelRatio.get();

// 获取设备的屏幕 - 宽 - 高 - 分辨率
export const {width, height} = Dimensions.get('window');

// 播放类型返回的字段
export function playText(type: number){
    let text = '';

    switch (type){
        // 电影
        case 1: text = '电影';
            break;
        // 电视剧
        case 2: text = '电视剧';
            break;
        // 动漫
        case 5: text = '动漫';
            break;
        // 综艺
        case 4: text = '综艺';
            break;
        // 小视频
        case 6: text = '小视频';
            break;
        // 其他
        case 10: text = '其他';
            break;
    }

    return text;
}

/**
 * 阿拉伯数字上万后转换 - 简单处理
 * @number
 * @returns {number}
 **/
export function numberConversion(nums?: any){
    let res;
    let n = String(nums);
    let m = Number(nums);

    if(n.length >= 5){
        res = (m / Math.pow(10,4)).toFixed(2) + '万';
    }
    else{
        res = m;
    }

    return res;
}

// 时间戳转换为时间 - 影视时间
export function toHHMMSS(timeStamp: string | number){
    let numberTimeStamp = Number(timeStamp);
    let sec_num = parseInt(numberTimeStamp, 10);
    let hours   = Math.floor(sec_num / 3600);
    let minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    let seconds = sec_num - (hours * 3600) - (minutes * 60);

    if (hours   < 10) {hours   = "0"+hours;}
    if (minutes < 10) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}
    return hours+':'+minutes+':'+seconds;
}

// 时间戳转换为 - 日期时间
export function timestampToTime(timestamp: number | string, showTime: boolean = false): string{
    let date = new Date(Number(timestamp) * 1000),
        Y = date.getFullYear()  + '-',
        M = (date.getMonth()+1  < 10 ? ('0' + (date.getMonth()+1)) : date.getMonth()+1)   + '-',
        D = (date.getDate()     < 10 ? ('0' + date.getDate())      : date.getDate())      + ' ',
        h = (date.getHours()    < 10 ? ('0' + date.getHours())     : date.getHours())     + ':',
        m = (date.getMinutes()  < 10 ? ('0' + date.getMinutes())   : date.getMinutes())   + ':',
        s = (date.getSeconds()  < 10 ? ('0' + date.getSeconds())   : date.getSeconds());

    if(!showTime){
        return Y+M+D;
    }

    return Y+M+D+h+m+s;
}

// app性能提升
export function AppPerformanceImprovement(){
    if (!__DEV__) {
        global.console = {
            info    :   () => {},
            log     :   () => {},
            warn    :   () => {},
            debug   :   () => {},
            error   :   () => {},
        };
    }
}

// 监听当前设备的网络状态
export const netInfoAddEventListener = (tag: string,handler: Function) => {
    NetInfo.isConnected.addEventListener(tag,handler);
};

// 删除当前设置的网络状态
export const netInfoRemoveEventListener = (tag: string,handler: Function) => {
    NetInfo.isConnected.removeEventListener(tag,handler);
};

// 获取当前设备网络信息
export const getCurrentNetInfo = (callback: Function) => {
    NetInfo.getConnectionInfo().then(connectionInfo => {
        callback && typeof callback === 'function' && callback(connectionInfo);
    });
};

// 检查网络链接状态
export const checkNetworkState = (callback: Function) =>{
    NetInfo.isConnected.fetch().done(isConnected => {
        callback && typeof callback === 'function' && callback(isConnected);
    });
};

// 获取视频流的尺寸
export const videoStreamSize = (url: string, type: string = 'GET', callback: Function) => {
    if(url){
        RNFetchBlob.fetch(type, url)
        .stateChange(size => {
            let contentLength = size.headers['Content-Length'];
            let contentLengthNumber = Number(contentLength);
            let mb: number = contentLengthNumber / (1024 * 1024);
            let MB =  mb.toFixed(1);
            callback && typeof callback === 'function' && callback(MB);
        })
        .catch(err => {
            console.log('videoStreamSize',err);
        });
    }
};


// 处理money
export const money = (value: string | number,decimal?: number = 2): string | number => {
    let v = Number(value) / 100;
    return accounting.formatNumber(v, decimal, "");
};

// 补零
export const zeroPadding = (value: number | string): string => {
    const v: number = Number(value);
    let m: string = 0;

    if(v < 10 && v > 0){
        m = '0' + v;
    }
    else {
        m = v;
    }

    return m;
};

// 公共设置状态栏 - 方法
export const statusBarSetPublic = (backgroundColor: string, charType: string, animated: boolean = true) => {
    // android
    if(Platform.OS === 'android'){
        StatusBar.setBackgroundColor(backgroundColor,animated);
        StatusBar.setBarStyle(charType,animated);
    }

    // ios
    if(Platform.OS === 'ios'){

    }
};

// 数组里的数字排序
export const compare = (x, y) => {
    const X: number = Number(x);
    const Y: number = Number(y);

    if (X < Y) {
        return -1;
    }
    else if (X > Y) {
        return 1;
    }
    else {
        return 0;
    }
};


// 检测视频来源
export const checkVideoSource = (value: number | string): string => {
    let text: string = '';

    if(value === null){
        return text;
    }

    let v  = ((value: number | string) : number);

    switch (v){
        case 1: text = '优酷';
            break;
        case 2: text = '芒果';
            break;
        case 3: text = '乐视';
            break;
        case 4: text = '华数';
            break;
        case 5: text = '看看';
            break;
        case 6: text = '搜狐';
            break;
        case 7: text = 'PPTV';
            break;
        case 8: text = '风行';
            break;
        case 9: text = 'B站';
            break;
        case 10: text = '咪咕';
            break;
        case 11: text = '西瓜';
            break;
        case 12: text = '爱奇艺';
            break;
        case 14: text = '爱美剧';
            break;
        case 100: text = '梨视频';
            break;
    }

    return text;
};


// 判断数组里的值是否全为0
export function ArrValueStatus(arr: Array<any> = []) {
    let status: boolean = false;
    const newArr: Array =  _.compact(arr);

    if(newArr.length === 0){
        status = false;
    }
    else{
        status = true;
    }

    return status;
}


// 判定用户是否登录
export const isLogout = (props: Object = {}): boolean => {
    const { userData } = props;

    if(userData && !userData.login || !userData){
        return true;
    }

    return false;
};






