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
import Voice from '@react-native-community/voice';
export default class HelloWorldApp extends Component {
  constructor(props) {
    super(props)
    Voice.onSpeechPartialResults = this.onSpeechPartialResults.bind(this)
  }
  li
  joinFlag = false
  recFlag = false
  state={
    uid:0,
    uuid: [],
    startLocal: false,
    audio: true,
    video: false,
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

  onSpeechPartialResults(e) {
    console.log('-------', e.value)
    if(!this.joinFlag) return
    this.setState({text: e.value})
  }


  async startRecog() {
    console.log('startttttt')
    await Voice.start('zh-CN')
    this.recFlag = true

  }

  async stopRecog() {
    console.log('endddddd')
    await Voice.stop()
    this.recFlag = false
  }
  async join () {
    await agoraService.joinChannel()
    this.setState({startLocal: true})

    this.joinFlag = true
    // setTimeout(() => {
    //   this.startRecog()
    //   this.checkIfInRoom()
    // }, 500)
  }
  checkIfInRoom(){
    this.timer = setInterval(async() => {
      console.log('----check----')
      if(this.joinFlag && this.recFlag){
        await this.stopRecog()
        setTimeout(() => {
          this.startRecog()
        }, 1000)
      } else {
        await this.stopRecog()
      }
    }, 30000)
  }
  leave(){
    agoraService.leaveChannel();
    // this.stopRecog()
    clearInterval(this.timer)
    this.joinFlag = false
    this.recFlag = false
    this.setState({startLocal: false, uuid:[], text: ''})
  }

  render() {
    const {audio,startLocal,uuid, video} = this.state
    return (
      <ScrollView >
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", paddingTop: 100 }}>
          <Text>Hello, world!</Text>
          <Text>{this.state.text}</Text>
        <View style={{justifyContent: 'flex-start', flexDirection:'row', marginVertical: 20}}>
            <TouchableOpacity style={{width:70, height: 30, marginRight: 20, backgroundColor: '#DBDBDB',justifyContent: "center", alignItems: "center"}}
                              onPress={()=> {
                                this.join()
            }}><Text>加入频道</Text></TouchableOpacity>
            <TouchableOpacity style={{width:70, height: 30, backgroundColor: '#D3D3D3', justifyContent: "center", alignItems: "center"}}
                              onPress={()=> {
                                this.leave()
                              }
            }><Text>离开频道</Text></TouchableOpacity>
          </View>

        <View style={{justifyContent: 'flex-start', flexDirection:'row', marginVertical: 20}}>
        <TouchableOpacity
          style={{width:70, height: 30, backgroundColor: '#CDB7B5', justifyContent: "center", alignItems: "center", marginRight: 20}}
          onPress={()=> {this.setState({audio: !audio});agoraService.enableLocalAudio(!audio)}}>
          <Text>{audio?'闭麦':'开麦'}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{width:70, height: 30, backgroundColor: '#CDAF95', justifyContent: "center", alignItems: "center", marginRight: 20}}
          onPress={()=> {this.setState({video: !video});agoraService.muteLocalVideoStream(!video)}}>
          <Text>{!video?'关视频':'开视频'}</Text>
        </TouchableOpacity>
          <TouchableOpacity
            style={{width:70, height: 30, backgroundColor: '#E6E6FA', justifyContent: "center", alignItems: "center"}}
            onPress={()=> {this.setState({video: !video});agoraService.switchCamera()}}>
            <Text>切换相机</Text>
          </TouchableOpacity>
        </View>
        {/*<View style={{justifyContent: 'flex-start', flexDirection:'row', marginVertical: 20}}>*/}
          {/*<View style={{marginTop: 100, width:70, height: 30, backgroundColor: 'pink', justifyContent: "center", alignItems: "center"}}*/}
          {/*onTouchStart={()=> this.startRecog()}*/}
          {/*onTouchEnd={()=> this.stopRecog()}*/}
          {/*><Text>识别</Text></View>*/}
        {/*</View>*/}
        </View>
        <View style={{justifyContent: 'space-between', flexDirection: 'row' ,flexWrap: 'wrap', marginVertical: 20,marginHorizontal:30}}>
          {startLocal && <AgoraView style={{width: 100, height: 100}} showLocalVideo={this.state.startLocal} mode={1}/>}
          {uuid.map(v=>
            <AgoraView key={v} style={{width: 100, height: 100}}  mode={1} zOrderMediaOverlay={true} remoteUid={v}/>
          )}
        </View>
      </ScrollView>
    );
  }
}
