import { ObjectInitialiserMember } from 'decaffeinate-parser/dist/nodes';
import ObjectBodyMemberPatcher from './ObjectBodyMemberPatcher';
/**
 * Handles object properties.
 */
export default class ObjectInitialiserMemberPatcher extends ObjectBodyMemberPatcher {
    node: ObjectInitialiserMember;
    setAssignee(): void;
    patchAsProperty(): void;
    /**
     * @private
     */
    patchAsShorthand({ expand }: {
        expand: boolean;
    }): void;
}
