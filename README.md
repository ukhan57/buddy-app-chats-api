# buddy-app-chats-api
This repo will be used as a backend for the chat feature using node.js and socket.io


Explanation 

1. Importing Modules:

express: A web framework for Node.js to build web applications.
http: A core Node.js module to create an HTTP server.
cors: Middleware to allow Cross-Origin Resource Sharing.
socket.io: A library to handle real-time web socket connections.

2. CORS Middleware:

app.use(cors());: Allows the server to accept requests from different origins.

3. Creating an HTTP Server:

const server = http.createServer(app);: Creates an HTTP server using the Express application.

4. Setting Up Socket.IO:

const io = new Server(server, { ... });: Initializes a new Socket.IO server attached to the HTTP server with CORS configuration.

5. Handling Socket Connections:

io.on("connection", (socket) => { ... });: Listens for new client connections.
socket.on("join_room", (data) => { ... });: Adds the connected client to a specific room.
socket.on("send_message", (data) => { ... });: Listens for messages from clients and emits them to others in the same room.
socket.on("disconnect", () => { ... });: Handles client disconnections.

6. Starting the Server:

server.listen(3001, () => { ... });: Starts the server on port 3001 and logs a message to the console.
This server code provides a basic setup for handling real-time communication using Socket.IO, allowing clients to join rooms, send messages, and receive messages from others in the same room.






