'use strict';

import {
    Dimensions,
} from 'react-native';
import md5Encryptor from "react-native-md5";
import Immutable from 'immutable';
import {NetInfo} from 'react-native';
import { DEBUG, VERSION } from "../Constants";

const DeviceInfo = require('react-native-device-info');

// 屏幕宽度
export const SCREEN_WIDTH = Dimensions.get('window').width;
// 屏幕高度
export const SCREEN_HEIGHT = Dimensions.get('window').height;

/**
 * 判定给定对象是否为空对象
 * @param obj
 * @returns {boolean}
 */
function isEmptyObject(obj) {
    // 应用为null
    if (obj == null) return true;

    // 包含 length 属性的比较
    if (obj.length && obj.length > 0)    return false;
    if (obj.length === 0)  return true;

    // 包含任意属性检查
    for (let key in obj) {
        if (hasOwnProperty.call(obj, key)) return false;
    }

    return true;
}

/**
 * 计算给定宽高度相对屏幕的高度
 * @param originalWidth
 * @param originalHeight
 */
function relativeHeight(originalWidth, originalHeight, basedWidth = false): number {
    return parseInt(basedWidth || getScreenWidth() * originalHeight / originalWidth);
}

/**
 * 计算给定宽高度的相对屏幕的宽度
 * @param originalWidth
 * @param originalHeight
 * @returns {number}
 */
function relativeWidth(originalWidth, originalHeight, basedHeight = false): number {
    return parseInt(basedHeight || getScreenHeight() * originalWidth / originalHeight);
}

/**
 * 向前补零
 * @param num 返回字符串的总长度
 * @param val 实际的值
 * @returns {string}
 */
function zeroFill(num, val) {
    return (new Array(num).join('0') + val).slice(-num);
}

/**
 * 将给定时间转换为人类友好的格式
 * @param duration
 * @returns {string}
 */
function timeHuman(duration) {
    let hours = parseInt(duration / 3600);
    let minutes = parseInt((duration - hours * 3600) / 60);
    let seconds = parseInt(duration - hours * 3600 - minutes * 60);

    return zeroFill(2, hours) + ':' + zeroFill(2, minutes) + ':' + zeroFill(2, seconds);
}

function numHuman(num) {
    if (!num) return 0;
    let number = num;
    let units = ['', '万', '亿'];
    let uIndex = 0;

    while (uIndex >= units.length || number >= 10000) {
        number /= 10000;
        uIndex++;
    }

    number = number.toFixed(1);
    if (number.toString().endsWith('.0')) {
        number = parseInt(number);
    }

    return number + units[uIndex];
}

function sizeHuman(size) {
    if (isNaN(size)) return 0;
    let units = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB',];
    let index = 0;

    while (size > 1024) {
        index ++;
        size /= 1024;
    }
    return size.toFixed(1) + units[index];
}

function getScreenSize() {
    const win = Dimensions.get('window');
    return {
        width: win.width,
        height: win.height,
    };
}

function getScreenWidth() {
    return getScreenSize().width;
}

function getScreenHeight() {
    return getScreenSize().height;
}

function dictToQueryString(data, prefix = '') {
    let fd = dictToFormData(data);
    if (fd) {
        let values = [];

        for (let pair of fd._parts) {
            values.push(pair[0] + '=' + pair[1]);
        }

        return prefix + values.join('&');
    }
    return '';
}

function dictToFormData(data) {
    if (isEmptyObject(data)) {
        return null;
    }
    let fd = new FormData();
    for (let key in data) {
        if (typeof key !== 'undefined' && typeof data[key] != 'undefined') {
            fd.append(key, data[key]);
        }
    }
    return fd;
}

function parseParam(param){
    if (isEmptyObject(param)) {
        return null;
    }
    let paramStr = '';
    for (let key in param) {
        if (typeof key !== 'undefined') {
            paramStr+="&"+key+"="+encodeURIComponent(param[key]);
        }
    }
    return paramStr.substr(1);
}

function md5(src) {
    return src && md5Encryptor.hex_md5(src);
}

const EMAIL_RE = /^[a-zA-Z0-9_\-]+@[a-zA-Z0-9_\-]+(\.[a-zA-Z0-9_\-]+)+$/;
function isEmail(src) {
    return EMAIL_RE.test(src);
}

function timeout(ms: number): Promise {
    return new Promise((resolve, reject) => {
        setTimeout(() => reject({message: { code: 504, message: '请求超时了，请过一会儿再试' }}), ms);
    });
}

function safeError(err): Object {
    if (typeof err === 'string') {
        err = {
            code: 500,
            message: err,
        }
    }
    err.id = Date.now();
    return err;
}

function getObjectKeys(obj: Object, sep: string = null): Array {
    let keys = [];
    for (let key in obj) {
        keys.push(key);
    }
    return sep ? keys.join(sep) : keys;
}

function toJS(obj: Object) {
    if (isEmptyObject(obj)) {
        return obj;
    }
    if (Immutable.Map.isMap(obj) || Immutable.List.isList(obj)) {
        return obj.toJS();
    }

    return obj;
}

function log() {
    if (DEBUG) {
        console.log(arguments);
    }
}

async function makeUserAgent() {
    let info = await NetInfo.getConnectionInfo();
    // ur'\(Linux; (?P<sys>Android|iOS) (?P<sys_ver>\d+\.\d+(?:\.\d+)*); (?P<mobile>[^)]+)\) GoApp/(?P<app_ver>\d+\.\d+) NetType/(?P<net_type>\w+) Language/(?P<lang>zh_CN)
    return '(Linux; ' +
        DeviceInfo.getSystemName() + ' ' + DeviceInfo.getSystemVersion() + '; ' +
        DeviceInfo.getModel() + ') GoApp/' + VERSION + ' NetType/' + info.type + ' Language/zh_CN)';
};

function getDeviceInfo() {
    return {
        uniqueID: DeviceInfo.getUniqueID(),
        manufacturer: DeviceInfo.getManufacturer(),
        brand: DeviceInfo.getBrand(),
        model: DeviceInfo.getModel(),
        deviceId: DeviceInfo.getDeviceId(),
        systemName: DeviceInfo.getSystemName(),
        systemVersion: DeviceInfo.getSystemVersion(),
    };
};

function tsToDateFormat(ts: number, fmt: string = 'yyyy-MM-dd hh:mm:ss'): string {
    if (ts.toString().length === 10) {
        ts *= 1000;
    }
    return new Date(ts).format(fmt);
};

// 对Date的扩展，将 Date 转化为指定格式的String
// 月(M)、日(d)、小时(h)、分(m)、秒(s)、季度(q) 可以用 1-2 个占位符，
// 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字)
// 例子：
// (new Date()).format("yyyy-MM-dd hh:mm:ss.S") ==> 2006-07-02 08:09:04.423
// (new Date()).format("yyyy-M-d h:m:s.S")      ==> 2006-7-2 8:9:4.18
Date.prototype.format = function (fmt) { //author: meizz
    let o = {
        "M+": this.getMonth() + 1, //月份
        "d+": this.getDate(), //日
        "h+": this.getHours(), //小时
        "m+": this.getMinutes(), //分
        "s+": this.getSeconds(), //秒
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度
        "S": this.getMilliseconds() //毫秒
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (let k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
};


module.exports = {
    isEmptyObject,
    relativeHeight,
    relativeWidth,
    getScreenWidth,
    getScreenHeight,
    getScreenSize,
    dictToQueryString,

    SCREEN_HEIGHT,
    SCREEN_WIDTH,

    zeroFill,
    timeHuman,
    md5,
    dictToFormData,
    parseParam,
    isEmail,
    timeout,
    safeError,
    getObjectKeys,
    numHuman,
    sizeHuman,

    toJS,
    log,
    makeUserAgent,
    getDeviceInfo,
    tsToDateFormat,
};