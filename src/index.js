/* Library for interacting with Discord */
const Discord = require('discord.js');

/* Config */
const conf = require('./config.json');

/* Utils */
const fs = require('fs');
const chalk = require('chalk');

/* Client initiation */
const client = new Discord.Client({
  disableEveryone: true,
  messageCacheMaxSize: 150,
  messageSweepInterval: 15
});

/* Commands collection (extended map class) (for command handling) */
client.commands = new Discord.Collection();

/* Status initiation */
const statuses = ['https://discord.gg/fVPfFvz', 'i am the BEST boye', 'with your bank details'];
const randS = statuses[Math.floor(Math.random() * statuses.length)];

/* Read and push command props */
fs.readdir('./commands/', (err, files) => {
  if(err) console.log(chalk.red('[ERROR]:\n\n' + err));
  files.forEach(file => {
    let props = require(`./commands/${file}`);
    client.commands.set(props.help.name, props);
  });
});

client.on('ready', () => {
  console.log(chalk.gray(`[INFO]: ${client.user.username} has successfully connected to the gateway`));
  setInterval(() => {
    client.user.setActivity(randS);
  }, 15000);
});

client.on('message', async msg => {
  if(!msg.content.startsWith(conf.prefix) || msg.author.bot) return;
  // if(!msg.guild.me.permissions.has('SEND_MESSAGES'))
  //   return client.users.get(msg.guild.owner.id)
  //     .send('⚠ | It seems I\'m unable to send messages in your guild. Mind giving me permission?')
  //     .catch(err => console.log(chalk.red('[ERROR]: An error occurred (cannot send message to guild owner)\n\n' + err)))
  const args = msg.content.slice(conf.prefix.length).split(/ +/);
  const cmdName = args.shift().toLowerCase();
  const cmd = client.commands.get(cmdName)
    || client.commands.find(c => c.help.aliases && c.help.aliases.includes(cmdName));

  if(!cmd) return msg.channel.send('⚠ | The command you\'re trying to execute does not exist');

  try {
    cmd.execute(args, client, msg);
  } catch(e) {
    msg.channel.send('⚠ | An error has occurred during execution. Stacktrace has been sent to developer');

    client.users.get('260246864979296256')
      .send(`An error occurred\n\nUser: ${msg.author.tag}\nCommand executed: ${msg.content.slice(5)}\n\nStacktrace:\n${e.stack}`);
  }
});

/* Catch promise rejections */
process.on('unhandledRejection', e => {
  console.log(chalk.red('[ERROR]: Unhandled rejection occurred:\n\n' + e))
});

client.login(conf.token);
