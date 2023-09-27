const { Collection } = require('discord.js')
const fs = require('fs')
const path = require('path')
const { REST } = require('@discordjs/rest')
const { Routes } = require('discord-api-types/v9')
const Table = require('cli-table3')

class Handler {
  constructor({ client, commandsPath, eventsPath, register }) {
    this.client = client
    this.commandsPath = commandsPath
    this.eventsPath = eventsPath
    this.register = register
    this.commands = new Collection()
  }

  async loadCommands() {
    const commandFiles = fs.readdirSync(this.commandsPath).filter(file => file.endsWith('.js'))

    for (const file of commandFiles) {
      const command = require(path.join(this.commandsPath, file))
      this.commands.set(command.data.name, command)
    }
  }

  async loadEvents() {
    const eventFiles = fs.readdirSync(this.eventsPath).filter(file => file.endsWith('.js'))

    for (const file of eventFiles) {
      const event = require(path.join(this.eventsPath, file))
      if (typeof event === 'function') {
        event(this.client)
      }
    }
  }

  async start() {
    await this.loadCommands()
    await this.loadEvents()

    this.client.once('ready', async () => {
      await this.registerSlashCommands()
    })

    this.client.on('interactionCreate', async (interaction) => {
      if (!interaction.isCommand()) return

      const { commandName } = interaction
      const command = this.commands.get(commandName)

      if (!command) return

      try {
        await command.execute({ interaction })
      } catch (error) {
        console.error(error)
      }
    })
  }

  async registerSlashCommands() {
    const commands = []
    const statusTable = new Table({
      head: ['Command', 'Status'],
      colWidths: [20, 15],
      style: {
        head: ['cyan'],
      },
    })

    const commandFiles = fs.readdirSync(this.commandsPath).filter(file => file.endsWith('.js'))

    for (const file of commandFiles) {
      const command = require(path.join(this.commandsPath, file))
      const commandData = command.data
      commands.push(commandData)

      statusTable.push([commandData.name, 'Loading'])
    }

    const rest = new REST({ version: 10 }).setToken(this.client.token)

    try {
      if(this.register === 'GLOBAL') {
        await rest.put(
          Routes.applicationCommands(this.client.user.id),
          { body: commands },
        )
      } else if(typeof this.register === 'string') {
        await rest.put(
          Routes.applicationGuildCommands(this.client.user.id, this.register),
          { body: commands },
        )
      }

      commands.forEach(command => {
        const rowIndex = statusTable.findIndex(row => row[0] === command.name)
        if (rowIndex !== -1) {
          statusTable[rowIndex][1] = 'Loaded'
        }
      })

    } catch (error) {
      console.error(error)

      error.data.commands.forEach(failedCommand => {
        const rowIndex = statusTable.findIndex(row => row[0] === failedCommand.name)
        if (rowIndex !== -1) {
          statusTable[rowIndex][1] = 'Failed'
        }
      })
    }

    console.log(statusTable.toString())
  }
}

module.exports = Handler
