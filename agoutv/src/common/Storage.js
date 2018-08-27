'use strict';

import {
    WATCHING_HISTORY,
    MAX_WATCHING_HISTORY,
    USER_SESSION,
    MAX_SEARCH_HISTORY,
    SEARCH_HISTORY,
    SUBSCRIBE_SESSION,
    CURRENT_VERSION
} from '../Constants';

/**
 * 记录搜索历史
 * @param word
 */
export const saveSearchHistory = async (word: string) => {
    if (word) {
        let words = await loadSearchHistory();
        if (!Array.isArray(words)) {
            words = [];
        }
        // 保持数量
        while (words.length >= MAX_SEARCH_HISTORY) {
            words.pop();
        }
        if (words.indexOf(word) > -1) {
            words.splice(words.indexOf(word), 1);
        }
        words.splice(0, 0, word);
        storage.save({ key: SEARCH_HISTORY, data: words });
    }
};

/**
 * 读取搜索历史
 * @returns {Promise.<*>}
 */
export const loadSearchHistory = async () => {
    try {
        return await storage.load({ key: SEARCH_HISTORY });
    } catch (err) {
        return [];
    }
};

// 删除搜索历史记录
export const removeSearchHisory = async () => {
    return await storage.remove({ key: SEARCH_HISTORY });
};


/**
 * 记录观看历史
 * @param word
 */
export const saveWatchingHistory = async (word: string) => {
    if (word) {
        let words = await loadWatchingHistory();
        if (!Array.isArray(words)) {
            words = [];
        }
        // 保持数量
        while (words.length >= MAX_WATCHING_HISTORY) {
            words.pop();
        }
        if (words.indexOf(word) > -1) {
            words.splice(words.indexOf(word), 1);
        }
        words.splice(0, 0, word);
        storage.save({ key: WATCHING_HISTORY, data: words });
    }
};

/**
 * 读取观看历史
 * @returns {Promise.<*>}
 */
export const loadWatchingHistory = async () => {
    try {
        return await storage.load({ key: WATCHING_HISTORY });
    } catch (err) {
        return [];
    }
};

/**
 * 读取用户会话
 * @returns {Promise.<{authorizedKey: boolean, email: boolean, id: number, name: boolean}>}
 */

export const loadUserSession = async () => {
    try {
        return await storage.load({ key: USER_SESSION });
    }
    catch (err) {
        return {
            authorizedKey: false,
            id: 0,
            name: false,
            inviteCode: 0,
            avatar: 0
        };
    }
};

/**
 * 保存用户会话
 * @param userSession
 * @returns {Promise.<Object>}
 */
export const saveUserSession = async (userSession: object) => {
    return await storage.save({key: USER_SESSION, data: userSession});
};

/**
 * 移除用户会话
 * @returns {Promise.<*>}
 */
export const removeUserSession = async () => {
    return await storage.remove({key: USER_SESSION});
};

// 保存我的订阅列表数据
export const saveSubscribeSession = async (subScribeData) => {
    return await storage.save({key: SUBSCRIBE_SESSION,data: subScribeData});
};

// 读取我的订阅列表数据
export const loadSubscribeSession = async () => {
    try {
        return await storage.load({key: SUBSCRIBE_SESSION});
    }
    catch (err) {
        return null
    }
};

// 删除我的订阅列表数据
export const removeSubscribeSession = async () => {
    return await storage.remove({key: SUBSCRIBE_SESSION});
};

// 保存当前版本号
export const saveCurrentVersion = async (currentVersion) => {
    return await storage.save({key: CURRENT_VERSION, data: currentVersion});
};

// 读取当前版本号
export const loadCurrentVersion = async () => {
    try{
        return await storage.load({key: CURRENT_VERSION});
    }
    catch(err){
        return null;
    }
};

// 删除当前版本号
export const removeCurrentVersion = async () =>{
    return await storage.remove({key: CURRENT_VERSION});
};


/*公共方法 - 保存 - 读取 - 删除*/

// 保存
export const saveCommon = async (ID,Value: any) => {
    return await storage.save({key: ID, data: Value});
};

// 读取
export const loadCommon = async (ID) => {
    try{
        return await storage.load({key: ID});
    }
    catch (err) {
        return null;
    }
};

// 删除
export const removeCommon = async (ID) => {
    return await storage.remove({key: ID});
};

module.exports = {
    saveSearchHistory,
    loadSearchHistory,
    removeSearchHisory,
    loadUserSession,
    saveUserSession,
    removeUserSession,

    saveSubscribeSession,
    loadSubscribeSession,
    removeSubscribeSession,

    saveCurrentVersion,
    loadCurrentVersion,
    removeCurrentVersion,

    saveCommon,
    loadCommon,
    removeCommon
};