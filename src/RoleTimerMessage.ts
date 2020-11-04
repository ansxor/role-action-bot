import * as Discord from 'discord.js';

/**
 * Defines an action related to roles for RoleTimerMessage.
 */
interface RoleTimerMessageAction {
  /** the role to switch to when taking this action */
  role: Discord.Role,
  /** how much time to wait until executing the action after this */
  offset: number
}

/**
 * Defines a configuration for an action related to roles for RoleTimerMessage.
 */
interface RoleTimerMessageActionConfig {
  /** the internal ID of the role on the server, which can be accessed through dev tools */
  roleID: string,
  /** how much time to wait until executing the following action */
  offset: number
}

/**
 * A configuration for how to set up the RoleTimerMessage
 */
interface RoleTimerMessageConfig {
  /** the message to attach the reaction to */
  messageID: string,
  /** the emoji to use as a reaction to watch */
  emoji: string,
  /** the actions to take place when making reactions */
  actions: RoleTimerMessageActionConfig[]
}

class RoleTimerMessage {
  /** The message the reaction is attached to */
  msg: Discord.Message;

  /** The emoji to watch when reaction actions are made */
  emoji: string;

  /** The set of role actions to take upon clicking the reaction button */
  actions: RoleTimerMessageAction[];

  /**
   * Generate a RoleTimerMessage that attaches a reaction to a message to watch
   * @param conf The configuration for the message
   * @param msg The message that contains the configuration for the message
   */
  constructor(conf: RoleTimerMessageConfig, msg: Discord.Message) {
    msg.channel.messages.fetch(conf.messageID)
      .then((m: Discord.Message) => {
        this.msg = m;
        this.actions = [];
        conf.actions.forEach((ac: RoleTimerMessageActionConfig) => {
          this.msg.guild.roles.fetch(ac.roleID)
            .then((r: Discord.Role) => {
              this.actions.push({
                role: r,
                offset: ac.offset,
              });
            });
        });
        this.emoji = conf.emoji;
        this.msg.react(this.emoji);
        msg.delete();
      });
  }

  /**
   * Spawns a timer that adds roles over time unless the user cancels the
   * action by disabling the reaction
   * @param rct The reaction that was added
   * @param user The user that made the reaction on the message
   */
  spawnTimer(rct: Discord.MessageReaction, user: Discord.GuildMember) {
    let timeOffset: number = 0;
    let cancelAction = false;

    this.actions
      .forEach((action: RoleTimerMessageAction) => {
        setTimeout(() => {
          const skipAction = cancelAction || (this.msg.reactions.cache
            .filter((reaction) => reaction.users.cache.has(user.id))
            .get(this.emoji) === undefined);
          cancelAction = skipAction;

          if (!skipAction) {
            user.roles.add(action.role)
              .then(() => {})
              .catch(() => {
                this.msg.channel.send('This bot can\'t set roles for some reason???\n');
              });
          }
        }, timeOffset);
        timeOffset += action.offset;
      });
  }

  /**
   * Request a removal of the roles in the action set. This is typically used
   * when trying to remove roles by unreacting to the message.
   * @param user The user requesting the role to be removed.
   */
  removeRole(user: Discord.GuildMember) {
    this.actions
      .forEach((action: RoleTimerMessageAction) => {
        user.roles.remove(action.role)
          .then(() => {})
          .catch(() => {
            this.msg.channel.send('This bot can\'t set roles for some reason???\n');
          });
      });
  }

  /**
   * FIXME: Removes the reaction from the user on the RoleTimerMessage.
   * @param user The user requesting the reaction to be removed.
   */
  removeReaction(user: Discord.GuildMember) {
    this.msg.reactions.cache
      .filter((reaction) => reaction.users.cache.has(user.id))
      .get(this.emoji)
      .remove();
  }
}

export { RoleTimerMessageConfig, RoleTimerMessage };
