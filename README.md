# handlercord

![GitHub License](https://img.shields.io/github/license/Aidan-The-Dev/handlercord)
![npm Version](https://img.shields.io/npm/v/handlercord)

Simplify your Discord bot development with the `handlercord` package. This package provides a streamlined way to manage commands, events, and interactions for your Discord bot, making it easier to create and maintain a feature-rich bot.

## Features

- Easy command and event handling.
- Customizable event system.
- Simplified interaction handling.
- Error handling and logging.

## Installation

You can install `handlercord` via npm:

```bash
npm install handlercord
```

## Getting Started

Check out the [documentation](https://github.com) for detailed usage instructions and examples to get started quickly.

## Usage

Here's a simple example of how to use handlercord to create a basic Discord bot:

```javascript
const { Client, Intents } = require('discord.js')
const { Handler } = require('handlercord')

const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
    ],
})
const handler = new Handler({
  client,
  commandsPath: './commands',
  eventsPath: './events',
})

handler.start()
client.login('YOUR_BOT_TOKEN')
```

### ping.js

To create a command make a new file in your commands folder.

```javascript
module.exports = {
    data:
    {
        name: 'ping',
        description: 'Pong!'
    },
  
    run: ({ interaction }) => {
      interaction.reply('Pong!')
    },
  }
```

### ready.js

To create an event make a new file in your events folder

```javascript
module.exports = (client) => {
    client.once('ready', () => {
        console.log(`${client.user.tag} is online.`)
    client.user.setActivity('handlercord', {type: 'PLAYING'})
    })
  }
```

## License
This project is licensed under the Apache 2.0 License - see the LICENSE file for details.
