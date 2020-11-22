const net = require('net')
const readline = require('readline');
const client = new net.Socket()
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});
let host=process.argv[3]
let port=process.argv[2]

  client.connect(port,host, () => {
    console.log('connected')
    rl.on('line',(line)=>{
      client.write(line)
  
    })
    //client.write('Hi server from client')
    
  })
  
  client.on('data', (data) => {
    console.log(data.toString())
   
  })
  console.log(`Rappel syntaxe: node myFtpserver.js <PORT> <HOST>`);


