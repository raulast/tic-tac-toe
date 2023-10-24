const __= (q)=>(document.querySelector(q))
const _all_= (q)=>(document.querySelectorAll(q))
const infoArea = __('.info')
const cells = _all_('.cell')

const mark = (c)=>(c?"⭕":"✖️")
const game = {
    p0:{
        name:"player1",
        score:0,
        circle:false,
        moves:[]
    },
    p1:{
        name:"player2",
        score:0,
        circle:true,
        moves:[]
    },
    play:0,
    move:0
}

const updateInfo = (winner=null)=>{
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    const room = urlParams.get('room')
    infoArea.innerHTML = `<b>Room: </b>${room||'local'}`
    infoArea.innerHTML += `<br><b>Player [${mark(game.p0.circle)}]: </b>${game.p0.name} [${game.p0.score}] ${(winner==="p0"&&"GANADOR") || (winner==="pp"&&"EMPATE") || ""}`
    infoArea.innerHTML += `<br><b>Player [${mark(game.p1.circle)}]: </b>${game.p1.name} [${game.p1.score}] ${(winner==="p1"&&"GANADOR") || (winner==="pp"&&"EMPATE") || ""}`
    infoArea.innerHTML += `<br><b>Play: </b>${mark(game[`p${game.play}`].circle)}`
}

const reiniciar = ()=>{
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

const processMove = (i) => {
    const cell = cells[i]
    const pkey = `p${game.play}`
    game[pkey].moves.push(i+1)
    const player = game[pkey]
    cell.innerHTML = `${mark(player.circle)}`
    const _won = won(player.moves);
    if(_won.length === 3){
        game[pkey].score += 1
        _won.forEach((t)=>{cells[t-1].style.backgroundColor = "red"})
        updateInfo(pkey);
        setTimeout(reiniciar,5000)
    }else{
        game.move += 1
        game.play = game.move%2
        console.log(game.move);
        if(game.p0.moves.length >= 5 || game.p1.moves.length >= 5){
            cells.forEach((t)=>{t.style.backgroundColor = "gray"})
            updateInfo("pp")
            setTimeout(reiniciar,5000)
        }
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
