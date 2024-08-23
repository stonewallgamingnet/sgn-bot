import { it, describe, expect, afterAll, beforeAll, afterEach, only, vi } from 'vitest';
import MockDiscord from '../../tests/mockDiscord';
import voiceStateUpdate from './voiceStateUpdate';
import { PermissionsBitField } from 'discord.js';


// previous code that i removed and added to mockDiscord, here in case that ever causes a problem
// mockDiscord.getGuild().presences.resolve = vi.fn(() => mockDiscord.getPresence());
// const presenceSpy = vi.spyOn(mockDiscord.getGuild().presences, 'resolve').mockReturnValue(mockDiscord.getPresence());
// const channelSpy = vi.spyOn(mockDiscord.getGuild().channels, 'resolve').mockImplementation((id) => {
//     if(id === mockDiscord.getVoiceChannel().id) { 
//         return mockDiscord.getVoiceChannel(); 
//     }
    
//     if(id === mockDiscord.getCategory().id) {
//         return mockDiscord.getCategory();
//     }
// });

afterEach(() => {
    vi.restoreAllMocks();
});

it('updates channel name when someone joins', async () => {
    const options = { 
        presence: { 
            activities: [
                {
                    type: 0, 
                    name: 'Test Game' 
                }
            ]
        },
        category: {
            name: '🥇 TEAM UP - EMPTY'
        }
    };

    const mockDiscord = new MockDiscord(options);
    const voiceState = mockDiscord.getVoiceState();
    process.env.TEAM_UP_CHANNEL_IDS = mockDiscord.getVoiceChannel().id;

    mockDiscord.getVoiceChannel().permissionsFor = vi.fn().mockImplementation(() => {
        return new PermissionsBitField().add('Connect');
    });
    
    const setNameSpy = vi.spyOn(mockDiscord.getCategory(), 'setName').mockResolvedValue(mockDiscord.getCategory());

    await voiceStateUpdate.execute({}, voiceState);

    expect(setNameSpy).toBeCalled();
    expect(setNameSpy).toBeCalledWith(options.category.name.replace('EMPTY', 'Test Game'));
});

it('updates channel name when someone joins', async () => {
    const options = { 
        presence: { 
            activities: [
                {
                    type: 0, 
                    name: 'This is a really long game name that needs to be truncated like really long it has to be over 100 chars.' 
                }
            ]
        },
        category: {
            name: '🥇 TEAM UP - EMPTY'
        }
    };

    const mockDiscord = new MockDiscord(options);
    const voiceState = mockDiscord.getVoiceState();
    process.env.TEAM_UP_CHANNEL_IDS = mockDiscord.getVoiceChannel().id;

    mockDiscord.getVoiceChannel().permissionsFor = vi.fn().mockImplementation(() => {
        return new PermissionsBitField().add('Connect');
    });
    
    const setNameSpy = vi.spyOn(mockDiscord.getCategory(), 'setName').mockResolvedValue(mockDiscord.getCategory());

    await voiceStateUpdate.execute({}, voiceState);

    expect(setNameSpy).toBeCalled();
    expect(setNameSpy).toBeCalledWith("🥇 TEAM UP - This is a really long game name that needs to be truncated like really long it has to b");
});

it('doesnt update channel name when someone joins if no game', async () => {
    const options = { 
        presence: {},
        category: {
            name: '🥇 TEAM UP - EMPTY'
        }
    };

    const mockDiscord = new MockDiscord(options);
    const voiceState = mockDiscord.getVoiceState();
    process.env.TEAM_UP_CHANNEL_IDS = mockDiscord.getVoiceChannel().id;
  
    const setNameSpy = vi.spyOn(mockDiscord.getCategory(), 'setName').mockResolvedValue(mockDiscord.getCategory());

    await voiceStateUpdate.execute({}, voiceState);

    expect(setNameSpy).not.toBeCalled();
});

it('updates channel name if no one is left in the channel', async () => {
    const options = { 
        category: {
            name: '🥇 TEAM UP - Test Game'
        }
    };

    const mockDiscord = new MockDiscord(options);
    const voiceState = mockDiscord.getVoiceState();
    process.env.TEAM_UP_CHANNEL_IDS = mockDiscord.getVoiceChannel().id;

    // we have to remove the voice state from the cache so discord thinks no one is in the channel
    mockDiscord.getGuild().voiceStates.cache.delete(mockDiscord.getVoiceState().id);

    mockDiscord.getVoiceChannel().permissionsFor = vi.fn().mockImplementation(() => {
        return new PermissionsBitField().add('Connect');
    });

    const setNameSpy = vi.spyOn(mockDiscord.getCategory(), 'setName').mockResolvedValue(mockDiscord.getCategory());

    await voiceStateUpdate.execute(voiceState, {});

    expect(setNameSpy).toBeCalled();
    expect(setNameSpy).toBeCalledWith(options.category.name.replace('Test Game', 'EMPTY'));
});

it("doesn't update channel name if someone is left in the channel", async () => {
    const options = { 
        presence: {},
        category: {
            name: '🥇 TEAM UP - Test Game'
        }
    };

    const mockDiscord = new MockDiscord(options);
    const voiceState = mockDiscord.getVoiceState();
    process.env.TEAM_UP_CHANNEL_IDS = mockDiscord.getVoiceChannel().id;

    const setNameSpy = vi.spyOn(mockDiscord.getCategory(), 'setName').mockResolvedValue(mockDiscord.getCategory());

    await voiceStateUpdate.execute(voiceState, {});

    expect(setNameSpy).not.toBeCalled();
});