import {
    Client,
    Guild,
    Channel,
    GuildChannel,
    TextChannel,
    User,
    GuildMember,
    Message,
    MessageReaction,
    CommandInteraction,
    Role,
    VoiceState,
    Presence,
    VoiceChannel,
    CategoryChannel
  } from "discord.js";
  import { vi } from 'vitest';
  
export default class MockDiscord {
  private client!: Client;
  private guild!: Guild;

  private user!: User;
  private guildMember!: GuildMember;
  private message!: Message;
  private interaction!: CommandInteraction;
  private role!: Role;
  private everyoneRole!: Role;
  private voiceState!: VoiceState;
  private presence!: Presence;
  
  private category!: CategoryChannel;
  private voiceChannel!: VoiceChannel;
  private textChannel!: TextChannel;

  private reaction!: MessageReaction;
  private reactionUser!: User;

  constructor(options) {
    this.mockClient();
    this.mockGuild();

    this.mockCategory(options?.category?.name);
    this.mockVoiceChannel();

    this.mockUser();
    this.mockGuildMember();
    this.mockMessage(options?.message?.content);
    this.mockInteracion(options?.command);
    this.mockRole();
    this.mockEveryoneRole();

    this.mockVoiceState();
    this.mockPresence(options?.presence?.activities);

    this.mockPrototypes()

    // if (options?.partyChannel?.messages) {
    //   this.mockPartyMessages(options.partyChannel.messages)
    // }

    // if (options?.reaction) {
      // const lastPartyMessage = this.botPartyTextChannel.messages.cache.last()
      // this.mockReaction(options.reaction, lastPartyMessage)
      // this.mockReactionUser(options.reaction?.user?.id);
    // }

    // this.guild.channels.cache.set(this.botPartyTextChannel.id, this.botPartyTextChannel)
    this.guild.roles.cache.set(this.everyoneRole.id, this.everyoneRole);
    this.guild.roles.cache.set(this.role.id, this.role);

    // this.client.channels.cache.set(this.botPartyTextChannel.id, this.botPartyTextChannel)
    this.client.guilds.cache.set(this.guild.id, this.guild)
    this.guild.channels.cache.set(this.voiceChannel.id, this.voiceChannel);
    this.client.channels.cache.set(this.voiceChannel.id, this.voiceChannel);
    this.guild.members.cache.set(this.guildMember.id, this.guildMember);
    this.guild.voiceStates.cache.set(this.voiceState.id, this.voiceState);
  }

  public getClient(): Client {
    return this.client;
  }

  public getGuild(): Guild {
    return this.guild;
  }

  public getVoiceChannel(): VoiceChannel {
    return this.voiceChannel;
  }

  public getCategory(): CategoryChannel {
    return this.category;
  }

  // public getChannel(): Channel {
  //   return this.channel;
  // }

  // public getGuildChannel(): GuildChannel {
  //   return this.guildChannel;
  // }

  // public getTextChannel(): TextChannel {
  //   return this.textChannel;
  // }

  public getUser(): User {
    return this.user;
  }

  public getGuildMember(): GuildMember {
    return this.guildMember;
  }

  public getMessage(): Message {
    return this.message;
  }

  public getInteraction(): CommandInteraction {
    return this.interaction;
  }

  public getReaction(): MessageReaction {
    return this.reaction;
  }

  public getReactionUser(): User {
    return this.reactionUser;
  }

  public getRole(): Role {
    return this.role;
  }

  public getVoiceState(): VoiceState {
    return this.voiceState;
  }

  public getPresence(): Presence {
    return this.presence;
  }

  private mockPrototypes() {
    TextChannel.prototype.send = vi.fn().mockImplementation(() => {
      return {
        react: vi.fn()
      }
    })

    Message.prototype.edit = vi.fn()
  }

  private mockReaction(reactionOptions, message): void {
    this.reaction = Reflect.construct(MessageReaction,[
      this.client, 
      { emoji: reactionOptions.emoji }, 
      message
    ])
  }

  private mockClient(): void {
    this.client = new Client({ intents: [] });
    this.client.login = vi.fn(() => Promise.resolve("LOGIN_TOKEN"));
  }

  private mockGuild(): void {
    this.guild = Reflect.construct(Guild,  [
      this.client, 
      {
        unavailable: false,
        id: "guild-id",
        name: "mocked js guild",
        icon: "mocked guild icon url",
        splash: "mocked guild splash url",
        region: "eu-west",
        member_count: 42,
        large: false,
        features: [],
        application_id: "application-id",
        afkTimeout: 1000,
        afk_channel_id: "afk-channel-id",
        system_channel_id: "system-channel-id",
        embed_enabled: true,
        verification_level: 2,
        explicit_content_filter: 3,
        mfa_level: 8,
        joined_at: new Date("2018-01-01").getTime(),
        owner_id: "owner-id",
        channels: [],
        // roles: new Collection(),
        presences: [],
        voice_states: [],
        emojis: [],
      }
    ]);

    this.guild.presences.resolve = vi.fn(() => this.presence);
    this.guild.channels.resolve = vi.fn((id) => {
      if(id === this.voiceChannel.id) { 
        return this.voiceChannel; 
      }
      
      if(id === this.category.id) {
          return this.category;
      }
    });
  }

  private mockCategory(name): void {
    this.category = Reflect.construct(CategoryChannel, [
      this.guild,
      {
        id: 'category-id',
        name: name ? name : 'Category Name'
      },
      this.client
    ])
  }

  private mockVoiceChannel(): void {
    this.voiceChannel = Reflect.construct(VoiceChannel, [
      this.guild, 
      {
        id: "voice-channel-id",
        name: "channel-name",
        parent_id: this.category.id
      },
      this.client
    ]);
  }

  private mockRole(): void {
    this.role = Reflect.construct(Role, [
      this.client,
      { 
        icon: 'role icon',
        id: 1
      },
      this.guild
    ]);
  }

  private mockEveryoneRole(): void {
    this.everyoneRole = Reflect.construct(Role, [
      this.client,
      {
        id: this.guild.id,
        name: 'everyone'
      },
      this.guild
    ])
  }


  private mockUser(): void {
    this.user = Reflect.construct(User, [
      this.client, 
      {
        id: "user-id",
        username: "USERNAME",
        discriminator: "0000",
        avatar: "user avatar url",
        bot: false,
      }
    ]);
  }

  private mockReactionUser(userId): void {
    this.reactionUser = Reflect.construct(User, [
      this.client, 
      {
        id: userId,
        username: `USERNAME-${userId}`,
        discriminator: `user#0000-${userId}`,
        avatar: "user avatar url",
        bot: false,
      }
    ]);
  }
  
  private mockGuildMember(): void {
    this.guildMember = Reflect.construct(GuildMember, [
      this.client,
      {
        id: BigInt(1),
        deaf: false,
        mute: false,
        self_mute: false,
        self_deaf: false,
        session_id: "session-id",
        channel_id: "channel-id",
        nick: "nick",
        joined_at: new Date("2020-01-01"),
        user: this.user,
        // roles: [],
      },
      this.guild
    ]);

    this.guildMember.roles.add = vi.fn();
    this.guildMember.roles.remove = vi.fn();
  }

  // private mockPartyMessages(messages): void {
  //   messages.forEach((message) => {
  //   const msg = Reflect.construct(Message, [
  //       this.client,
  //       {
  //       id: BigInt(10),
  //       type: "DEFAULT",
  //       content: '',
  //       author: this.user,
  //       webhook_id: null,
  //       member: this.guildMember,
  //       pinned: false,
  //       tts: false,
  //       nonce: "nonce",
  //       embeds: [message.embed],
  //       attachments: [],
  //       edited_timestamp: null,
  //       reactions: [],
  //       mentions: [],
  //       mention_roles: [],
  //       mention_everyone: [],
  //       hit: false,
  //       },
  //       this.botPartyTextChannel
  //     ]);
  //     msg.channelId = this.botPartyTextChannel.id
  //     this.botPartyTextChannel.messages.cache.set(msg.id, msg)
  //   })
  // }

  private mockMessage(content): void {
    this.message = Reflect.construct(Message, [
      this.client,
      {
        id: BigInt(10),
        type: "DEFAULT",
        content: content,
        author: this.user,
        webhook_id: null,
        member: this.guildMember,
        pinned: false,
        tts: false,
        nonce: "nonce",
        embeds: [],
        attachments: [],
        edited_timestamp: null,
        reactions: [],
        mentions: [],
        mention_roles: [],
        mention_everyone: [],
        hit: false,
      },
      this.textChannel
    ]);
    this.message.react = vi.fn()
  }

  private mockInteracion(command): void {
    if (!command) return
    this.interaction = Reflect.construct(CommandInteraction, [
      this.client,
        {
          data: command,
          id: BigInt(1),
          user: this.guildMember,
        }
      ]
    );
    this.interaction.reply = vi.fn();
    this.interaction.guildId = this.guild.id
    this.interaction.isCommand = vi.fn(() => true)
    this.interaction.member = this.getGuildMember();
  }

  private mockVoiceState( ): void {
    this.voiceState = Reflect.construct(VoiceState, [
      this.guild,
      {
        id: 'voice-state-id',
        channel_id: this.voiceChannel.id,
        user_id: this.user.id,
      }
    ]);
  }

  private mockPresence(activities): void {
    this.presence = Reflect.construct(Presence, [
      this.client,
      {
        user: this.user,
        guild: this.guild,
        status: 'offline',
        activities: activities ? activities : []
      }
    ])
    // console.log(activities, 'activites');
    // console.log(this.presence, 'mockPresence');
  }

}