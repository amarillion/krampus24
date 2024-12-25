# Aoshima

Welcome to Aoshima

This game was created for KrampusHack 2024 
https://tins.amarillion.org/krampu24/

## Playing online

To play, just open this link in your browser: https://amarillion.github.io/krampus24/
The game works on Desktop and Mobile.

## Playing offline

If you received a zip file with these files, you can play the game offline too.

Unfortunately, modern browsers won't let you simply open index.html and take it from there.
To play, you need to serve the static files in this folder. 

For example, using the http-server node module:

```
npm install -g http-server
npx http-server .
```

Then open http://localhost:8080

Or, if you prefer python instead of node:

```
python3 -m http.server
```

Then open http://localhost:8000

You can use any http server that you find convenient.