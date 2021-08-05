// Create a websocket passing events to provided handlers
export const
  newWebsocket = (messageHandler, openHandler, closeHandler) => {
    let url = (location.protocol === 'http:' ? 'ws:' : 'wss:') + '//' + document.domain + '/ws'
    let socket = new WebSocket(url);
    if (messageHandler) {
      socket.addEventListener("message", messageHandler)
    }
    if (openHandler) {
      socket.addEventListener("open", openHandler)
    }
    if (closeHandler) {
      socket.addEventListener("close", closeHandler)
    }
    return socket
  }
