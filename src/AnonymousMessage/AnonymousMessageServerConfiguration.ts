import * as Discord from 'discord.js';

interface AnonymousMessageServerChannelConfiguration {
    /** the emoji that is displayed in the channel selection prompt */
    emoji: string,

    /** the channel */
    channelID: string,

    /** a small description of the channel to display in the prompt */
    description: string,
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
     * @param user The user requesting their channel list.
     */
    generateChannelList(user: Discord.GuildMember): AnonymousMessageServerChannelConfiguration[] {
      let returnChannels = [...this.channelConfigurations];
      const roleChannels = this.roleConfigurations.filter((r) => user.roles.cache.has(r.roleID));
      roleChannels.forEach((r) => {
        returnChannels = returnChannels.concat(r.channels);
      });
      return returnChannels;
    }
}

export { AnonymousMessageServerConfiguration, AnonymousMessageServerChannelConfiguration };
