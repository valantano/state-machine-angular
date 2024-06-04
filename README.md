# State Machine with an Angular Frontend

This project was generated with [Angular CLI](https://github.com/angular/angular-cli).

## Prerequisites

Before you begin, make sure your development environment includes `Node.js®` and an `npm` package manager.

### Node.js

Angular requires a current, active LTS, or maintenance LTS version of Node.js. 

To check your version, run `node -v` in a terminal/console window.

To get Node.js, go to [nodejs.org](https://nodejs.org/).

### Angular CLI

Install the Angular CLI globally.

To install the CLI using `npm`, open a terminal/console window and type the following command:

```bash
npm install -g @angular/cli
```

## First Time Setup
1. Clone the repository to your local machine.
2. Install python dependencies.
```bash
pip install -r requirements.txt
```
3. Navigate into the frontend directory.
```bash
cd frontend
```
4. Install the project dependencies.
```bash
npm install
```
5. Development server
Run ng serve for a dev server. Navigate to http://localhost:4200/. The app will automatically reload if you change any of the source files.

```bash
ng serve
```

## Setup for Docker
1. Add this repository as a submodule to your project.
2. Modify the Dockerfile in a similar matter to the following example:
```Dockerfile
# Install Node.js and npm
RUN curl -sL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs && \
    npm install -g npm@latest

# Install Angular CLI
RUN npm install -g @angular/cli
[...]
RUN cd /colcon_ws/src/state-machine-angular; pip3 install -r requirements.txt
RUN cd /colcon_ws/src/state-machine-angular/frontend; npm install
[...]
# Expose the Angular development server port (if needed)
EXPOSE 4200
```