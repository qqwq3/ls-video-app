
//微信分享工具类
'use strict';

import * as wechat from 'react-native-wechat';
import Toast from 'react-native-root-toast';
import { loadUserSession } from '../common/Storage';

const  wxId = 'wx4f60c8eebaec00f1';

//-------------------------- new  public --------------------------------//

export const commonShare = async (type: string,channelID:string,shareUrl:string) => {
    const shareBody: string = '免费看全网VIP视频，还能赚大钱。强烈推荐！';
    const shareTitle: string = '超视TV-全网VIP视频免费看';
    const shareImageUrl: string = 'http://download.xiyunkai.cn/icon/chaoshiicon.png';
    // const shareLink: string = shareUrl +`/agoutv/download.html?channelId=${channelID}`;

    const user = await loadUserSession();
    const inviteCode = (user && user.inviteCode) || '';
    const shareLink: string = `${shareUrl}/agoutv/invite.html?channelId=${channelID}&code=${inviteCode}`;

    shareContent(type,shareTitle,shareBody,shareImageUrl,shareLink);
};


/**
 * 分享链接给朋友 or 朋友圈
 * @param type 分享类型： 'friends' or 'friendsCircle'
 * @param title  题目
 * @param description 描述
 * @param thumbImage  图片地址
 * @param webpageUrl  链接路径
 * @param shareType   分享类型：默认为 news
 */

export const shareContent = (
    type: string,
    title: string,
    description: string,
    thumbImage: string,
    webpageUrl: string,
    shareType: string = 'news'
) => {
    const obj: Object = {
        title: title,
        description: description,
        thumbImage: thumbImage,
        type: shareType,
        webpageUrl: webpageUrl
    };

    wechat.registerApp(wxId);
    wechat.isWXAppInstalled()
    .then((isInstalled) => {
        if (isInstalled) {
            // 分享给朋友
            if(type === 'friends'){
                wechat.shareToSession(obj).catch((error) => {  });
            }
            // 分享到朋友圈
            if(type === 'friendsCircle'){
                wechat.shareToTimeline(obj).catch((error) => {  });
            }
        }
        else {
            Toast.show('没有安装微信软件，请您安装微信之后再试',{duration: 2000, position: -55});
        }
    });
};

// 监听分享
export const shareAddListener = (success: Function => void) => {
    wechat.addListener(
        'SendMessageToWX.Resp',
        (response) => {
            if (parseInt(response.errCode) === 0) {
                success && success();
            }
            else { Toast.show('分享失败，请稍后再次分享哦',{duration: 2000, position: -55}) }
        }
    );
};

// 删除监听 - 分享
export const shareRemoveListener = () => {
    wechat.removeAllListeners();
};


//-------------------------- old  public --------------------------------//

/**
 * 分享文本给好友
 * @param description
 */
export function shareFdsText(description:string){
    wechat.registerApp(wxId);
    wechat.isWXAppInstalled()
        .then((isInstalled) => {
            if (isInstalled) {
                wechat.shareToSession({type: 'text', description: description})
                    .catch((error) => {
                        Toast.show(error.message);
                    });
            } else {
                Toast.show('没有安装微信软件，请您安装微信之后再试',{duration: 2000, position: -55});
            }
        });
}

/**
* 分享链接给朋友
* @param title  题目
* @param description 描述
* @param thumbImage  图片地址
* @param webpageUrl  链接路径
*/
export function shareFdsLink(title?: any,description?: any,thumbImage?: any,webpageUrl?: any){
    wechat.registerApp(wxId);
    wechat.isWXAppInstalled()
        .then((isInstalled) => {
            if (isInstalled) {
                wechat.shareToSession({
                    title:title,
                    description: description,
                    thumbImage: thumbImage,
                    type: 'news',
                    webpageUrl:webpageUrl
                })
                .catch((error) => {
                    Toast.show('分享失败，请稍后再次分享哦');
                });
            } else {
                Toast.show('没有安装微信软件，请您安装微信之后再试');
            }
        });
}


/**
 * 分享文本到朋友圈
 * @param description  文本文字
 */
export function shareFdsCirText(description:string){
    wechat.registerApp(wxId);
    wechat.isWXAppInstalled()
        .then((isInstalled) => {
            if (isInstalled) {
                wechat.shareToTimeline({type: 'text', description: description})
                .catch((error) => {
                    Toast.show(error.message);
                });
            } else {
                Toast.show('没有安装微信软件，请您安装微信之后再试');
            }
        });
}

/**
 * 分享链接到朋友圈
 * @param title  题目
 * @param description 描述
 * @param thumbImage  图片地址
 * @param webpageUrl  链接路径
 */
export function shareFdsCirLink(title?: any,description?: any,thumbImage?: any,webpageUrl?: any){
    wechat.registerApp(wxId);
    wechat.isWXAppInstalled()
        .then((isInstalled) => {
            if (isInstalled) {
                wechat.shareToTimeline({
                    title:title,
                    description: description,
                    thumbImage: thumbImage,
                    type: 'news',
                    webpageUrl: webpageUrl
                })
                .catch((error) => {
                    Toast.show('分享失败，请稍后再次分享哦');
                });
            } else {
                Toast.show('没有安装微信软件，请您安装微信之后再试');
            }
        });
}