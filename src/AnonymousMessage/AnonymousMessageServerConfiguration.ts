import * as Discord from 'discord.js';

interface AnonymousMessageServerChannelConfiguration {
  /** the emoji that is displayed in the channel selection prompt */
  emoji: string,

  /** the channel */
  channelID: string,

  /** a small description of the channel to display in the prompt */
  description: string,

  /** a secret channel where all credentials of the user will be shared */
  secretChannelID?: string,
}

interface AnonymousMessageServerRoleAssociation {
  /** the role that is associated with the channels */
  roleID: string,

  /** the anonymous channels associated with the roles */
  channels: AnonymousMessageServerChannelConfiguration[],
}

class AnonymousMessageServerConfiguration {
  /** the associations made with the roles */
  roleConfigurations: AnonymousMessageServerRoleAssociation[];

  /** the associations available for all users */
  channelConfigurations: AnonymousMessageServerChannelConfiguration[];

  constructor() {
    this.roleConfigurations = [];
    this.channelConfigurations = [];
  }

  /**
   * This is primarily used so that the user only has options to specific channels when
   * prompting for their information.
   * @param member The user requesting their channel list.
   */
  async generateChannelList(
    member: Discord.GuildMember,
  ): Promise<AnonymousMessageServerChannelConfiguration[]> {
    let returnChannels = [...this.channelConfigurations];
    // just in case that the user has their role change and cache doesn't detect it
    const m = await member.fetch(true);
    const roleChannels = this.roleConfigurations
      .filter((r) => m.roles.cache.has(r.roleID));
    roleChannels.forEach((r) => {
      returnChannels = returnChannels.concat(r.channels);
    });
    return returnChannels;
  }
}

export { AnonymousMessageServerConfiguration, AnonymousMessageServerChannelConfiguration };
