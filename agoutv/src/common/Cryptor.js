'use strict';

const util = require('./Util');
const CryptoJS = require('crypto-js');

const block_size = 16;

/**
 * 填充函数
 * @param text 要填充的文本
 * @returns {string}
 */
const pad = (text: string): string => {
    if (text.length % block_size == 0) {
        return text;
    }
    return text + Array(block_size - text.length % block_size + 1).join(String.fromCharCode(block_size - text.length % block_size));
};

/**
 * 生成给定长度的随机字符串
 * @param len 长度
 * @returns {string}
 */
const randomString = (len: number): string => {
    if (!len) {
        return '';
    }
    let $chars = 'ABCDEFGHJKLMNOPQRSTUVWXYZabcdefhijklmnoprstuvwxyz123456789';
    let maxPos = $chars.length;
    let pwd = '';
    for (let i = 0; i < len; i++) {
        pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
    }
    return pwd;
};

/**
 * 加密函数
 * @param msgString 加密内容
 * @param key 机密key
 * @returns {string}
 */
export const encrypt = (msgString, key) => {
    key = CryptoJS.enc.Utf8.parse(key);
    // msgString is expected to be Utf8 encoded
    let iv = CryptoJS.lib.WordArray.random(block_size);
    let encrypted = CryptoJS.AES.encrypt(msgString, key, {
        iv: iv,
        mode: CryptoJS.mode.CBC
    });
    return iv.concat(encrypted.ciphertext).toString(CryptoJS.enc.Base64);
};

/**
 *  解密给定内容
 * @param ciphertextStr
 * @param key
 * @returns {string}
 */
export const decrypt = (ciphertextStr, key) => {
    key = CryptoJS.enc.Utf8.parse(key);
    let ciphertext = CryptoJS.enc.Base64.parse(ciphertextStr);

    // split IV and ciphertext
    let iv = ciphertext.clone();
    iv.sigBytes = block_size;
    iv.clamp();
    ciphertext.words.splice(0, 4); // delete 4 words = 16 bytes
    ciphertext.sigBytes -= block_size;

    // decryption
    let decrypted = CryptoJS.AES.decrypt({ ciphertext: ciphertext}, key, {
        iv: iv,
        mode: CryptoJS.mode.CBC
    });
    return decrypted.toString(CryptoJS.enc.Utf8);
};

/**
 * 给定字符串中随机抽样出给定长度的字符
 * @param text 被抽样字符串
 * @param len  要提取字符数
 * @returns {Array}
 */
const range_sample = (text, len) => {
    let nums = [];
    while (nums.length < len) {
        var n = parseInt((Math.random() * 100000) % text.length);
        if (nums.indexOf(n) == -1) {
            nums.push(n);
        }
    }
    return nums;
};

/**
 * 字符串前面补零
 * @param str 要补零的字符串
 * @param length 补零后字符串中长度
 * @returns {string}
 */
const addZero = (str,length) => {
    return new Array(length - str.length + 1).join("0") + str;
};

/**
 * 时钟同步加密
 * @param text 要加密文本
 * @param key 加密key
 * @param timeDelta 与服务器的时间差
 * @returns {*}
 */
export const clockSyncEncrypt = async (text, key, timeDelta: number = undefined) => {
    if (!key) return {key:'',skey:''};
    let d = new Date();
    let t = d.getTime();

    timeDelta = timeDelta || (launchSettings && launchSettings.deltaSeconds) || 0;
    d.setTime(t + timeDelta * 1000);
    d.getSeconds() >= 30 ? d.setSeconds(30) : d.setSeconds(0);

    let ts = Math.floor(d.getTime() / 1000);
    // console.log('ts', ts);
    let pos = ts % block_size;
    let aesKey = pad(key.substr(pos, block_size));
    // console.log('aesKey', aesKey);
    let encrypted = encrypt(text + ':' + CryptoJS.MD5(await util.makeUserAgent()), aesKey);
    let range = range_sample(encrypted, 5);
    // console.log(range);
    let vls = [];
    for (let i = 0; i < range.length; i ++) {
        let line = [];
        line.push(addZero(range[i].toString(), 4));
        line.push(randomString(range[i]));
        line.push(encrypted[range[i]]);

        line = line.join('');
        if (line.length != line.trim().length) {
            console.log('含空格', line);
        }
        vls.push(line.trim());
    }
    return {
        key: encrypted,
        skey: vls.join(''),
        time: parseInt(d.getTime()/1000),
    };
};

/**
 * 生成 UUID v5
 * @param str
 * @returns {string}
 */
export const uuid5 = (str) => {
    let out = CryptoJS.SHA1(str);

    out[8] = out[8] & 0x3f | 0xa0;
    out[6] = out[6] & 0x0f | 0x50;

    let hex = out.toString(CryptoJS.enc.Hex);

    return [
        hex.substring(0, 8),
        hex.substring(8, 12),
        hex.substring(12, 16),
        hex.substring(16, 20),
        hex.substring(20, 32)
    ].join('-');
};