import * as Discord from 'discord.js';
import AnonymousMessagePromptHandler from './AnonymousMessagePromptHandler';

enum AnonymousMessagePromptState {
  ChannelSelection,
  Confirmation
}

/**
 * A prompt that asks questions to the user about where they would like
 * to send their anonymous messages.
 *
 * This would be initiated usually by DMing the bot with the contents of
 * the message, then the bot would prompt the user about where to send their
 * message - considering their roles.
 *
 * If the bot is in multiple of the user's servers, then the bot should prompt
 * about which server to send the message to, although I will omit that functionality
 * for now since that is a whole other can of worms to consider.
 */
class AnonymousMessagePrompt {
  /** the amount of time to wait before timing out the user from making any more actions */
  private static readonly timeoutTime: number = 60 * 1000;

  /** the user being prompted */
  private member: Discord.GuildMember;

  /** the current prompt state to check how to handle reactions on the anonymous message */
  private currentState: AnonymousMessagePromptState;

  /** the prompt state to check against when considering whether to timeout or not */
  private oldState: AnonymousMessagePromptState;

  /** the manager that the prompt belongs to */
  private parentHandler: AnonymousMessagePromptHandler;

  /** contains the timeout event, used to refresh it whenever an event happens */
  private timeoutEvent: NodeJS.Timeout;

  /** contains the message that requested the prompt */
  private requestMsg: Discord.Message;

  constructor(msg: Discord.Message, handler: AnonymousMessagePromptHandler) {
    if (msg.channel.type === 'dm') {
      this.requestMsg = msg;
      const user = msg.author;
      // try to get the member from a server automatically
      const servers = Array.from(handler.serverConfigurations.keys()).filter((k) => {
        const server = msg.client.guilds.cache.get(k);
        return server.members.fetch(msg.author.id) !== null;
      });
      // TODO: If the bot is in several servers of the user, there should
      // be a server prompt selection screen and it should always default to that
      // server if they ever attempt to send a message again.
      if (servers.length > 0) {
        const serverKey = servers[0];
        if (msg.client.guilds.cache.has(serverKey)) {
          const server = msg.client.guilds.cache.get(serverKey);
          server.members.fetch(user.id).then((member) => {
            this.member = member;
            this.parentHandler = handler;
            this.sendChannelSelectionMessage();
          });
        }
      }
    }
  }

  private sendChannelSelectionMessage(): void {
    this.currentState = AnonymousMessagePromptState.ChannelSelection;
    const server = this.parentHandler.serverConfigurations.get(this.member.guild.id);
    server.generateChannelList(this.member)
      .then((channelList) => {
        const messageEmbed = new Discord.MessageEmbed()
          .setTitle('Select channel to send to...')
          .setDescription(this.requestMsg.content.trim());
        channelList.forEach((c) => {
          messageEmbed.addField(c.emoji, c.description, true);
        });
        this.member.user.dmChannel.send(messageEmbed)
          .then((m) => {
            this.spawnTimeout();
            // TODO: Add a reaction that cancels the action.
            channelList.forEach((c) => { m.react(c.emoji); });
          });
      });
  }

  reactionHandler(rct: Discord.MessageReaction): void {
    if (this.currentState === AnonymousMessagePromptState.ChannelSelection) {
      clearTimeout(this.timeoutEvent);
      this.parentHandler
        .serverConfigurations.get(this.member.guild.id)
        .generateChannelList(this.member)
        .then((channelList) => {
          const channelSelection = channelList.find((c) => c.emoji === rct.emoji.toString());
          const channel = this.member.guild.channels.cache
            .get(channelSelection.channelID);
          const messageEmbed = new Discord.MessageEmbed()
            .setDescription(this.requestMsg.content.trim())
            .setTimestamp();
          (channel as Discord.TextChannel).send(messageEmbed)
            .then((m) => {
              const mEmbed = new Discord.MessageEmbed()
                .setTitle('Your message has been successfully sent!')
                .setDescription(`Click the link below to see your sent message!\nhttps://discord.com/channels/${this.member.guild.id}/${channelSelection.channelID}/${m.id}`);
              this.requestMsg.channel.send(mEmbed);
              this.parentHandler.promptMap.delete(this.member.user.id);
            });
          if (typeof channelSelection.secretChannelID !== 'undefined') {
            const secretChannel = this.member.guild.channels.cache
              .get(channelSelection.secretChannelID);
            // this is just in case the person changed their nickname
            // since the last time the cache was updated
            this.member.fetch(true)
              .then((m) => {
                let author = m.user.username;
                if (m.nickname !== null) {
                  author = `${m.nickname} (${m.user.username})`;
                }
                const secretMessageEmbed = new Discord.MessageEmbed()
                  .setAuthor(author, m.user.avatarURL())
                  .setTitle('Anonymous Message Secret Info')
                  .addField('Contents', this.requestMsg.content.trim())
                  .setTimestamp();
                (secretChannel as Discord.TextChannel).send(secretMessageEmbed);
              });
          }
        });
    }
  }

  private spawnTimeout(): void {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const t = this;
    clearTimeout(this.timeoutEvent);
    this.timeoutEvent = setTimeout(() => {
      if (t.currentState === t.oldState) {
        t.requestMsg.channel.send('Sorry, your message has expired.')
          .then(() => {
            t.parentHandler.promptMap.delete(t.member.user.id);
          });
      } else {
        t.oldState = t.currentState;
        t.spawnTimeout();
      }
    }, AnonymousMessagePrompt.timeoutTime);
  }
}

export { AnonymousMessagePrompt as default };
