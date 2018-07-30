
'use strict';

import React,{ Component } from 'react';
import { View, Text, FlatList, Image, TouchableOpacity, TouchableHighlight,TextInput,Dimensions,StatusBar } from 'react-native';
import Toast from 'react-native-root-toast';
import { connect } from 'react-redux';
import Immutable from 'immutable';
import { moderateScale, scale, verticalScale } from 'react-native-size-matters';
import { Styles, ScaledSheet,Img, Fonts, Colors, BackgroundColor } from "../../common/Style";
import { arrow } from "../../common/Icons";
import { loadFeedback, SubmitFeedback } from "../../actions/Feedback";
import Header from '../../components/Header';

type Props = {};

class Feedback extends Component<Props>{
	constructor(props){
        super(props);
        this._onChangeOpintion = this._onChangeOpintion.bind(this);
        this._onChangePhone = this._onChangePhone.bind(this);
        // this._onPressChoose = this._onPressChoose.bind(this);
        this.state={
        	isChoose:false,
            opintion:"",
			phone:'',
			mapLabel: new Map(),
        }
   }

    componentWillMount(){
        this.props.loadFeedback && this.props.loadFeedback();
    }

    _onChangeOpintion(inputData){
        this.setState({opintion:inputData},
        );

    }

    _onChangePhone(inputData){
        this.setState({phone:inputData});

    }

    _onPressChoose(data, index){
       let mapLabel = this.state.mapLabel;
        if(mapLabel.has(index)){
            mapLabel.delete(index);
        }
        else{
            mapLabel.set(index, data.content);
        }
        this.setState({mapLabel});
	}

    _goBack(){
        const { navigation } = this.props;
        navigation.goBack();
    }

    renderHeader(){
        return (
            <Header
                title={'意见反馈'}
                isArrow={true}
                goBack={this._goBack.bind(this)}
            />
        );
    }

	renderQuestion(){
        // const { questionType } = this.props;

		const { feedback } = this.props;
		const data = (feedback && feedback.questionType && feedback.questionType.data) || null;
		const typeList = data ? data.typeList : [];
		const dataQuestion=typeList;

		return(
			<View>
				<View style={[{paddingLeft:moderateScale(15),marginTop:moderateScale(20),marginBottom:moderateScale(20)}]}>
					<Text style={[Fonts.fontFamily,Fonts.fontSize16,{color:'#404040'}]}>问题类型</Text>
                </View>

				<View style={[{marginLeft:moderateScale(15),marginRight:moderateScale(15)}]}>
						<FlatList
                            columnWrapperStyle={{justifyContent:'space-between'}}
                            numColumns ={4}
							renderItem={this._renderItem.bind(this)}
                            keyExtractor={(item,index) => index}
							data={dataQuestion}
						/>
				</View>
			</View>

		)
	}
	_renderItem({item, index}){
		const mapLabel = this.state.mapLabel;
        const backgroundLinght = mapLabel.get(index) === item.content ? '#f3916b' : '#ffffff';
        const textLinght = mapLabel.get(index) === item.content ? '#ffffff' : '#b2b2b2';

		return (
            <TouchableOpacity
                style={[styles.question,{backgroundColor: backgroundLinght,justifyContent: 'center',alignItems:'center' }]}
                activeOpacity={1}
                onPress={this._onPressChoose.bind(this,item,index)}
            >
                <View style={[{justifyContent: 'center',alignItems:'center'}]}>
                    <Text style={[Fonts.fontFamily,Fonts.fontSize12,{color: textLinght,textAlign:'center'}]}>{item.content}</Text>
                </View>
            </TouchableOpacity>
		);
	}
	renderOpinion(){
		const ScreenWidth = Dimensions.get('window').width;
		return(
			<View>
            	<View style={[styles.boxBoldDot,{backgroundColor: BackgroundColor.bg_f1f1f1}]}/>
					<TextInput
						style={{height:verticalScale(150),width:ScreenWidth,padding: 0,paddingTop:moderateScale(15),paddingLeft:moderateScale(15),textAlignVertical: 'top',}}
                        placeholder={"请留下你的宝贵意见，我们将努力做到更好"}
                        placeholderTextColor={'#b2b2b2'}
                        underlineColorAndroid={"transparent"}
                        maxLength={200}
                        multiline={true}
                        onChangeText={this._onChangeOpintion}
					/>
				<View style={[styles.boxBoldDot,{backgroundColor: BackgroundColor.bg_f1f1f1}]}/>
            </View>
		)
	}

	renderPhone(){
        const ScreenWidth = Dimensions.get('window').width;
		return(
			<View>
                <TextInput
                    style={{height:verticalScale(80),width:ScreenWidth,padding: 0,paddingTop:moderateScale(15),paddingLeft:moderateScale(15),textAlignVertical: 'top',}}
                    placeholder={"手机号码，以便回访(选填)"}
                    placeholderTextColor={'#b2b2b2'}
                    underlineColorAndroid={"transparent"}
                    maxLength={11}
                    multiline={true}
                    onChangeText={this._onChangePhone}
                />
                <View style={[styles.boxBoldDot,{backgroundColor: BackgroundColor.bg_f1f1f1}]}/>
			</View>
		)
	}

	_onSubmission(){
        const { SubmitFeedback } = this.props;
        const { phone } = this.state;
        const content =this.state.opintion;
        let type = '';
		for(let [k,v] of this.state.mapLabel){
			type =type + v + " ";
		}
            SubmitFeedback && SubmitFeedback(phone, type, content);
            Toast.show('提交成功',{ duration: 2000, position: -55 });
	}

	renderSubmission(){
		return(
			<View style={{flex:1,alignItems:'center',justifyContent:'center'}}>
				<TouchableOpacity
                    activeOpacity={0.75}
                    onPress={this._onSubmission.bind(this)}
				>
                    <Text style={[Fonts.fontFamily,Fonts.fontSize16,styles.submission,{textAlign:'center',justifyContent: 'center'}]}>提  交</Text>
				</TouchableOpacity>

			</View>
		)
	}

	render(){
        return (
            <View style={[Styles.container]}>                
              	{ this.renderHeader() }
              	{ this.renderQuestion() }
				{ this.renderOpinion() }
                { this.renderPhone() }
                { this.renderSubmission() }
            </View>
        );
    }
}

const styles = ScaledSheet.create({
	arrow: {
	        height: '18@vs',
	        width: '10@s',
	        tintColor:'#404040',
	    },
	question: {
			marginBottom:'13@ms',
			width:'75@s',
			height:'25@vs',
			borderStyle:'solid',
       	 	borderWidth:1,
        	borderRadius:'20@ms',
			borderColor:'#b2b2b2'
	},
    boxBoldDot: {
        height: '10@vs',
    },
	submission: {
		width:'300@s',
		height:'44@vs',
		textAlign:'center',
        backgroundColor:BackgroundColor.bg_f3916b,
        borderRadius:'22@ms',
		color:'white',
		paddingTop:'10@ms'
	},
});

const mapStateToProps = (state, ownProps) => {
    let data = state.getIn(['feedback']);

    if(Immutable.Map.isMap(data)){ data = data.toJS() }
    return { ...ownProps, ...data };
};

export default connect(mapStateToProps,{ loadFeedback,SubmitFeedback })(Feedback);




















