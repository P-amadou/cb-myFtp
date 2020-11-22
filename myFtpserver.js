const net = require('net')
const fs = require('fs')
const path = require('path')
const process=require('process')
let filepath='./db.json'
let regG=/"/g
let regUser=/(username)/g
let regPass=/(password)/g
let regAlnum=/[^:]\w+/g
let readDB,value
let isValid=false;
let isConnected=false;
let connexion=0
let port=process.argv[2]

const server = net.createServer((socket) => {
//CREER DIR POUR SERVER + USER
let pathDirUser=path.resolve('/ProjetFtp/Users')
let pathDirServer=path.resolve('/ProjetFtp/Server')
let filename,pathToFile,pathToDestination
let pathDirFtp=path.resolve('/ProjetFtp')
  const createDir= (pathDir) => {fs.mkdir(pathDir,{recursive:true},(error)=>{
    if(error){
      console.error('An error occured: ',error);
    } else{
      console.log(`Directory is made or exist. The path: ${pathDir}`);
    }
  })
  }
  createDir(pathDirFtp);
  createDir(pathDirServer);
  createDir(pathDirUser);
  console.log('new connection')

  socket.on('data', (data) => {
    
  readDB=fs.readFileSync(filepath,'utf8').replace(regG,'')
  readDB=readDB.replace(regUser,'')
  readDB=readDB.replace(regPass,'')
  readDB=readDB.match(regAlnum)
  //console.log('contenus readDB: '+readDB+' taille readDB: '+readDB.length);


  //let userPassMap = new Map();
  let tabUser=[],tabPass=[]

  //J'ai recup du fic JSON les username et password et mis dans tab user pour i pair et tab pass pour i impair
  for (let i = 0; i < readDB.length; i++) {
    if (i%2==0) {
      tabUser.push(readDB[i])
    }else{
      tabPass.push(readDB[i])
    }
    //userPassMap.set(tabUser[i],tabPass[i])
    //console.log(`ligne ${i} user: ${userPassMap.get(readDB[i])} + pass: ${userPassMap.get(readDB[i+1])}`);
    /*for (let [key, value] of userPassMap) {
      console.log(`${key} = ${value}`);
    }*/
  }
    
    //Maintenant vérif pour client USER 
    
    // check if user exist in database A FAIRE
    // if true affiche user connecte donne acces au autres commandes
    let [directive, parameter] = data.toString().split(' ')
    console.log(data.toString())
    let user,lastIdx
    let tab=[]
    function getUserPassIdx() {
      let idx
      //console.log("PARAM: "+parameter);
      if(tabUser.includes(parameter)==true||tabPass.includes(parameter)==true){
        user=parameter
        idx=tabUser.indexOf(user)
      }else{
        console.log('Problem getUserPassIdx');
      }
      return idx
    }
    function callback(err) {
      if (err) throw err;
      console.log('File was copied');
    }

    switch(directive) {
      case 'USER':
        if(tabUser.includes(parameter)==true){

        //console.log('User: '+user);
        //console.log('index user '+getUserPassIdx());
        socket.write(`user: ${parameter} reconnu`)
        isValid=true
        socket.write(`Saisis ton mot de passe`)
        }else{
        socket.write(`user: ${parameter} pas reconnu. Veuillez retester`)
        }
        break;
      case 'PASS':
        //console.log('index pass '+tabPass.indexOf(parameter));
        //console.log('index user '+getUserPassIdx());
        //console.log('tab: '+tab);
        
        if (tabPass.includes(parameter)==true&&isValid==true) {
          //console.log('param'+parameter+' User: '+user);
          for (let j = 0; j < tabUser.length; j++) {
            //console.log(`Index:${j} tab user: ${tabUser[j]} et tabPass: ${tabPass[j]}`) Parcours tab user et tab pass et affiche res
            if(getUserPassIdx()==tabUser.indexOf(parameter)||getUserPassIdx()==tabPass.indexOf(parameter)){
              isConnected=true
              parameter=tabUser[j]
              //console.log('value param: '+parameter);
            }
          }
          socket.write(`password validé`)
          socket.write(`Vous êtes connecté`)  
          connexion++
          console.log(`NB connexion:${connexion}`);
          tab.push(path.join(pathDirUser,parameter))
          value=path.join(pathDirUser,parameter)
          //console.log('tab: '+tab+' value: '+value);
          createDir(path.join(pathDirUser,parameter))
        }else{
          socket.write(`password pas reconnu ou vous n'avez pas saisie le username`)
          isConnected=false
        }
        break;

        case 'LIST':
          if (isConnected==true) {
            //UTILISER DIR CREE
          console.log('tab:'+value);
          let files=fs.readdirSync(value)
          console.log(process.cwd());
           files.forEach(file => {
            socket.write(`\n${file}`)
           });
            console.log(`Contenu Current Dir affiché au client`);
          }else{
            socket.write(`Vous êtes pas connecté`)
          }
          break;
  
      case 'CWD':
        if (isConnected==true) {
          let newWorkingDir=parameter
          console.log(`Starting directory: ${process.cwd()}`);
          try {
            process.chdir(newWorkingDir);
            console.log(`New directory: ${process.cwd()}`);
          } catch (err) {
            console.error(`chdir: ${err}`);
          }
          /*socket.cwd(newWorkingDir,(error)=>{
            if(error){
              console.error('An error occured: ',error);
            }*/

          socket.write(`Directory changé pour : ${newWorkingDir}`)
          console.log('CWD : '+newWorkingDir);
        }else{
          socket.write(`Vous êtes pas connecté`)
        }
        break;

      case 'RETR':
        if (isConnected==true) {
          filename=parameter
          pathToFile=path.join('P:\ProjetFtp\Server',filename)
          pathToDestination=path.join(value,"copy",filename)
          fs.copyFile(pathToFile,pathToDestination, callback);
          socket.write(`file ${filename} copied`)
          console.log(`file copied ${filename}`);
        }else{
          socket.write(`Vous êtes pas connecté`)
        }
        break;
        
      case 'STOR':
        if (isConnected==true) {
          pathToFile=path.join(value,filename)
          pathToDestination=path.join('P:\ProjetFtp\Server',"copy",filename)
          fs.copyFile(pathToFile,pathToDestination, callback);
          socket.write(`file ${filename} copied`)
          console.log(`file copied ${filename}`);
        }else{
          socket.write(`Vous êtes pas connecté`)
        }
        break;

      case 'PWD':
        //En gros process.cwd
        if (isConnected==true) {
          let currentDir
          currentDir=path.dirname(value)
          socket.write(`Current directory: ${currentDir}`)
          console.log(`Current dir: ${currentDir}`);
        }
        break;

      case 'HELP':
        switch (parameter) {
          case 'USER':
            socket.write(`USER <username>: check if the user exist`)
            break;
          case 'PASS':
            socket.write(`PASS <password>: authenticate the user with a password`)
            break;
          case 'LIST':
            socket.write(`LIST: list the current directory of the server`)
            break;
          case 'CWD':
            socket.write(`CWD <directory>: change the current directory of the server`)
            break;
          case 'RETR':
            socket.write(`RETR <filename>: transfer a copy of the file FILE from the server to the client`)
            break;
          case 'STOR':
            socket.write(`STOR <filename>: transfer a copy of the file FILE from the client to the server`)
            break;
          case 'PWD':
            socket.write(`PWD: display the name of the current directory of the server`)
            break;
          case 'QUIT':
            socket.write(`QUIT: close the connection and stop the program`)
            break;
          default:
            socket.write(`Syntaxe: HELP <nom commande>`)
            break;
        }
      break;

      case 'QUIT':
        //action pour déco un client
        if(isConnected==true){
          socket.write(`Vous avez été déconnecté`)
          socket.end() 
          connexion--
          console.log( `user: ${parameter} is disconnected. Nb user connected: ${connexion}`)
          if (connexion==0) {
            server.close()
          } 
        }else{
          socket.write(`Vous n'êtes pas connecté`)
        }
        break;

      default:
        socket.write(`Commande saisie non valide. Vérifiez avec la commande HELP`)
        break;
      
    } 
  })
  //socket.write('Hello from server')
})

server.listen(port, () => {
  if (port==undefined) {
    console.log(`Syntaxe: node myFtpserver.js <PORT>`);
    server.close()
  }else{
    console.log(`Server started at port ${port}`)
  }
})