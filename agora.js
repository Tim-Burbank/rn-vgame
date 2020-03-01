import {DeviceEventEmitter, NativeModules} from 'react-native'
import { RtcEngine } from 'react-native-agora'
// import configureStore from '../boot/configureStore'
// import BackgroundTimer from 'react-native-background-timer'
import RNFS from 'react-native-fs'
const { Agora } = NativeModules
console.log(Agora)
if (!Agora) {
  throw new Error('Agora load failed in react-native, please check ur compiler environments')
}
const { FPS30, AudioScenarioDefault, Adaptative } = Agora
const APPID = 'f47f8efaa98f4195aeeeb9f2b16c609e'
const CHANNEL_PROFILE = 1 // (0)：通信模式 (1)：直播模式
const CLIENT_ROLE_BROADCASTER = 1 // 直播频道中的主播
const CLIENT_ROLE_AUDIENCE = 2 // 直播频道中的观众
const CONFIG = {
  appid: APPID,
  channelProfile: CHANNEL_PROFILE,
  clientRole: CLIENT_ROLE_BROADCASTER,
  // mode:1,
  videoEncoderConfig: {
    width: 360,
    height: 360,
    bitrate: 1,
    frameRate: FPS30,
    orientationMode: Adaptative
  },
  beauty: {
    lighteningContrastLevel: 1,
    lighteningLevel: 0.7,
    smoothnessLevel: 0.5,
    rednessLevel: 0.1
  },
  dualStream: false,
  audioProfile: AudioScenarioDefault,
  audioScenario: AudioScenarioDefault
}

const DEFAULT_CHANNEL = '11376'
// const DEFAULT_CHANNEL = '1137664'

class AgoraService {
  currentRole = CLIENT_ROLE_AUDIENCE

  constructor() {
    console.log('[CONFIG]', JSON.stringify(CONFIG))
    console.log('[CONFIG.encoderConfig', CONFIG.videoEncoderConfig)
    RtcEngine.on('videoSizeChanged', data => {
      console.log('[RtcEngine] videoSizeChanged ', data)
    })
    RtcEngine.on('remoteVideoStateChanged', data => {
      console.log('[RtcEngine] `remoteVideoStateChanged`', data)
    })
    RtcEngine.on('userJoined', data => {
      console.log('[RtcEngine] onUserJoined', data)
      // configureStore().agoraStore.setCurrentBroadcaster(data.uid)
      DeviceEventEmitter.emit('uuid', {uid: data.uid})

    })
    RtcEngine.on('userOffline', data => {
      console.log('[RtcEngine] onUserOffline', data)
      DeviceEventEmitter.emit('uuidOff', {uid: data.uid})
      // configureStore().agoraStore.setCurrentBroadcaster(0)
    })
    RtcEngine.on('joinChannelSuccess', data => {
      console.log('[RtcEngine] onJoinChannelSuccess', data)
      // configureStore().agoraStore.setMyUid(data.uid)
      RtcEngine.setClientRole(CLIENT_ROLE_BROADCASTER).then(_ => {
        console.log('[RtcEngine] setClientRole CLIENT_ROLE_BROADCASTER')
        RtcEngine.startPreview().then(_ => {
          console.log('[RtcEngine] startPreview')
          // RtcEngine.muteLocalAudioStream(true).then(() => {
          //   console.log('[RtcEngine] muteLocalAudioStream true')
          // })
          // configureStore().agoraStore.setSelfPreview(true)
        })
      })
      // RtcEngine.startPreview()
      // this.joinChannelSocket(DEFAULT_CHANNEL, data.uid)
      DeviceEventEmitter.emit('uid', {uid: data.uid})
    })
    RtcEngine.on('audioVolumeIndication', data => {
      console.log('[RtcEngine] onAudioVolumeIndication', data)
    })
    RtcEngine.on('clientRoleChanged', data => {
      console.log('[RtcEngine] onClientRoleChanged', data)
      this.currentRole = data.newRole
      // if (configureStore().agoraStore.isSelfBroadcast) {
      //   if (data.newRole === CLIENT_ROLE_BROADCASTER) {
      //     // 转变为主播
      //     // RtcEngine.startPreview().then(_ => {// prew应该放在当自己开始主播的时候
      //     //   console.log('[RtcEngine] isSelfBroadcast  startPreview')
      //     //   RtcEngine.muteLocalAudioStream(false).then(() => {
      //     //     console.log('[RtcEngine] muteLocalAudioStream false')
      //     //   })
      //     //   configureStore().agoraStore.setJoinChannelState(true)
      //     // })
      //   }
      // } else {
      //   // 当预览的时候的情况
      //   if (data.newRole === CLIENT_ROLE_BROADCASTER) {
      //     // 转变为主播
      //     // RtcEngine.startPreview().then(_ => {// prew应该放在当自己开始主播的时候
      //     //   console.log('[RtcEngine] startPreview')
      //     //   RtcEngine.muteLocalAudioStream(true).then(() => {
      //     //     console.log('[RtcEngine] muteLocalAudioStream true')
      //     //   })
      //     //   configureStore().agoraStore.setSelfPreview(true)
      //     // })
      //   }
      // }
    })
    RtcEngine.on('videoSizeChanged', data => {
      console.log('[RtcEngine] videoSizeChanged', data)
    })
    RtcEngine.on('error', data => {
      console.log('[RtcEngine] onError', data)
      // if (data.errorCode === 17) {
      //   // 拒绝进入频道
      //   RtcEngine.leaveChannel().then(_ => {
      //     // to do
      //   })
      // }
    })
    RtcEngine.getSdkVersion(version => {
      console.log('[RtcEngine] getSdkVersion', version)
    })
  }

  init() {
    RtcEngine.init(CONFIG)
    // let p = RNFS.DocumentDirectoryPath
    // console.log('ooooo', p)
    // RtcEngine.setLog(p,5,512)
  }

  muteLocalAudioStream(enabled){
    RtcEngine.muteLocalAudioStream(enabled)
  }

  muteLocalVideoStream(muted) {
    RtcEngine.muteLocalVideoStream(muted)
  }

  switchCamera(){
    RtcEngine.switchCamera()
  }

  destroy() {
    const agoraStore = configureStore().agoraStore
    console.log('[RtcEngine] joinSuccess ', agoraStore.joinSuccess)
    if (agoraStore.joinSuccess) {
      console.log('[RtcEngine] leaveChannel going')
      RtcEngine.leaveChannel()
        .then(_ => {
          RtcEngine.destroy()
        })
        .catch(err => {
          RtcEngine.destroy()
          console.log('[RtcEngine] leave channel failed', err)
        })
    } else {
      RtcEngine.destroy()
    }
  }

  leaveChannel() {
    // const agoraStore = configureStore().agoraStore
    // console.log('[RtcEngine] leaving')
    // if (agoraStore.joinSuccess) {
    //   agoraStore.leave()
    //   RtcEngine.leaveChannel().then(_ => {
    //     console.log('[RtcEngine] leave channel success')
    //     // configureStore().appStore.socketEmit2('leave').then(() => {
    //     //   console.log('[RtcEngine] socket leave leave leave')
    //     // })
    //   })
    // }
    RtcEngine.leaveChannel().then(_ => {
      console.log('[RtcEngine] leave channel success')
      // configureStore().appStore.socketEmit2('leave').then(() => {
      //   console.log('[RtcEngine] socket leave leave leave')
      // })
    })
  }

  async joinChannel(channel = DEFAULT_CHANNEL, uid, token) {
    await RtcEngine.joinChannel(channel, uid, token)
    // RtcEngine.enableLocalAudio(true)
    // RtcEngine.enableAudioVolumeIndication(500, 3, true);
  }

  joinChannelSocket(channel: string = DEFAULT_CHANNEL, uid: number) {
    // configureStore().appStore.socketEmit2('joinGameRoom', {roomId: channel, uid: uid}).then(() => {
    //   // console.log('[RtcEngine] onJoinChannelSuccess socketEmit', data)
    // })
  }

  turnToPreview(channel: string = DEFAULT_CHANNEL) {
    console.log('[RtcEngine] socket previewNext')
    // configureStore().appStore.socketEmit2('previewNext', {roomId: channel}).then(() => {
    //
    // })
  }

  turnToNext(channel: string = DEFAULT_CHANNEL) {
    console.log('[RtcEngine] socket turnToNext : ', configureStore().agoraStore.nextBroadcaster)
    if (configureStore().agoraStore.nextBroadcaster) {
      console.log('[RtcEngine] socket turnToNext')
      // configureStore().appStore.socketEmit2('turnToNext', {roomId: channel}).then(() => {
      // })
    } else {
      console.log('[RtcEngine] socket turnToFirst ')
      // configureStore().appStore.socketEmit2('turnToFirst ', {roomId: channel}).then(() => {
      // })
    }
  }

  turnToFirst(channel: string = DEFAULT_CHANNEL) {
    console.log('[RtcEngine] socket turnToFirst ')
    // configureStore().appStore.socketEmit2('turnToFirst ', {roomId: channel}).then(() => {
    // })
  }

  onSocketPreviewRoomInfo(data: any) {
    const agoraStore = configureStore().agoraStore
    const current = data.current
    const next = data.next
    // agoraStore.setNextBroadcaster(next.uid)
    if (current) {
      if (current.uid === agoraStore.myUid) {
        console.log('[RtcEngine]  currentRole ', this.currentRole)
        // if (this.currentRole === CLIENT_ROLE_AUDIENCE) {
        RtcEngine.setClientRole(CLIENT_ROLE_BROADCASTER).then(_ => {
          console.log('[RtcEngine] setClientRole CLIENT_ROLE_BROADCASTER')
          RtcEngine.startPreview().then(_ => {
            // prew应该放在当自己开始主播的时候
            console.log('[RtcEngine] startPreview')
            RtcEngine.muteLocalAudioStream(true).then(() => {
              console.log('[RtcEngine] muteLocalAudioStream true')
            })
            configureStore().agoraStore.setSelfPreview(true)
          })
        })
        // } else {
        //   RtcEngine.startPreview().then(_ => {// prew应该放在当自己开始主播的时候
        //     console.log('[RtcEngine] startPreview')
        //     RtcEngine.muteLocalAudioStream(true).then(() => {
        //       console.log('[RtcEngine] muteLocalAudioStream true')
        //     })
        //     configureStore().agoraStore.setSelfPreview(true)
        //   })
        // }
      }
    }
    if (next) {
      console.log('[RtcEngine] onSocketPreviewRoomInfo next : ', next)
    }
  }

  onSocketRoomInfo(data: any) {
    const agoraStore = configureStore().agoraStore
    const current = data.current
    const next = data.next
    if (current) {
      console.log('[RtcEngine] current.uid ', current.uid, ' agoraStore.myUid ', agoraStore.myUid)
      const currentUid = current.uid
      if (currentUid === agoraStore.myUid) {
        console.log('[RtcEngine] onSocketRoomInfo isSelfBroadcast ', agoraStore.isSelfBroadcast)
        if (!agoraStore.isSelfBroadcast) {
          agoraStore.setSelfBroadcaster(true)
          agoraStore.setSelfPreview(false)
          console.log('[RtcEngine]  currentRole ', this.currentRole)
          // if (this.currentRole === CLIENT_ROLE_AUDIENCE) {
          RtcEngine.setClientRole(CLIENT_ROLE_BROADCASTER).then(_ => {
            console.log('[RtcEngine] onSocketRoomInfo CLIENT_ROLE_BROADCASTER ')
            RtcEngine.startPreview().then(_ => {
              // prew应该放在当自己开始主播的时候
              console.log('[RtcEngine] isSelfBroadcast  startPreview')
              RtcEngine.muteLocalAudioStream(false).then(() => {
                console.log('[RtcEngine] muteLocalAudioStream false')
              })
              configureStore().agoraStore.setJoinChannelState(true)
            })
          })
          // } else {
          //   RtcEngine.startPreview().then(_ => {// prew应该放在当自己开始主播的时候
          //     console.log('[RtcEngine] isSelfBroadcast  startPreview')
          //     RtcEngine.muteLocalAudioStream(false).then(() => {
          //       console.log('[RtcEngine] muteLocalAudioStream false')
          //     })
          //     configureStore().agoraStore.setJoinChannelState(true)
          //   })
          // }
        }
      } else {
        if (currentUid !== agoraStore.currentBroadcaster) {
          agoraStore.setWaiting(true)
          setTimeout(() => {
            agoraStore.setWaiting(false)
            console.log('[RtcEngine]  currentRole ', this.currentRole)
            // if (this.currentRole === CLIENT_ROLE_BROADCASTER) {
            RtcEngine.setClientRole(CLIENT_ROLE_AUDIENCE).then(_ => {
              console.log('[RtcEngine] onSocketRoomInfo CLIENT_ROLE_AUDIENCE ')
              agoraStore.setSelfBroadcaster(false)
              agoraStore.setJoinChannelState(true)
            })
            // } else {
            //   agoraStore.setSelfBroadcaster(false)
            //   agoraStore.setJoinChannelState(true)
            // }
            // }, 500)
            // }
          }, 100)
        }
      }
      agoraStore.setCurrentBroadcaster(currentUid)
    }
    if (next) {
      // const nextUid = next.uid
      // if(){
      console.log('[RtcEngine] onSocketRoomInfo next.uid ', next.uid)
      agoraStore.setNextBroadcaster(next.uid)
    }
  }
}

export const agoraService = new AgoraService()
