const net = require('net')
const readline = require('readline');
const client = new net.Socket()
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
let input1,input2
client.connect(5000, '127.0.0.1', () => {
  console.log('connected')
  rl.on('line',(line)=>{
    client.write(line)

  })
  client.write('Hi server from client')
  
})

client.on('data', (data) => {
  console.log(data.toString())
 
})
