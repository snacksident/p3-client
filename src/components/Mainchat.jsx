import { useState, useEffect, useRef } from "react"
import axios from "axios"
import Message from "./Message"
import FormChatBar from "./FormChatBar"

export default function Mainchat({ currentUser }) {

  const [form, setForm] = useState({
    content: ''
  })

  const scrollRef = useRef()
  const [msgs, setMsgs] = useState([])

  useEffect(() => {
    (async () => {
      try { 
        const response = await axios.get(`${process.env.REACT_APP_SERVER_URL}/api-v1/timeline`)
        // set the data from the server in state
        console.log(response.data.messages)
        setMsgs(response.data.messages)
      } catch (err) {
        console.log(err)
      }
    })()
   }, [])

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth"})
  }, [msgs])
  
  const handleSubmitTimeline = async (e) => {
    e.preventDefault()

    const token = localStorage.getItem('jwt')
    console.log(token)

    const options = {
      headers: {
        'Authorization': token
      }
    }
    try {
      const response = await axios.post(`${process.env.REACT_APP_SERVER_URL}/api-v1/timeline/addmessage`, form, options)
      console.log(response)
    } catch (error) {
      
    }
    console.log('form data', form)
  }

  const showMessage = <div className="show-message-wrapper"><h4>Please log in or register to chat!</h4></div> 


  const mappedMsgs = msgs.map((message, i) => {
    return <div ref={scrollRef} key={`message-${i}`}> <Message name={message.author.name} content={message.content} createdAt={message.createdAt} avatar={message.avatar} /></div>
  })

  // React scroll to End of a div

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