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
 
    let port = [];

    if (process.env.REACT_APP_QUEUE_PORT) {
      port[0] = process.env.REACT_APP_QUEUE_PORT;
    } else {
      port[0] = process.env.REACT_APP_QUEUE_PORT1;
    }

    if (process.env.REACT_APP_QUEUE_PORT1) {
      port[1] = process.env.REACT_APP_QUEUE_PORT1;
    } else {
      port[1] = process.env.REACT_APP_QUEUE_PORT;
    }

    const fetchRetry = async (url, options, n) => {
      let URL = "ws://localhost:";
      let urlToSend = '';
      if (n % 2) {
        urlToSend = url + port[1];
      } else {
        urlToSend = url + port[0];
      }

      try {
        return await fetch(urlToSend, options)
          .then(response => response.text())
          .then(contents => {
            URL = URL + contents;
            this.ws = new WebSocket(URL);
            this.ws.onopen = () => {
              this.ws.send("getMessage from db");
            };

            this.ws.onmessage = evt => {
              let message = "";

              this.IsJsonString(evt.data)
                ? (message = JSON.parse(evt.data))
                : (message = evt.data);

              Array.isArray(message)
                ? this.setState({
                    messages: [...this.state.messages, ...message]
                  })
                : this.setState({
                    messages: [...this.state.messages, message]
                  });
            };

            this.ws.onclose = () => {
              console.log("disconnected");
            };
          });
      } catch (err) {
        if (n === 1)
          throw console.log("Can’t access response. Blocked by browser?", err);
        return await fetchRetry(url, options, n - 1);
      }
    };

    fetchRetry(
      "http://localhost:",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          getport: true
        })
      },
      6
    );
  }

  IsJsonString(str) {
    try {
      JSON.parse(str);
    } catch (e) {
      return false;
    }
    return true;
  }

  checkEnter = e => {
    if (e.keyCode === 13) {
      this.handleClick();
    }
  };

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
