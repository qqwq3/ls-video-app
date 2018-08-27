import React from 'react';
import {
    TouchableOpacity,
    Image,
} from 'react-native';
import { create } from '../common/XingrenStyleSheet';


export class DrawerMenuButton extends React.Component {

    render() {
        return (
            <TouchableOpacity style={styles.left} {...this.props}>
                <Image
                    source={require('./imgs/icon_menu.png')}
                    style={styles.iconMenu}
                />
            </TouchableOpacity>
        );
    }

}

export class SearchButton extends React.Component {
    render() {
        return (
            <TouchableOpacity style={styles.right} {...this.props}>
                <Image
                    source={require('./imgs/icon_search.png')}
                    style={styles.iconSearch}
                />
            </TouchableOpacity>
        );
    }
}

export class BackwardButton extends React.Component {
    render () {
        return (
            <TouchableOpacity style={styles.left} {...this.props}>
                <Image
                    source={require('./imgs/VideoPlayer/icon_back_arrow.png')}
                    style={styles.iconBack}
                />
            </TouchableOpacity>
        );
    }
}

const styles = create({
    iconMenu: {
        width: 20,
        height: 16,
    },
    iconSearch: {
        width: 15,
        height: 16,
    },
    left: {
        marginLeft: 15,
        width: 30,
        height: 15,
    },
    right: {
        marginRight: 15,
    },
    iconBack: {
        width: 10,
        height: 16,
    },
});