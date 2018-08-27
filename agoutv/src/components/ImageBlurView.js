'use strict';

import React from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    findNodeHandle,
    ViewPropTypes,
} from 'react-native';
import {
    BlurView,
    VibrancyView
} from 'react-native-blur';
import PropTypes from 'prop-types';


export default class ImageBlurView extends React.Component {

    static propTypes = {
        source: PropTypes.string.isRequired,
        style: (ViewPropTypes || View.propTypes).style,
        backgroundStyle: (ViewPropTypes || View.propTypes).style,
        blurType: PropTypes.string,
        blurAmount: PropTypes.number,
    };

    static defaultProps = {
        blurType: 'light',
        blurAmount: 10,
    };

    constructor(props) {
        super(props);
        this.state = { viewRef: null };
    }

    _onImageLoaded() {
        this.setState({ viewRef: findNodeHandle(this.backgroundImage) });
    }

    render() {
        let {children} = this.props;
        return (
            <View style={[styles.container, this.props.style]}>
                <Image
                    ref={(img) => { this.backgroundImage = img; }}
                    source={{uri: this.props.source}}
                    style={[styles.absolute, this.props.backgroundStyle]}
                    onLoadEnd={this._onImageLoaded.bind(this)}
                />
                <BlurView
                    style={[styles.absolute, this.props.backgroundStyle]}
                    viewRef={this.state.viewRef}
                    blurType={this.props.blurType}
                    blurAmount={this.props.blurAmount}
                />
                {children}
            </View>
        );
    }
}


const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    absolute: {
        position: "absolute",
        top: 0, left: 0, bottom: 0, right: 0,
    },
});