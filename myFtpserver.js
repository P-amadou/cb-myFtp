const net = require('net')
const fs = require('fs')
const path = require('path')
let filepath='./db.json'
let regG=/"/g
let regUser=/(username)/g
let regPass=/(password)/g
let regAlnum=/[^:]\w+/g
let readDB

const server = net.createServer((socket) => {
  console.log('new connection')

  socket.on('data', (data) => {
    const [directive, parameter] = data.toString().split(' ')
    console.log(data.toString())
    
    readDB=fs.readFileSync(filepath,'utf8').replace(regG,'')
    readDB=readDB.replace(regUser,'')
    readDB=readDB.replace(regPass,'')
    readDB=readDB.match(regAlnum)
    console.log('contenus readDB: '+readDB+' taille readDB: '+readDB.length);
    let userPassMap = new Map();

    for (let i = 0; i < readDB.length-1; i++) {
      userPassMap.set(readDB[i],readDB[i+1])
      //console.log(`ligne ${i} user: ${userPassMap.get(readDB[i])} + pass: ${userPassMap.get(readDB[i+1])}`);
      for (let [key, value] of userPassMap) {
        console.log(`${key} = ${value}`);
      }
    }

    //tester de faire hashmap key username et value password  VALIDER marche partiellement PB pour dernière valeur il met dans key et non value test key and value partiellement réussi aussi
    // check if user exist in database = hashmap A FAIRE
    // if true affiche user connecte donne acces au autres commandes
    switch(directive) {
      case 'USER':
        socket.write(` user: ${parameter} successfuly connected`)
        break;

      case 'QUIT':
        //action pour déco un client
        console.log( `user: ${parameter} is disconnected`)
        break;
    } 
  })
  socket.write('Hello from server')
})

server.listen(5000, () => {
  console.log('Server started at port 5000')
})