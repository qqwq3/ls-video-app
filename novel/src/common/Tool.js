
/*工具箱*/

'use strict';

import { Dimensions, PixelRatio, NetInfo, StatusBar, Platform, Animated, Easing } from 'react-native';
import _ from 'loadsh';
import Immutable from 'immutable';
import accounting from 'accounting';
import CodePush from 'react-native-code-push';
import Toast from 'react-native-root-toast';
import SystemSetting from 'react-native-system-setting';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import { HOSTS } from '../common/Api';

// 阅读模式控制
export const setAppBrightness = (value: number) => {
    SystemSetting && SystemSetting.setAppBrightness(value);
};

// 热更新配置
export  function codePushDialogConfig(deploymentKey){

    // console.log(deploymentKey);

    return {
        // 部署key
        // deploymentKey: deploymentKey,
        // 启动模式三种：ON_NEXT_RESUME:当应用从后台返回时、ON_NEXT_RESTART:下一次启动应用时、IMMEDIATE:立即更新
        installMode: CodePush.InstallMode.IMMEDIATE,
        // 升级弹出层
        updateDialog: {
            // 是否显示更新description，默认为false
            appendReleaseDescription: true,
            // 更新说明的前缀。 默认是” Description:
            descriptionPrefix:"更新内容：",
            // 强制更新的按钮文字，默认为continue
            mandatoryContinueButtonLabel:"立即更新",
            // 强制更新时，更新通知
            mandatoryUpdateMessage:"重要更新，请务必安装",
            // 非强制更新时，取消按钮文字,默认是ignore
            optionalIgnoreButtonLabel: '忽略',
            // 非强制更新时，确认文字
            optionalInstallButtonLabel: '更新',
            // 非强制更新时，更新通知
            optionalUpdateMessage: '有新版本了，是否更新？',
            // 要显示的更新通知的标题
            title: '更新提示'
        },
    };
}

// 刷新机制 - 配置
export const RefreshState: Object = {
    Idle: 0,
    HeaderRefreshing: 1,
    FooterRefreshing: 2,
    NoMoreDataFooter: 3,
    NoMoreDataHeader: 4,
    Failure: 5,
};

// 获取设备的密度
export const pixel = PixelRatio.get();

// 获取设备的屏幕 - 宽 - 高 - 分辨率
export const { width, height } = Dimensions.get('window');

// Immutable对象 转换为js
export function toJS(obj: Object) {
    if (_.isEmpty(obj)) {
        return obj;
    }

    if (Immutable.Map.isMap(obj) || Immutable.List.isList(obj)) {
        return obj.toJS();
    }

    return obj;
}

// 获取书的图片
export const loadImage = (books_id: string, prefix: string ='cover', postfix: number = 140, random: boolean = false) => {
    let _url = HOSTS.IMG;
    let PhotoArithmetic = function(input, prefix, postfix, random){
        let id = parseInt(input);

        if (!isNaN(id) && id > 0) {
            let idstr = id.toString();
            // 补位
            let strs = [];
            for (let i = 0; i < 9 - idstr.length; i ++) {
                strs.push('0');
            }

            strs.push(idstr);
            strs = strs.join('');

            let pathes = strs.substring(0, 3) + '/' + strs.substring(3, 6) + '/' + strs.substring(6);
            let url = _url + prefix + '/' + pathes + '.jpg';

            if (postfix) {
                url += '!' + postfix;
            }

            if(random === true){
                url += '?r='+ Math.random();
            }

            return url;
        }
    };

    let id;
    let imageArr = [];

    if(books_id && typeof books_id === 'string'){
        id = books_id.split(",");

        id.map((_id) => {
            let img = PhotoArithmetic(_id, prefix, postfix, random);
            imageArr.push(img);
        });

        return imageArr;
    }

    if(books_id && typeof books_id === 'number'){
        id = books_id;
        let img = PhotoArithmetic(id, prefix, postfix, random);

        return img;
    }
};

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
        return Y + M + D;
    }

    return Y + M + D + h + m + s;
}

// 得到当天的时间( HH : MM )
export function currentDayDate(){
    let now  = new Date();
    // 得到小时
    let hours = now.getHours() < 10 ? ('0' + now.getHours()) : now.getHours();
    // 得到分钟
    let minutes = now.getMinutes() < 10 ? ('0' + now.getMinutes()) : now.getMinutes();

    return hours + ':' + minutes;
}

// 时间比较
export function compareDate(d1, d2) {
    return ((new Date(d1.replace(/-/g,"\/"))) > (new Date(d2.replace(/-/g,"\/"))));
}

// app性能提升 - 打包时销毁 - console等
export function consoleDestroy() {
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

// 公共提示
export const infoToast = (message: string, obj: Object = { duration: 3000, position: verticalScale(-55) }) => {
    return Toast && Toast.show(message, obj);
};

// 关闭公共提示
export const closeInfoToast = (toast) => {
    return Toast && Toast.hide(toast);
};

// 设置状态栏设置
export class statusBarSet{
    static barShow(animationType?: string = 'slide'){
        // animationType('none','fade','slide')
        StatusBar.setHidden(false, animationType);
    }
    static barHide(animationType?: string = 'slide'){
        // animationType('none','fade','slide')
        StatusBar.setHidden(true, animationType);
    }
    static barControl(backgroundColor: string, animated: boolean = true){
        // android
        if(Platform.OS === 'android'){
            StatusBar.setBackgroundColor(backgroundColor, animated);
            StatusBar.setBarStyle('dark-content', animated);
        }

        // ios
        if(Platform.OS === 'ios'){
            StatusBar.setBarStyle('light-content', animated);
        }
    }
}

// 设置状态栏 - a
export const setStatusBar = (
    backgroundColor: string,
    animated: boolean,
    androidContent: string = 'dark-content',
    iosContent: string = 'light-content'
) => {
    if(Platform.OS === 'android'){
        StatusBar.setBackgroundColor(backgroundColor, animated);
        StatusBar.setBarStyle(androidContent, animated);
    }

    if(Platform.OS === 'ios'){
        StatusBar.setBarStyle(iosContent, animated);
    }
};

// 设置状态栏 - b
export const setStatusBarHidden = (status: boolean, animationType: string = 'slide') => {
    // false: show, true: hide
    // animationType('none','fade','slide')
    StatusBar.setHidden(status, animationType);
};


// 数据类型转换
export function dictToFormData(data: any) {
    if (_.isEmpty(data)) {
        return null;
    }
    let fd = new FormData();

    for (let key in data) {
        if (typeof key !== 'undefined') {
            fd.append(key, data[key]);
        }
    }

    return fd;
}

/**
 * 阿拉伯数字上万后转换 - 简单处理
 * @number
 * @returns {number}
 **/
export function numberConversion(num?: string | number): string | number{
    let res: number = 0;
    let n: string = String(num);

    n = n.replace(/\s+/g, "");

    let m = Number(n);
    let _m = Number(n) / Math.pow(10, n.length - 1);

    if(n.length === 4){
        res = accounting.toFixed(_m, 2) + '千';
    }
    else if(n.length === 5){
        res = accounting.toFixed(_m, 2) + '万';
    }
    else if(n.length === 6){
        res = accounting.toFixed(Number(_m) * Math.pow(10, 1), 2) + '万';
    }
    else if(n.length === 7){
        res = accounting.toFixed(Number(_m) * Math.pow(10, 2), 2) + '万';
    }
    else if(n.length === 8){
        res = accounting.toFixed(Number(_m) * Math.pow(10, 3), 2) + '万';
    }
    else if(n.length === 9){
        res = accounting.toFixed(Number(_m) * Math.pow(10, 4), 2) + '万';
    }
    else{
        res = m;
    }

    return res;
}

// timing - 动画
export function AnimatedTiming(startValue, toValue, duration: number = 400, delay: number = 0, easing = Easing.inOut(Easing.ease)){
    return Animated.timing(
        startValue,
        {
            toValue: toValue,
            duration: duration,
            delay: delay,
            easing: easing
        }
    );
}

export function safeError(err): Object {
    if (typeof err === 'string') {
        err = {
            code: 500,
            message: err,
        }
    }
    err.timeUpdated = Date.now();
    return err;
}

export default function parseContent(str, width, cleanEmptyLine = true) {
    if (!str || str == '' || typeof(str) != 'string') {
        return [];
    }
    str = cleanContent(str);
    let lines = [];
    let currentLine = '';
    let currentLineWidth = 0;
    for (let i in str) {
        try {
            let s = str[i];
            let code = s.charCodeAt();

            if (code == 10 || code == 13) {
                if (currentLine.trim() == '' && lines.length > 1 && lines[lines.length - 1].trim() == '') {
                    //过滤空行
                } else {
                    lines.push(currentLine);
                }
                currentLine = '';
                currentLineWidth = 0;
                continue;
            }

            var sWidth = stringWidth(s);
            if (currentLineWidth + sWidth > width) {
                lines.push(currentLine);
                currentLine = '';
                currentLineWidth = 0;
            }

            currentLine += s;
            currentLineWidth += sWidth;
        } catch (error) {
            console.log(error);
        }
    }
    lines.push(currentLine);

    return lines;
}

function cleanContent(str:string){
    let lines = str.split('\n');
    let newlines = [];

    for (var i in lines) {
        let s = lines[i].trim();
        if(s.length>0){
            newlines.push('        '+s);
        }
    }

    return newlines.join('\n\n');
}

export const contentFormat = (
    content: Array<any> = [],
    fontSize: number,
    lineHeight: number,
    surplusHeight: number = moderateScale(80),
    surplusWidth: number = moderateScale(30),
): Array<any> => {
    const _contentArr = [];
    content.map((value, index) => _contentArr[index] = '\u3000\u3000' + value);

    let _content = _contentArr.join('@');
    let fontCount = parseInt(((moderateScale(width) - surplusWidth) / fontSize));
    let fontLines = parseInt((moderateScale(height) - surplusHeight) / lineHeight - 1);
    const length = _content.length;
    let array = [];
    let x = 0, y, m = 0;

    while (x < length) {
        let _array = [];
        for (var i = 0; i <= fontLines; i++) {
            let str = _content.substring(x, x + fontCount);

            if (str.indexOf('@') !== -1) {
                y = x + str.indexOf('@') + 1;
                _array[i] = _content.substring(x, y).replace('@', '');
                x = y;
                continue;
            }
            else {
                y = x + fontCount;
                _array[i] = _content.substring(x, y);
                x = y;
                continue;
            }
        }

        array[m] = _array;
        m++;
    }

    return array;
};

/**
 * 使用循环的方式判断一个元素是否存在于一个数组中
 * @param {Object} arr 数组
 * @param {Object} value 元素值
 */
export function isInArray(arr: Array<any>, value: any): boolean{
    for(let i = 0; i < arr.length; i++){
        if(value === arr[i]){
            return true;
        }
    }

    return false;
}







