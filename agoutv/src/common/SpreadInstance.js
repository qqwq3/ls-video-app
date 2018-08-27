'use strict';

const util = require('./Util');

export default class SpreadInstance {
    constructor(props) {
        this._props = props;
    }

    merge(props) {
        this._props = Object.assign({}, this._props, props);
    }

    /**
     * 创建 SpreadInstance 实例
     * @param props
     * @returns {SpreadInstance}
     */
    static create(props) {
        return new SpreadInstance(props);
    }

    /**
     * 推广实例内码
     * @returns {number}
     */
    get instanceId() {
        return this._props.instanceId;
    }

    /**
     * 账户编码
     * @returns {string}
     */
    get instanceCode() {
        return this._props.instanceCode;
    }

    /**
     * 每日播放数
     * @returns {number}
     */
    get playOfDay() {
        return this._props.playOfDay;
    }

    /**
     * 邀请实例的唯一码
     * @returns {string}
     */
    get uniqueId() {
        return this._props.uniqueId;
    }

    /**
     * 是否显示广告
     * @returns {boolean}
     */
    get hasAd() {
        return this._props.hasAd;
    }

    /**
     * 总邀请数
     * @returns {number}
     */
    get totalInvites() {
        return this._props.totalInvites;
    }

    /**
     * 邀请实例的内码
     * @returns {number}
     */
    get inviteInstanceId() {
        return this._props.inviteInstanceId;
    }

    /**
     * 实例创建时间
     * @returns {number}
     */
    get timeCreated() {
        return this._props.timeCreated;
    }

    /**
     * 是否新用户（默认两天内为新用户）
     * @returns {boolean}
     */
    get isNew() {
        return Date.now() - this.timeCreated * 1000 < 172800000;
    }

    /**
     * 无限播放到期时间
     * @returns {*}
     */
    get infiniteExpire() {
        return this._props.infiniteExpire || null;
    }

    /**
     * 无限播放到期时间的文本格式
     * @returns {string}
     */
    get infiniteExpireText () {
        return util.tsToDateFormat(launchSettings.spi.infiniteExpire);
    }

    /**
     * 无限播放是否有效
     * @returns {boolean}
     */
    get isInfiniteInvalid() {
        return Date.now() < this.infiniteExpire * 1000;
    }

    /**
     * 设备唯一码
     * @returns {string}
     */
    get deviceUniqueId() {
        return this._props.deviceUniqueId;
    }

    /**
     * 今日已播放数
     * @returns {number}
     */
    get todayPlay() {
        return this._props.todayPlay;
    }

    /**
     * 当日剩余播放数
     * @returns {*}
     */
    get remainsPlay() {
        return this.isInfiniteInvalid ? '∞' : Math.max(this.playOfDay - this.todayPlay, 0);
    }
}