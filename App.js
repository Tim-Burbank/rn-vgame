import React, { Component } from 'react';
import {
  Text,
  View,
  TouchableOpacity,
  DeviceEventEmitter,
  ScrollView,
  Platform,
  NativeModules,
  NativeEventEmitter
} from 'react-native'
import { agoraService } from "./agora"
import { AgoraView } from 'react-native-agora'
import RNPermissions, {PERMISSIONS, check} from 'react-native-permissions'
// import Voice from 'react-native-voice'
// const SpeechRecognitionModule = NativeModules.SpeechRecognitionModule
// const SpeechRecognitionEmitter = new NativeEventEmitter(NativeModules.SpeechRecognitionResultModule)
export default class HelloWorldApp extends Component {
  constructor(props) {
    super(props)
    // if (Platform.OS === 'ios') this.listener = SpeechRecognitionEmitter.addListener('SpeechRecognitionFinish', this.onSpeechResults.bind(this))
  }
  li
  state={
    uid:0,
    uuid: [],
    startLocal: false
  }
  async componentWillMount() {
    await RNPermissions.request(PERMISSIONS.IOS.CAMERA)
    await RNPermissions.request(PERMISSIONS.IOS.MICROPHONE)
    await RNPermissions.request(PERMISSIONS.IOS.SPEECH_RECOGNITION)
    check(PERMISSIONS.IOS.MICROPHONE).then(res=> {
      console.log('RNPermissions-m',res)
    })
    check(PERMISSIONS.IOS.CAMERA).then(res=> {
      console.log('RNPermissions-c',res)
    })
    this.li = DeviceEventEmitter.addListener('uid', (uid)=>{
      console.log('uid', uid)
      this.setState({uid: uid.uid})
    })
    this.li2 = DeviceEventEmitter.addListener('uuid', (uid)=>{
      console.log('uuid', uid)
      let _state = this.state.uuid.slice()
      _state.push(uid.uid)
      this.setState({uuid: _state})
    })
    this.li3 = DeviceEventEmitter.addListener('uuidOff', (uid)=>{
      console.log('uuid', uid)
      let _state = this.state.uuid.slice()
      _state = _state.filter(v=> v!==uid.uid)
      this.setState({uuid: _state})
    })
    agoraService.init()
  }
  componentWillUnmount(){
    this.li.remove()
    this.li2.remove()
    this.li3.remove()
    agoraService.leaveChannel().then(() => {
      RtcEngine.destroy()
    })
  }

  onSpeechResults(e) {
    console.log('-------', e.result)
    this.setState({text: e.result})
  }

  async startRecog() {
    console.log('startttttt')
    // 开始语音识别
    // let speechpermission = await Permissions.check('speechRecognition')
    // console.log(speechpermission)
    // if (speechpermission === 'undetermined') {
    //   await Permissions.request('speechRecognition')
    //   speechpermission = await Permissions.check('speechRecognition')
    // }
    // if (speechpermission !== 'authorized') {
    //   this.presentToast('请在设置中打开小世界的“语音识别”权限。')
    //   return
    // }
    // let microphonepermission = await Permissions.check('microphone')
    // console.log(microphonepermission)
    // if (microphonepermission === 'undetermined') {
    //   await Permissions.request('microphone')
    //   microphonepermission = await Permissions.check('microphone')
    // }
    // if (microphonepermission !== 'authorized') {
    //   this.presentToast('请在设置中打开小世界的“麦克风”权限。')
    //   return
    // }

    this.setState({recordBtnText: 'Release to stop'})
    if (Platform.OS === 'ios') {
      SpeechRecognitionModule.isSpeechAvailable((result) => {
        console.log(result)
      })
      SpeechRecognitionModule.startRecording()
    } else {
      Voice.start('zh-CN')
    }
    this.setState({recordBtnText: 'Release to stop'})

  }

  stopRecog() {
    console.log('endddddd')
    this.setState({recordBtnText: 'Press to record'})
    // 停止语音识别
    if (Platform.OS === 'ios') {
      SpeechRecognitionModule.stopRecording()
    } else {
      Voice.stop()
    }
  }
  render() {
    return (
      <ScrollView >
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", paddingTop: 200 }}>
          <Text>Hello, world!</Text>
          <Text>{this.state.text}</Text>

        <View style={{justifyContent: 'flex-start', flexDirection:'row', marginVertical: 20}}>
            <TouchableOpacity style={{width:70, height: 30, marginRight: 20, backgroundColor: 'orange',justifyContent: "center", alignItems: "center"}} onPress={()=> {agoraService.joinChannel();this.setState({startLocal: true})}}><Text>加入频道</Text></TouchableOpacity>
            <TouchableOpacity style={{width:70, height: 30, backgroundColor: 'yellow', justifyContent: "center", alignItems: "center"}} onPress={()=> {agoraService.leaveChannel();this.setState({startLocal: false})}}><Text>离开频道</Text></TouchableOpacity>
          </View>
          <View style={{justifyContent: 'space-between', flexDirection: 'row' ,flexWrap: 'wrap'}}>
            <AgoraView style={{width: 100, height: 100}} showLocalVideo={this.state.startLocal} mode={1}/>
            {this.state.uuid.map(v=>
              <AgoraView style={{width: 100, height: 100}}  mode={1} zOrderMediaOverlay={true} remoteUid={v}/>
            )}
          </View>
        {/*<View style={{marginTop: 100, width:70, height: 30, backgroundColor: 'pink', justifyContent: "center", alignItems: "center"}}*/}
              {/*onTouchStart={()=> this.startRecog()}*/}
              {/*onTouchEnd={()=> this.stopRecog()}*/}
        {/*><Text>识别</Text></View>*/}
      </View>
      </ScrollView>
    );
  }
}
