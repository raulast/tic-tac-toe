const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const room = urlParams.get('room')
const __= (q)=>(document.querySelector(q))
const _all_= (q)=>(document.querySelectorAll(q))
const infoArea = __('.info')
const dialog = __('dialog')
const cells = _all_('.cell')
const sc = __('.counter')
const ba = __('.boton-abandonar')
ba.addEventListener('click',closeDialog)

const mark = (c)=>(c?"⭕":"✖️")
const game = {
    p0:{
        session_id:null,
        name:"player1",
        score:0,
        circle:false,
        moves:[]
    },
    p1:{
        session_id:null,
        name:"player2",
        score:0,
        circle:true,
        moves:[]
    },
    play:0,
    move:0
}

const updateInfo = (winner=null)=>{
    infoArea.innerHTML = `<b>Room: </b>${room||'local'}`
    infoArea.innerHTML += `<br><b>Player [${mark(game.p0.circle)}]: </b>${game.p0.name} [${game.p0.score}] ${(winner==="p0"&&"GANADOR") || (winner==="pp"&&"EMPATE") || ""}`
    infoArea.innerHTML += `<br><b>Player [${mark(game.p1.circle)}]: </b>${game.p1.name} [${game.p1.score}] ${(winner==="p1"&&"GANADOR") || (winner==="pp"&&"EMPATE") || ""}`
    infoArea.innerHTML += `<br><b>Play: </b>${mark(game[`p${game.play}`].circle)}`
    console.log('@game',game);


}

function filterMSG(hash,msg){
    if(`${hash}`===`${room}`){
        game.p0.session_id = msg.p0.session_id
        game.p1.session_id = msg.p1.session_id
        game.p0.score = msg.p0.score
        game.p1.score = msg.p1.score
        const mov = msg[`p${msg.play?0:1}`].moves
        // game[`p${msg.play?0:1}`].moves = mov;
        console.log('@moves',mov[mov.length-1]-1);
        processMove(mov[mov.length-1]-1,msg[`p${msg.play?0:1}`].session_id)
    }
}

function setplayer1(){
    if(!game.p0.session_id){
        game.p0.session_id = mySessionId()
    }
}
function setplayer2(ssid){
    game.p1.session_id = ssid
}

function regresivo(sec=null,counter= 5){
    const now = new Date();
    const second = now.getSeconds()
    if(sec !== second){
        console.log(counter);
        sc.innerHTML = `${counter}<br/>`;
        counter = counter-1
    }
    
    if(counter>=0){
        requestAnimationFrame(()=>{regresivo(second,counter)})
    }else{
        closeDialog()
    }
}

function closeDialog(){
    dialog.close()
}

function reiniciar(){
    game.p0.moves=[];
    game.p1.moves=[];
    cells.forEach((c,i)=>{
        c.innerHTML = ""
        c.style = ""
        c.addEventListener('click',()=>{
            if(c.innerHTML === ""){
                processMove(i);
            }
        })
    })
    updateInfo();
}

const processMove = (i,ssid=mySessionId()) => {
    
    if(!(game.p0.session_id && game.p1.session_id)&& !room){
        return ;
    }
    console.log('@i',i);
    const cell = cells[i]
    const pkey = `p${game.play}`
    const player = game[pkey]
    if(player.session_id === ssid||!room){
        game[pkey].moves.push(i+1)
        cell.innerHTML = `${mark(player.circle)}`
        const _won = won(player.moves);
        game.move += 1
        game.play = game.move%2
        if(_won.length === 3){
            _won.forEach((t)=>{cells[t-1].style.backgroundColor = "red"})
            updateInfo(pkey);
            dialog.show();
            regresivo();
            setTimeout(()=>{
                game[pkey].score += 1
                game.move -= 1
                game.play = game.move%2
                updateInfo(pkey);
                reiniciar()
            },5000)
        }else{
            if(game.p0.moves.length >= 5 || game.p1.moves.length >= 5){
                cells.forEach((t)=>{t.style.backgroundColor = "gray"})
                updateInfo("pp")
                dialog.show();
                regresivo();
                setTimeout(reiniciar,5000)
            }
        }
        console.log(game[`p${game.play}`].session_id,`${room}::${JSON.stringify(game)}`)
        sendToPeer(game[`p${game.play}`].session_id,`${room}::${JSON.stringify(game)}`)
    }
}

const won = (moves)=>{
    if(multipleInArray(moves,[1,2,3])){return[1,2,3]}
    if(multipleInArray(moves,[4,5,6])){return[4,5,6]}
    if(multipleInArray(moves,[7,8,9])){return[7,8,9]}
    if(multipleInArray(moves,[1,4,7])){return[1,4,7]}
    if(multipleInArray(moves,[2,5,8])){return[2,5,8]}
    if(multipleInArray(moves,[3,6,9])){return[3,6,9]}
    if(multipleInArray(moves,[1,5,9])){return[1,5,9]}
    if(multipleInArray(moves,[3,5,7])){return[3,5,7]}
    return []
}

const multipleInArray = (arr, values) => {
    return values.every(value => {
      return arr.includes(value);
    });
  }
updateInfo();
reiniciar();
window.startp('wss://ransato-wss.onrender.com/tic-tac-toe')