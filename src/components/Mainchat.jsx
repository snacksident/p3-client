import React from "react"
import { useState, useEffect, useRef } from "react"
import axios from "axios"
import Message from "./Message"
import FormChatBar from "./FormChatBar"
import { io } from "socket.io-client"
let socket

export default function Mainchat({
    currentUser,
    setClickedUserData,
    clickedUserData,
    clickedUserProfile,
    setClickedUserProfile,
}) {
    const [form, setForm] = useState({
        content: "",
    })
    const scrollRef = useRef()
    const [msgs, setMsgs] = useState([])
    const [socketState, setSocketState] = useState(false)

    useEffect(() => {
        const setMessages = async () => {
            try {
                socket = io(process.env.REACT_APP_SOCKET_URL)
                socket.on("connect", () => {
                    setSocketState(true)
                })
                socket.on("recieved all data", async (allData) => {
                    const messages = await axios.get(
                        `${process.env.REACT_APP_SERVER_URL}/api-v1/timeline/`
                    )
                    setMsgs(messages.data.messages)
                })
                const response = await axios.get(
                    `${process.env.REACT_APP_SERVER_URL}/api-v1/timeline/`
                )
                // set the data from the server in state
                setMsgs(response.data.messages)
            } catch (err) {
                console.log(err)
            }
        }
        setMessages()
    }, [socketState])
    //useeffect to keep page on bottom of chat
    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [msgs])

    const handleSubmitTimeline = async (e) => {
        e.preventDefault()
        //grab the token to pass for auth
        const token = localStorage.getItem("jwt")
        const options = {
            headers: {
                Authorization: token,
            },
        }
        try {
            const response = await axios.post(
                `${process.env.REACT_APP_SERVER_URL}/api-v1/timeline/addmessage`,
                form,
                options
            )

            socket.emit("send user data", response.data)
            socket.on("recieved all data", async (allData) => {
                const messages = await axios.get(
                    `${process.env.REACT_APP_SERVER_URL}/api-v1/timeline/`
                )
                setMsgs(messages.data.messages)
            })
            //reset form to blank after submission of message
            setForm({content: ""})
        } catch (error) {
            console.log(error)
        }
    }

    const showMessage = (
        <div className="show-message-wrapper">
            <h4>Please log in or register to chat!</h4>
        </div>
    )
    const mappedMsgs = msgs.map((message, i) => {
        return (
            <div ref={scrollRef} key={`message-${i}`}>
                <Message
                    clickedUserProfile={clickedUserProfile}
                    setClickedUserProfile={setClickedUserProfile}
                    clickedUserData={clickedUserData}
                    setClickedUserData={setClickedUserData}
                    name={message.author.name}
                    content={message.content}
                    createdAt={message.createdAt}
                    avatar={message.author.avatar}
                    userId={message.author._id}
                    currentUser={currentUser}
                    own={
                        currentUser
                            ? message.author._id === currentUser.id
                            : false
                    }
                />
            </div>
        )
    })

    return (
        <div className="main-chat-wrapper">
            <div className="main-chat-inner-wrapper">
                <div className="form-post">
                    <div className="people-online-wrapper">
                        <h4 className="people-online">Main Chatroom</h4>
                    </div>
                    <div className="convo">{mappedMsgs}</div>
                    {currentUser ? (
                        <FormChatBar
                            handleSubmitTimeline={handleSubmitTimeline}
                            setForm={setForm}
                            form={form}
                        />
                    ) : (
                        showMessage
                    )}
                </div>
            </div>
        </div>
    )
}
