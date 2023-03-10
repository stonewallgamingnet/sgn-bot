// if(command === 'generategif') {
//     var encoder = new GIFEncoder(100, 100);
//     encoder.start();
//     encoder.setRepeat(-1);
//     encoder.setDelay(1000);

//     var canvas = Canvas.createCanvas(100, 100);
//     var ctx = canvas.getContext('2d');

//     ctx.font = '30px sans-serif'; // check default Discord font
//     // ctx.fillText('Hi', 35, 35);
    
//     for (var i = 10; i >= 0; i--) {
//         ctx.fillStyle = '#32363c';
//         ctx.fillRect(0, 0, 100, 100);

//         ctx.fillStyle = '#dcddde';
//         ctx.fillText(i, 35, 35);
//         encoder.addFrame(ctx);
//     }

//     encoder.finish();

//     const attachment = new Discord.Attachment(encoder.out.getData(), 'countdown.gif');
//     message.channel.send({
//         embed: {
//             title: 'Testing GIFEncoder',
//             image: {
//                 url: 'attachment://countdown.gif'
//             }
//         },
//         files: [attachment]
//     });
// }