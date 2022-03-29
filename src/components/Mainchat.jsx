import React from "react"
import { useState, useEffect, useRef } from "react"
import axios from "axios"
import Message from "./Message"
import FormChatBar from "./FormChatBar"
// import jwtDecode from "jwt-decode"
import { io, Socket } from "socket.io-client"


export default function Mainchat({ currentUser }) {
  // console.log(currentUser)
  const [form, setForm] = useState({
    content: ''
  })
  
  const scrollRef = useRef()
  const [msgs, setMsgs] = useState([])
  const [ displayMsg, setDisplayMsg ] = useState('')
  // const [socketConnected, setSocketConnected] = useState(false)
  
  console.log(msgs)

  useEffect(() => {
    if (currentUser) {
      
    }
    const setMessages = async () => {
      try { 
        const response = await axios.get(`${process.env.REACT_APP_SERVER_URL}/api-v1/timeline`)
        // set the data from the server in state
        console.log(response.data.messages)
        setMsgs(response.data.messages)
      } catch (err) {
        console.log(err)
      }
    }
    setMessages()
  }, [])

  
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth"})
  }, [msgs])
  
  const handleSubmitTimeline = async (e) => {
    e.preventDefault()

    const token = localStorage.getItem('jwt')
    
    const options = {
      headers: {
        'Authorization': token
      }
    }
    try {
      const response = await axios.post(`${process.env.REACT_APP_SERVER_URL}/api-v1/timeline/addmessage`, form, options)
      const socket = io("http://localhost:4004") // connection to the server with socket
      socket.on('connect', () => {
        // console.log(`You connected with id ${Socket.id}`)
        socket.emit('send-message', form.content)
        socket.on("received-message", string => {
          console.log("from the client ", string)
          msgs.push(string)
        })
      })
      // console.log(response)
    } catch (error) {
      console.log(error)
    }
    // console.log('form data', form)
  }


  const showMessage = <div className="show-message-wrapper"><h4>Please log in or register to chat!</h4></div> 


  const mappedMsgs = msgs.map((message, i) => {
    return <div ref={scrollRef} key={`message-${i}`}> <Message name={message.author.name} content={message.content} createdAt={message.createdAt} avatar={message.avatar} userId={message.author._id} currentUser={currentUser} own={currentUser ? message.author._id === currentUser.id : false}/></div>
  })

  return (
    <div className="main-chat-wrapper">
      <div className="main-chat-inner-wrapper">
        <div className="form-post">
          <div className="people-online-wrapper">
            <div className="people-online-wrapper-details">
              <div className="dot-online"></div>
              <h4 className="people-online">42 Users online</h4>
            </div>
            <h4 className="people-online">Main Chatroom</h4>
          </div>
          <div className="convo">
            {mappedMsgs}
            {displayMsg}
            {/* <Message />
            <Message own={true}/>
            <Message />
            <Message />
            <Message />
            <Message />
            <Message />
            <Message />
            <Message />
            <Message />
            <Message />
            <Message own={true}/>
            <Message />
            <Message /> */}
          </div>
          {currentUser ? <FormChatBar handleSubmitTimeline={handleSubmitTimeline} setForm={setForm} form={form}/> : showMessage }
          
        </div>
      </div>
    </div>
  )
}
