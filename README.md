<p align="center">
  <img width="150" src="/public/new-sysfeather.png" alt="Sysfeather icon">
</p>

<h1 align="center">矽羽直播主控台</h1>

## Getting Started with Create Sysfeather Social App

This project was bootstrapped with [Create Sysfeather Social App](https://github.com/quishop/create-sysfeather-social-app), integrating with modern frontend dependencies and introduced the best practice general business logistics.

1. Base project configuration
   - [Create React App](https://create-react-app.dev/docs/getting-started) – the base project start kit with typeScript.
   - [TypeScript](https://www.typescriptlang.org/docs/)
   - [Sass](https://sass-lang.com/) – css extension language
   - [CRACO](https://craco.js.org/) - using CRACO to eject webpack and babel configuration instead of create-react-app eject script.
   - [Prettier](https://prettier.io/) - an opinionated code formatter to standardize code formatter. Formating code before commit code.
   - [ESLint](https://eslint.org/) - a tool for identifying javascript/typescript issues. Identifying issues when project is running in local dev server or build for production.
   - [husky](https://typicode.github.io/husky/getting-started.html) - a pre-commit tool to integrate Prettier and ESlint before commit.
2. Project dependencies
   - [React](https://react.dev/) – the project is powered by React 18+ version.
   - [Redux Toolkit](https://redux-toolkit.js.org/) - using Redux toolkit for efficient Redux development.
   - [React Router](https://reactrouter.com/en/main) – using router-router-dom V6 to manipulate Router controller.
   - [Axios](https://axios-http.com/docs/intro) – a Http Client as global request to fetch Restful and GraphQL services.
   - [MUI](https://mui.com/) - Google's Material Design library as base component library.
   - [Google Analytics](https://analytics.google.com/analytics/web/) - support gtag SDK and easy way to set configuration and utilities function to manipulate it.
3. Utilities
   - [React Hook Form](https://react-hook-form.com/) - the best React form library and easy to integrate with MUI.
   - [classnames](https://www.npmjs.com/package/classnames) - the utility for conditionally joining classNames.
   - [dayjs](https://day.js.org/) - the best javascript library to manipulate date.
   - [lodash](https://lodash.com/) - the modern JavaScript utility.
   - [js-cookie](https://github.com/js-cookie/js-cookie) - the lightweight JavaScript API for handling cookies.

## Prerequisites

- npm >= 9.6.7
- node >= 16.14.0 +

Use [https://github.com/nvm-sh/nvm](nvm) to switch node version locally.

## Available Scripts

In the project directory, you can run:

**npm run start:**

Due to Facebook graph api security issue, the local server is running with local SSL server automatically. Runs the app in the development mode.
Open [https://localhost:3000](https://localhost:3000) to view it in the browser.

Recommending add local host as proxy server for running local server instead of localhost  
Open [https://dev.luckey-picker.com:3000](https://dev.luckey-picker.com:3000/) to view local proxy server in the browser.

```sh
npm run start
```

**npm run build:**

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

```sh
npm run build
```

**npm run serve:**

use static server to test production build data.\
please make sure that your local enviroment has been installed local server globally

```sh
npm install -g serve
```

```sh
npm run serve
```

**npm run eject:**

```sh
npm run eject
```

Generally, please use CRACO instead of npm eject to eject project configuration. In case you need to configure project webpack, Babel, ESLint, directly. See the section about [eject](https://create-react-app.dev/docs/available-scripts#npm-run-eject) for more information.

**npm run test:**

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

```sh
npm run test
```

**npm run analyze:**

Analyzes production build size with JavaScript bundles using the source maps.
Launches the test runner in the interactive watch mode.\
See the section about [analyize](https://create-react-app.dev/docs/analyzing-the-bundle-size/) for more information.

```sh
npm run analyze
```

**npm run lint:**
Analyzes your project code problem before production build.

```sh
npm run lint
```

## Deployment

Make sure your web service envionment has fullfilled project prerequisites. Recommend to use [Amazon S3](https://aws.amazon.com/s3/?nc1=h_ls) to host static website, and serve index.html in build forder as default website page index.

```sh
npm install
npm run build
```
