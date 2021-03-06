# Modern React Base

A starter kit with the following features:

* [Universal Javascript](https://medium.com/@mjackson/universal-javascript-4761051b7ae9): Share the same rendering code on both the client and the server using [React](https://github.com/facebook/react).
* [Code splitting](http://webpack.github.io/docs/code-splitting.html): Load only the JS needed for rendering a page. Load more code only when the user goes to another route.
* [Hot reloading](https://github.com/gaearon/react-hot-loader): See code changes live. No more refreshing the page.
* Shared routing using [react-router](https://github.com/rackt/react-router).
* Sane state management with [redux](https://github.com/gaearon/redux).
* Dev tools using [redux-devtools](https://github.com/gaearon/redux-devtools).
* [CSS Modules](http://glenmaddern.com/articles/css-modules)

## How to run

```
npm run dev
```

If you get `error: watch ENOSPC` then run the following command:

```
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf && sudo sysctl -p
```

Then go to `localhost:3001`.
