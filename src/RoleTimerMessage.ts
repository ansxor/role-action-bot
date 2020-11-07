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
  spawnTimer(rct: Discord.MessageReaction, user: Discord.GuildMember): void {
    let cancelAction = false;
    let currentRole: string;

    const commitActions = (actions: RoleTimerMessageAction[], us: Discord.GuildMember) => {
      us.fetch(true)
        .then((u: Discord.GuildMember) => {
          if (actions.length !== 0
            && ((currentRole === undefined)
            || (currentRole !== undefined
              && (u.roles.cache.some((role) => role.name === currentRole))))) {
            const action = actions.shift();
            currentRole = action.role.name;

            const skipAction = cancelAction || (this.msg.reactions.cache
              .filter((reaction) => reaction.users.cache.has(u.id))
              .get(this.emoji) === undefined);
            cancelAction = skipAction;

            if (!skipAction) {
              u.roles.add(action.role)
                .then(() => {
                  setTimeout(() => commitActions(actions, u), action.offset);
                })
                .catch(() => {
                  this.msg.channel.send('This bot can\'t set roles for some reason???');
                });
            }
          }
        });
    };

    commitActions([...this.actions], user);
  }

  /**
   * Request a removal of the roles in the action set. This is typically used
   * when trying to remove roles by unreacting to the message.
   * @param user The user requesting the role to be removed.
   */
  removeRole(user: Discord.GuildMember): void {
    this.actions
      .forEach((action: RoleTimerMessageAction) => {
        user.roles.remove(action.role)
          .catch(() => {
            this.msg.channel.send('This bot can\'t set roles for some reason???\n');
          });
      });
  }

  /**
   * FIXME: Removes the reaction from the user on the RoleTimerMessage.
   * @param user The user requesting the reaction to be removed.
   */
  removeReaction(user: Discord.GuildMember): void {
    this.msg.reactions.cache
      .filter((reaction) => reaction.users.cache.has(user.id))
      .get(this.emoji)
      .remove();
  }
}

export { RoleTimerMessageConfig, RoleTimerMessage };
