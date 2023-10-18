This repo is archived as it is no longer maintained or in use.

# Skjermen
Welcome to the Git Repository for The Screen!

# Want something on The Screen, but have no time?
Create an issue: https://github.com/equinor/skjermen/issues/new and your wish will become command in no time! You can also try contacting one of the [contributors](https://github.com/equinor/skjermen/graphs/contributors) directly.

# Development workflow:
* Clone the repository
* Edit what is inside the `contents` folder (you can open `index.html` in a browser directly to see your results).

If you want to run through Docker for final verfication:
```
cd webapp
docker build --tag=skjermen .
docker run -p 8000:80 skjermen
```

You can now navigate to `localhost:8000` to see Skjermen in all its beauty!

Now, when you are happy with your changes, create a pull request!

# Technologies
* [Radix](https://console.radix.equinor.com/)
* [Nginx](https://www.nginx.com/)
* [Docker](https://www.docker.com/)
* <b>Currently: no web framework! Feel free to rewrite Skjermen in React and make a pull request.</b>
