import { it, expect, describe, vi } from 'vitest';
import hello from './hello';
import { executeCommandAndSpyReply } from '../../tests/testutils';

describe('HelloCommand', () => {

    it('replies with hello @user', async () => {

        const command = {"id": "hello", "name": "hello", "type": 1};

        const spy = await executeCommandAndSpyReply(hello, command);
        expect(spy).toHaveBeenCalledTimes(1);
        expect(spy).toHaveBeenCalledWith('Hello <@user-id> 💖!');
    });

});