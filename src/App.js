import logo from './logo.svg';
import heart from './heart.svg';
import qrt from './qrt.svg'
import './App.css';
import React, {useState, useEffect, useRef} from 'react';
import { db } from './FirebaseConfig';
// import { collection, getDocs, addDoc, doc, setDoc, getDoc, updateDoc, deleteDoc, usersCollectionRef } from 'firebase/firestore'; // full import list
import { doc, collection, addDoc, getDocs, getFirestore, usersRef, updateDoc, onSnapshot } from 'firebase/firestore';

//change mode to see different pages (currently 1-2)
let content

let currentRoom
let playerName
let playerSentence
let misinfo = false
let playerWord = ""
let playerWordInto = ""
let docId
let currentTweet

await GetFact()

/*if (mode === 0) {
  content = <Template/>;
} else if (mode === 1) {
  content = <Test/>
} else if (mode === 2) {
  content = <GameScreen/>
} else if (mode === 3) {
  content = <ResultsScreen/>
} else if (mode === 4) {
  content = <GuessingScreen/>
} else if (mode === 5) {
  content = <SentenceScreen/>
} else if (mode === 6) {
  content = <WaitingRoom/>
}*/

// let currentPlayer

function App() {
  return (
    <header>
      <Test/>
    </header>
  );
}


function Template() {
  return (
  <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  )
}

async function FindRoom(code) {

  let foundRoom = false

  const roomsRef = collection(db, 'rooms');
  const querySnapshot = await getDocs(roomsRef);


  const rooms = querySnapshot.docs.filter(doc => doc.data().code === code);

  rooms.forEach(doc => {

    console.log(doc.id, '=>', doc.data());

    docId = doc.id

    foundRoom = true
  });

  return foundRoom

}

function Test() {

  const [mode, setMode] = useState(0)

  const roomCode = CreateRoomCode()

  const [usernick, setUsernick] = useState("Nickname")
  const [userroom, setUserroom] = useState("Room Code")

  let roomExists
  
  const onSubmit =  async () => {
    let result = await FindRoom(userroom)
    roomExists = result
    console.log("Room Exists" + roomExists)
    if (roomExists === true) {
      setMode((mode) => 2)
      currentRoom = userroom
      playerName = usernick
    }
  }

  if (mode === 0) {
  return (
    <div className='App'>
      <header className='App-header'>
        <div className='App-main'>
          <img src={logo} className="App-logo" alt="logo"/>
          <p></p>
        </div>
        <div className='App-login'>
          <p>
            Enter Nickname:
          </p>
            <TextBox Text={usernick} onChange={setUsernick}/>
          <p>
            Enter Room Code:
          </p>
            <TextBox Text={userroom} onChange={setUserroom}/>
            <p></p>
          <SubmitButton text="Submit" onClick={onSubmit}/>

          <h1 onClick={() => {setMode((mode) => 1); currentRoom = roomCode}}>I wanna create a room!</h1>
        </div>
      </header>
    </div>
  )
  } else if (mode === 1) {
    CreateRoom(roomCode);
    return(
      <HostView code = {roomCode}/>
    )
  } else if (mode === 2) {

    return (
      <PlayerView code = {currentRoom}/>
    )
  }
}

async function GetFact() {
  fetch("https://api.api-ninjas.com/v1/facts", {
    method: 'GET',
    headers: {
      'X-Api-Key': 'EXAzcMDf+0tZX3NnnqiAeA==RzNYD4WRWPqtHy2z',
    },
  })
  .then((response) => response.json())
  .then((json) => {playerSentence = json[0].fact
  console.log(playerSentence)
  } );
}

function CreateRoomCode() {
  let length = 5
  let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
      counter += 1;
    }
    roomTweet.content = "Room code is: " + result 
    return result;

}

function SubmitButton ({text, onClick}) {
  return (
    <div className='Submit-Button'>
      <button className='button' onClick = {onClick}>{text}</button>
    </div>
  )
}

function TextBox ({Text, onChange, extra}) {

  const [value, setValue] = useState(Text);

  const handleFocus = () => {
    if (value === null || value === Text) {
      setValue('');
    }
  };

  const handleUnfocus = () => {
    if (value === "") {
      setValue(Text)
    }
  }

  return (
    <input className='textbox' value = {value} onFocus={handleFocus} onChange={(e) => {setValue(e.target.value); onChange(e.target.value)} } onBlur={handleUnfocus}/>
  )
}

function Player (nickname, profilePicture) {
  this.nickname = nickname
  this.pfp = profilePicture
  this.score = 0
}

function Tweet (content, author) {
  this.author = author
  this.content = content
  this.misinfo = false
  this.likes = 0
  this.quoteretweets = 0
}

let henry = new Player("e.long.tusk", logo)
let roomTweet = new Tweet("Room code is:", henry)

function WaitingTweet({tweet}) {
  return (
    <div className="Tweet">
      <div className="Tweet-profile">
        <img src={tweet.author.pfp} alt="logo" height={220} width={220}/>
        <h3>@{tweet.author.nickname}</h3>
      </div>
      <h3 className="Tweet-content">{tweet.content}</h3>
    </div>
  )
}

function HostView({code}) {


  const [mode, setMode] = useState(0)
  FindRoom(code)

  if (mode === 0) {
    return(
      <WaitingRoom extra={() => setMode(1)}/>
    )
  } else if (mode === 1) {
    return (
      <GameScreen/>
    )
  } else if (mode === 2) {
    return(
      <ResultsScreen/>
    )
  }
}


async function CheckForRound() {

  let foundRoom = false
  let code = "balls"

  const roomsRef = collection(db, 'rooms');
  const querySnapshot = await getDocs(roomsRef);


  const rooms = querySnapshot.docs.filter(doc => doc.data().code === code);

  rooms.forEach(doc => {

    console.log(doc.id, '=>', doc.data());

    docId = doc.id

    foundRoom = true
  });

  return foundRoom
}

function PlayerWaiting( {onGuessBegin} ) {

  const [fieldChanged, setFieldChanged] = useState(false);


  useEffect(() => {

    const unsubscribe = onSnapshot(doc(db, 'rooms', docId), (doc) => {

      // Check if the specific field has changed

      if (doc.data().round !== 0) {

        setFieldChanged(true);

        console.log("round changed to: " + fieldChanged)
        // You can also update previousFieldValue here for the next comparison

        sentence = doc.data().currentSentence

        onGuessBegin(2)

      }

    });


    return () => unsubscribe(); // Clean up the listener on component unmount

  }, [fieldChanged]);

  return (
    <div className="App">
      <div className="App-header">
        <h1>Waiting for others...</h1>
      </div>
    </div>
  )
}

function PlayerView({code}) {

  const [mode, setMode] = useState(0)

  FindRoom(code)
  

  //SquidGame(setMode(1))

  if (mode === 0) {
    return(
      <SentenceScreen sentence={playerSentence} changeMode={setMode}/>
    )
  } else if (mode === 1) {
    return (
      <PlayerWaiting onGuessBegin={setMode}/>
    )
  } else if (mode === 2) {
    return (
      <GuessingScreen/>
    )
  }
}

async function StartGame() {
  const docRef = doc(db, "rooms", docId);

  const playersRef = collection(db, "rooms", docId, "players")
  const querySnapshot = await getDocs(playersRef);

  const rooms = querySnapshot.docs

  rooms.forEach(doc => {

    console.log(doc.id, '=>', doc.data().sentence);

    newTweet.content = doc.data().sentence.replace(doc.data().wordChanged, doc.data().wordChangedInto);
    newTweet.author.nickname = doc.data().nickname;

  });

  try {
    await updateDoc(docRef, {
      round: 1,
      currentSentence: newTweet.content
    });

    console.log("Document updated successfully!");
  } catch (error) {
    console.error("Error updating document: ", error);
  }
}

function WaitingRoom({extra}) {

  const handleClick = async () => {
    await StartGame()



    extra()
  }

  return(

    <div className="App">
      <header className='App-header'>
        <div className="Waiting-Room">
          <WaitingTweet tweet={roomTweet}/>
          <SubmitButton text="Start Game" onClick={handleClick}/>
        </div>
      </header>
    </div>
  )
}

function GameScreen() {

  const [startPopup, setStartPopup] = useState(false);
  const timer = useRef(null);

  useEffect(() => {

    if (startPopup) {
      timer.current = setInterval(() => setStartPopup((startPopup) => !startPopup), 3 * 1000);
    }

    return () => {
      clearInterval(timer.current);
    };
  }, [startPopup]);

  return (
    <div className="App">
      <header className='App-header'>
      <Popup author= {newPopupPlayer} startPopup={startPopup}/>
        <div className="Game-Screen">
          <TweetInterface tweet={newTweet}/>
          <button onClick={() => {
            if (startPopup === false) {
              setStartPopup(true);
              console.log(startPopup)
            } 
          }}>Toggle Notification</button>
        </div>
      </header>
    </div>
  )
}

async function CreateRoom(code) {

  const matchDocument = {
    code: code,
    round: 0
  };

  try {
    const docRef = await addDoc(collection(db, 'rooms'), matchDocument);
    console.log('Document written with ID: ', docRef.id);
  } catch (error) {
    console.error('Error adding document: ', error);
  }
}


async function CreatePlayer(Nickname) {

  const playerDoc = {
    nickname: Nickname,
    sentence: playerSentence,
    misinfo: misinfo,
    wordChangedInto: playerWordInto,
    wordChanged: playerWord
  };

  try {
    const roomDoc = doc(db, 'rooms', docId);
    const docRef = await addDoc(collection(roomDoc, 'players'), playerDoc);
    console.log('Document written with ID: ', docRef.id);
  } catch (error) {
    console.error('Error adding document: ', error);
  }
}

let newPlayer = new Player("bobster", logo)
let newPopupPlayer = new Player("bobert", logo)
let newTweet = new Tweet("bobert is very smelly and only cares about himself", newPlayer)
let sentence = "Smoking is bad for you."

function TweetInterface({tweet}) {

  return (
    <div className="Tweet">
      <div className="Tweet-profile">
        <img src={tweet.author.pfp} alt="logo" height={220} width={220}/>
        <h3>@{tweet.author.nickname}</h3>
      </div>
      <h2 className="Tweet-content">{tweet.content}</h2>
      <hr/>
      <div className="Tweet-stats">
        <div className="stat-element">
          <img src={heart} alt="heart" height={150} width={150}/>
          <p>{tweet.likes}</p>
        </div>
        <div className="stat-element">
          <img src={qrt} alt="quote retweet" height={150} width={150}/>
          <p>{tweet.quoteretweets}</p>
        </div>
      </div>
    </div>
  )
}

function Popup ({author, startPopup}) {
  let transitionProperties = startPopup ? {marginTop: '-600px'} : {};

  return (
    <div className="Popup" style={transitionProperties}>
      <div className="Popup-profile">
        <img src={author.pfp} alt="logo" height={100} width={100}/>
          <h3>@{author.nickname}</h3>
      </div>
      <h1>This is NOT true!</h1>
    </div>
  )
}

function ProfileView({author}) {
  
  return (
    <div>
      <div className='Profile-View'>
        <img src={author.pfp} alt="" height={80} width={80}/>
        <p>@{author.nickname}</p>
      </div>
      <hr/>
    </div>
  )
}

function LikeList() {

  let list = [newPlayer, newPopupPlayer, newPlayer,newPlayer,newPlayer,newPlayer,newPlayer,newPlayer,newPlayer,newPlayer]

  return (
    <div className='Result-Likes'>
      <div className='Result-Likes-Title'>
        <img src={heart} height={60} width={60}/>
        <h1>Likes:</h1>
      </div>
      {list.map(element => (
        <ProfileView author={element}/>
      ))}
    </div>
  )
}

function QuoterProfile({author}) {

  return (
    <div className='Qrt'>
      <div className='Quoter-Profile'>
        <img src={author.pfp} height={80} width={80}/>
        <h3>@{author.nickname}</h3>
      </div>
      <p>I don't believe you.</p>
      <div className='Current-Tweet'>
        <div className='Quote-Profile'>
          <img src={newTweet.author.pfp} height={80} width={80}/>
          <h4>{newTweet.author.nickname}</h4>
        </div>
        <p>{newTweet.content}</p>
      </div>
      <hr/>
    </div>
  )
}

function RetweetList() {

  let list = [newPlayer, newPopupPlayer, newPlayer]

  return (
  <div className='Result-QRetweets'>
    {list.map(element => (
        <QuoterProfile author={element}/>
    ))}
    
  </div>)
}

function ResultsScreen() {
  let LikedList = null
  let QrtList = null

  return (
    <div className="App">
      <div className="App-header">
        <div className='Results-Screen'>
          <RetweetList/>
        </div>
      </div>
    </div>
  )
}

function Guess({word}) {
    return (
      <div className="Guess-Word">
        <h2>{word}</h2>
      </div>
    )
  
}

function GuessingScreen() {

  let ActualSentence = sentence.split(" ")

  const [isMisinfo, setIsMisinfo] = useState(false)

  const [guess, setGuess] = useState("")

  function GuessingWord({word}) {
  
    return (
      <h1 onClick={() => {
        console.log(word)
        if (guess === word) {
          setGuess("")
          setIsMisinfo(false)
        } else {
          setGuess(word)
          setIsMisinfo(true)
        }
      }}>{word}</h1>
    )
  }

  if (isMisinfo === true) {
    return (

      <div className="App">
        <div className="App-header">
          <div className='Guessing-Screen'>
            <div className="Sentence">
              {ActualSentence.map(element => (
                <GuessingWord word={element}/>
              ))}
            </div>
            <Guess word={guess}/>
            <SubmitButton text="This word is wrong!"/>
          </div>
        </div>
      </div>
    )
  } else {
    return (
      <div className="App">
        <div className="App-header">
          <div className='Guessing-Screen'>
            <div className="Sentence">
              {ActualSentence.map(element => (
                <GuessingWord word={element}/>
              ))}
            </div>
            <SubmitButton text="Seems about right."/>
          </div>
        </div>
      </div>
    )
  }
}

function SentenceScreen({sentence, changeMode}) {

  let APISentence = sentence.split(" ")

  const [selected, isSelected] = useState("")
  const [wordSelected, setWordSelected] = useState(false)

  const [changedWord, setChangedWord] = useState("Change word to...")

  function SentenceWords({word}) {

    let properties
    if (selected === word) {
      properties = {color: 'red'}
    } else {
      properties = {}
    }
  
    return (
      <div className="API-Sentence">
        <h1 onClick={() => {
            if (word === selected) {
              isSelected((selected) => "")
              setWordSelected((wordSelected) => false)
            } else {
              isSelected((selected) => word)
              setWordSelected((wordSelected) => true)
            }
          }
        } style={properties}>{word}</h1>
      </div>
    )

  }

  if (wordSelected) {
    return (
      <div className="App">
        <div className="App-header">
          <div className='Sentence-Screen'>
            <div className='Sentence'>
              {APISentence.map(element => (
                <SentenceWords word={element}/>
              ))}
            </div>
            <div className='Word-Text'>
              <TextBox Text={changedWord} onChange={setChangedWord}/>
              <SubmitButton text="I want to share misinformation." onClick={() => {
                  misinfo = true
                  playerWordInto = changedWord
                  playerWord = selected
                  CreatePlayer(playerName)
                  changeMode(1)
                }}/>
            </div>
          </div>
        </div>
      </div>
    )
  } else {
    return (
    <div className="App">
        <div className="App-header">
          <div className='Sentence-Screen'>
            <div className='Sentence'>
              {APISentence.map(element => (
                <SentenceWords word={element}/>
              ))}
            </div>
            <SubmitButton text="I want to share the truth." onClick={() => {CreatePlayer(playerName); changeMode(1)}}/>
          </div>
        </div>
      </div>
    )
  }
}

export default App;