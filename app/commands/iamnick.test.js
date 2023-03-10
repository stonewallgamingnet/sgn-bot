import { it, expect, describe, vi } from 'vitest';
import iamnick from './iamnick';
import { executeCommandAndSpyReply, mockInteractionAndSpyReply } from '../../tests/testutils';

describe('IamNick Command', () => {

    it('replies Interuder Alert when called by unknown user', async () => {
        const command = {"id": "iamnick", "name": "iamnick", "type": 1};

        const spy = await executeCommandAndSpyReply(iamnick, command);
        expect(spy).toHaveBeenCalledTimes(1);
        expect(spy).toHaveBeenCalledWith('Intruder Alert! Imposter Identified!!');
    });

    it('replies yes you are nick when user id is nick\'s', () => {
        const command = {"id": "iamnick", "name": "iamnick", "type": 1};
        const {interaction, spy} = mockInteractionAndSpyReply(command);

        interaction.user.id = '162954397658120192';

        iamnick.execute(interaction);

        expect(spy).toHaveBeenCalledOnce();
        expect(spy).toHaveBeenCalledWith('Yes, you\'re Nick!')
    });

    it('replies you are halish with halishs id', () => {
        const command = {"id": "iamnick", "name": "iamnick", "type": 1};
        const {interaction, spy} = mockInteractionAndSpyReply(command);

        interaction.user.id = '161193235790692353';

        iamnick.execute(interaction);

        expect(spy).toHaveBeenCalledOnce();
        expect(spy).toHaveBeenCalledWith('You are Halish, not Nick!')
    });

});