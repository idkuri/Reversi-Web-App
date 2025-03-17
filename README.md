## Reversi
Web based Reversi App

This is a full stack implementation of the board game Reversi/Othello

Stack: MongoDB (Database), Express.js (Backend), React.js (Frontend), Node.js (Frontend + Backend)
Dev tools: Netlify (Frontend deployment), Oracle cloud (Backend deployment)

## Running your own Reversi Board
To run the client, navigate to the client directory and use the following command:
```bash
npm install
```
then,
```bash
npm start
```

To run the server, navigate to the server directory and use the following command:
```bash
npm install
```
## Environment Variables

Create a .env file in the server directory and add the following:

```bash
URI=your_mongodb_connection_string
```

Replace your_mongodb_connection_string with your actual MongoDB connection URI.
```bash
CHECKAPI=A_KEY_GENERATED_KEY_FOR_apikeyAuth.js
```
Replace A_KEY_GENERATED_KEY_FOR_apikeyAuth.js with a generated key to be used by the frontend to update player moves within the server.

Then, start the server:

```bash
node server.js
```

## My Deployment

The frontend is deployed using Netlify, and the backend is deployed on Oracle Cloud. You can access the live application at [Reversi Project](https://reversiproject.netlify.app/).

Menu:
![image](https://github.com/idkuri/Reversi-Web-App/assets/78403245/3da5b9e7-c1dd-41bf-b21d-83581665298f)

Matchmaking Screen:
![image](https://github.com/idkuri/Reversi-Web-App/assets/78403245/bcc2e5db-d254-4e0f-b7c1-7900697f13b7)

Board:
![image](https://github.com/idkuri/Reversi-Web-App/assets/78403245/a88bdc0f-f596-4797-bbe9-12bdb08327e4)


