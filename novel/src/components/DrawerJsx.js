
'use strict';

import React,{ Component } from 'react';
import { View } from 'react-native';
import Drawer from 'react-native-drawer';
import { Styles, ScaledSheet, BackgroundColor } from "../common/Style";

type Props = {
    children?: Node,
    drawerBackgroundColor?: string,
    drawerStyles: ?Object
};

type State = {};

class DrawerJsx extends Component<Props, State>{
    static defaultProps = {
        children: <View/>,
        drawerBackgroundColor: BackgroundColor.bg_fff,
        drawerStyles: {}
    };
    constructor(props){
        super(props);
        this.state = {

        };
    }
    closeControlPanel() {
        this._drawer.close();
    };
    openControlPanel() {
        this._drawer.open();
    };
    render(){
        const { drawerBackgroundColor, children, drawerStyles } = this.props;

        return (
            <Drawer
                side={"left"}
                open={false}
                tapToClose={true}
                type={'overlay'}
                openDrawerOffset={0.3}
                closedDrawerOffset={0}
                tweenDuration={250}
                elevation={4}
                style={[styles.drawer, drawerStyles]}
                ref={(ref) => this._drawer = ref}
                {...this.props}
            >
                <View style={[Styles.container, {backgroundColor: drawerBackgroundColor}]}>
                    { children }
                </View>
            </Drawer>
        );
    }
}

export default DrawerJsx;

const styles = ScaledSheet.create({
    drawer: {
        shadowColor: 'rgba(0,0,0,0.6)',
        shadowOpacity: 0.8,
        shadowRadius: 3
    },
});





































