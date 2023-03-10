//require('./app/util/ConvertTo1ChannelStream');
const googleSpeech = require('@google-cloud/speech');

const { Transform } = require('stream');

function convertBufferTo1Channel(buffer) {
  const convertedBuffer = Buffer.alloc(buffer.length / 2)

  for (let i = 0; i < convertedBuffer.length / 2; i++) {
    const uint16 = buffer.readUInt16LE(i * 4)
    convertedBuffer.writeUInt16LE(uint16, i * 2)
  }

  return convertedBuffer;
}

class ConvertTo1ChannelStream extends Transform {
  constructor(source, options) {
    super(options);
  }

  _transform(data, encoding, next) {
    next(null, convertBufferTo1Channel(data));
  }
}

const { Readable } = require('stream');

const SILENCE_FRAME = Buffer.from([0xF8, 0xFF, 0xFE]);

class Silence extends Readable {
  _read() {
    this.push(SILENCE_FRAME);
    //this.destroy();
  }
}

    if(command === 'join-me') {
      var textChannel = message.channel;

      if(message.member.voiceChannel) {
        console.log('has voice channel');
        const connection = await message.member.voiceChannel.join();
        const receiver = connection.createReceiver();
        const googleSpeechClient = new googleSpeech.SpeechClient();

        connection.playOpusStream(new Silence());

        connection.on('speaking', (user, speaking) => {
          console.log('speaking event');
          if(!speaking) { return ;}

          // this creates a 16-bit signed PCM, stereo 48KHz stream
          const audioStream = receiver.createPCMStream(user);
          console.log(audioStream, 'audioStream');
          // const requestConfig = {
          //  encoding: 'LINEAR16',
          //  sampleRateHertz: 48000,
          //  languageCode: 'en-US'
          // }
          // const request = {
          //  config: requestConfig
          // }
          // 
          const request = {
            config: {
              encoding: 'LINEAR16',
              sampleRateHertz: 48000,
              languageCode: 'en-US',
              maxAlternatives: 1,
              metadata: {
                interactionType: 'PHONE_CALL'
              },
              model: 'video',
              useEnhanced: true,
              enableAutomaticPunctuation: true,
              // speechContexts: {
              //  phrases: [
              //    'Voleron'
              //  ]
              // }
            }
          }
          
          const recognizeStream = googleSpeechClient
            .streamingRecognize(request)
            .on('error', console.error)
            .on('data', response => {
              console.log(response, 'response');
              const transcription = response.results
                .map(result => result.alternatives[0].transcript)
                .join('\n')
                .toLowerCase()
                console.log(`Transcription: ${transcription}`)
                textChannel.send(user.username + ': ' + transcription);
          });

          const convertTo1ChannelStream = new ConvertTo1ChannelStream();

          audioStream.pipe(convertTo1ChannelStream).pipe(recognizeStream);

          audioStream.on('end', async () => {
            console.log('audioStream end')
          });

        });

      } else {
        message.channel.send("I can't! You're not in a voice channel!!");
      }
    }

    if(command === 'leave-me') {
      if(message.member.voiceChannel) {
        message.member.voiceChannel.leave();
      }
    }