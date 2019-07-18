import React, { Component } from "react";
import { Button, Input } from "semantic-ui-react";
import "./chat.css";

class Chat extends Component {
  ws = {};

  constructor(props) {
    super(props);
    this.state = {
      messages: [],
      message: ""
    };
  }

  componentDidMount() {
    let URL = "ws://localhost:";

    fetch("http://localhost:9000", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        getport: true
      })
    })
      .then(response => response.text())
      .then(contents => {
        URL = URL + contents;
        console.log(URL,'URL');
        this.ws = new WebSocket(URL);
        console.log(this.ws,'this.ws');
        this.ws.onopen = () => {
          console.log("connected");
          this.ws.send("getMessage from db");
        };

        this.ws.onmessage = evt => {
          let message = "";
            console.log(evt.data,'evt.data');
          this.IsJsonString(evt.data)
            ? (message = JSON.parse(evt.data))
            : (message = evt.data);

          Array.isArray(message)
            ? this.setState({ messages: [...this.state.messages, ...message] })
            : this.setState({ messages: [...this.state.messages, message] });
        };

        this.ws.onclose = () => {
          console.log("disconnected");
        };
      })
      .catch(() => console.log("Can’t access response. Blocked by browser?"));
  }

  IsJsonString(str) {
    try {
      JSON.parse(str);
    } catch (e) {
      return false;
    }
    return true;
  }

  checkEnter = (e) => {
    if (e.keyCode === 13){
        this.handleClick();
    }
  }

  handleClick = () => {
    if (this.state.message) {
      window.scrollTo(0, document.body.scrollHeight);
      
      if (Object.keys(this.ws).length) {
        this.ws.send(this.state.message + "");
      }
      this.setState({ message: "" });
    }
  };

  handleKeyDown = e => {
    const value = e.target.value;
    this.setState({ message: value });
  };

  render() {
    return (
      <div className="chat">
        <ul id="messages" ref={this.myRef}>
          {this.state.messages.map((msg, idx) => {
            return (
              <li key={idx}>
                <h2>{msg}</h2>
              </li>
            );
          })}
        </ul>

        <div className="chat-panel">
          >
          <Input
            className="chat-input"
            size="huge"
            placeholder="write message..."
            value={this.state.message}
            onChange={this.handleKeyDown}
            onKeyDown={this.checkEnter}
          />
          <Button
            className="chat-button"
            size="huge"
            content="Send"
            onClick={this.handleClick}
          />
        </div>
      </div>
    );
  }
}

export default Chat;
